import { supabase } from '../config/supabase';
import { VisitorLog, UserVisitedCollection } from '../types';

export class VisitorRepository {
  /**
   * Create a visitor log entry (with deduplication via UNIQUE constraint)
   * Supports both authenticated and anonymous users
   */
  static async createVisitorLog(
    collectionId: string,
    visitorFingerprint: string,
    sessionId?: string,
    userId?: string
  ): Promise<VisitorLog | null> {
    const { data, error } = await supabase
      .from('visitor_logs')
      .insert({
        collection_id: collectionId,
        visitor_fingerprint: visitorFingerprint,
        session_id: sessionId || null,
        user_id: userId || null
      })
      .select()
      .single();

    if (error) {
      // If it's a duplicate constraint error, return null (not a new visit)
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        return null;
      }
      throw error;
    }

    return data;
  }

  /**
   * Increment visitor count for a collection
   */
  static async incrementVisitorCount(collectionId: string): Promise<void> {
    // First get current count, then increment
    const { data: currentData, error: fetchError } = await supabase
      .from('collections')
      .select('visitor_count')
      .eq('id', collectionId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('collections')
      .update({ 
        visitor_count: (currentData.visitor_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', collectionId);

    if (error) throw error;
  }

  /**
   * Get visitor count for a collection
   */
  static async getVisitorCount(collectionId: string): Promise<number> {
    const { data, error } = await supabase
      .from('collections')
      .select('visitor_count')
      .eq('id', collectionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return 0; // Not found
      throw error;
    }

    return data?.visitor_count || 0;
  }

  /**
   * Get visit count for analytics
   */
  static async getVisitCount(
    collectionId: string,
    startDate?: string,
    endDate?: string
  ): Promise<number> {
    let query = supabase
      .from('visitor_logs')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', collectionId);

    if (startDate) {
      query = query.gte('visited_at', startDate);
    }
    if (endDate) {
      query = query.lte('visited_at', endDate);
    }

    const { count, error } = await query;
    
    if (error) throw error;
    return count || 0;
  }

  /**
   * Get trending collections based on recent visits
   */
  static async getTrendingCollections(
    limit: number = 10,
    daysAgo: number = 3
  ): Promise<Array<{ collection_id: string; recent_visits: number }>> {
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('visitor_logs')
      .select('collection_id')
      .gte('visited_at', startDate);

    if (error) throw error;

    // Count visits per collection
    const visitCounts = data.reduce((acc: Record<string, number>, log) => {
      acc[log.collection_id] = (acc[log.collection_id] || 0) + 1;
      return acc;
    }, {});

    // Sort by visit count and return top collections
    return Object.entries(visitCounts)
      .map(([collection_id, recent_visits]) => ({ collection_id, recent_visits }))
      .sort((a, b) => b.recent_visits - a.recent_visits)
      .slice(0, limit);
  }

  /**
   * Get collections visited by a specific user (authenticated users only)
   */
  static async getUserVisitedCollections(
    userId: string,
    limit: number = 50
  ): Promise<UserVisitedCollection[]> {
    const { data, error } = await supabase
      .from('visitor_logs')
      .select(`
        visited_at,
        collections!inner (
          id,
          name,
          picture_url,
          artist_name
        )
      `)
      .eq('user_id', userId)
      .order('visited_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Transform the data and deduplicate by collection ID (keep most recent visit)
    const visitedCollections = new Map<string, UserVisitedCollection>();
    
    data.forEach((visit: any) => {
      const collection = visit.collections;
      if (collection && !visitedCollections.has(collection.id)) {
        visitedCollections.set(collection.id, {
          id: collection.id,
          name: collection.name,
          picture_url: collection.picture_url,
          artist_name: collection.artist_name,
          visited_at: visit.visited_at
        });
      }
    });

    return Array.from(visitedCollections.values());
  }
}