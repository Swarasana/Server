import { supabase } from '../config/supabase';
import { Exhibition, Collection, ExhibitionSearchParams, CollectionSearchParams, PaginatedResponse } from '../types';
import { parseCursor, generateCursor, DEFAULT_LIMIT, MAX_LIMIT } from '../utils/pagination';

export class ExhibitionRepository {
  static async findAll(params: ExhibitionSearchParams): Promise<PaginatedResponse<Exhibition>> {
    const limit = Math.min(params.limit || DEFAULT_LIMIT, MAX_LIMIT);
    
    let query = supabase
      .from('exhibitions')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    // Apply search filter
    if (params.q) {
      const searchTerm = `%${params.q}%`;
      query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},curator_name.ilike.${searchTerm}`);
    }

    // Apply curator filter
    if (params.curator) {
      query = query.ilike('curator_name', `%${params.curator}%`);
    }

    // Apply cursor pagination
    if (params.cursor) {
      const parsed = parseCursor(params.cursor);
      if (parsed) {
        query = query.or(`created_at.lt.${parsed.createdAt},and(created_at.eq.${parsed.createdAt},id.lt.${parsed.id})`);
      }
    }

    const { data, error } = await query;
    
    if (error) throw error;

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, -1) : data;
    const nextCursor = hasMore && items.length > 0 
      ? generateCursor(items[items.length - 1]!.created_at, items[items.length - 1]!.id)
      : null;

    return {
      data: items,
      pagination: {
        nextCursor,
        hasMore
      }
    };
  }

  static async findById(id: string): Promise<Exhibition | null> {
    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  static async findCollectionsByExhibitionId(
    exhibitionId: string,
    params: CollectionSearchParams
  ): Promise<PaginatedResponse<Collection>> {
    const limit = Math.min(params.limit || DEFAULT_LIMIT, MAX_LIMIT);
    
    // First, get all collection IDs from the exhibition
    let collectionIdsQuery = supabase
      .from('exhibition_collections')
      .select('collection_id')
      .eq('exhibition_id', exhibitionId);

    const { data: collectionIds, error: idsError } = await collectionIdsQuery;
    if (idsError) throw idsError;

    if (!collectionIds || collectionIds.length === 0) {
      return {
        data: [],
        pagination: {
          nextCursor: null,
          hasMore: false
        }
      };
    }

    // Extract just the IDs
    const ids = collectionIds.map(item => item.collection_id);
    
    // Now query collections directly with filters
    let query = supabase
      .from('collections')
      .select('*')
      .in('id', ids)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    // Apply search filter
    if (params.q) {
      const searchTerm = `%${params.q}%`;
      query = query.or(`name.ilike.${searchTerm},artist_name.ilike.${searchTerm}`);
    }

    // Apply artist filter
    if (params.artist) {
      query = query.ilike('artist_name', `%${params.artist}%`);
    }

    // Apply cursor pagination
    if (params.cursor) {
      const parsed = parseCursor(params.cursor);
      if (parsed) {
        query = query.or(`created_at.lt.${parsed.createdAt},and(created_at.eq.${parsed.createdAt},id.lt.${parsed.id})`);
      }
    }

    const { data, error } = await query;
    
    if (error) throw error;

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, -1) : data;
    const nextCursor = hasMore && items.length > 0 
      ? generateCursor(items[items.length - 1]!.created_at, items[items.length - 1]!.id)
      : null;

    return {
      data: items,
      pagination: {
        nextCursor,
        hasMore
      }
    };
  }
}