import { supabase } from '../config/supabase';
import { Collection } from '../types';

export class CollectionRepository {
  static async findById(id: string): Promise<Collection | null> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  static async incrementLikes(collectionId: string): Promise<Collection> {
    const { data: currentData, error: fetchError } = await supabase
      .from('collections')
      .select('likes_count')
      .eq('id', collectionId)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('collections')
      .update({
        likes_count: currentData.likes_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', collectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAiSummaryText(collectionId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('collections')
      .select('ai_summary_text')
      .eq('id', collectionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data?.ai_summary_text || null;
  }
}