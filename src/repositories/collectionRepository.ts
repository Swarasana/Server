import { supabase } from "../config/supabase";
import { Collection } from "../types";

export class CollectionRepository {
  static async findById(id: string): Promise<Collection | null> {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data;
  }

  static async create(data: any) {
    const { data: row, error } = await supabase
      .from("collections")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return row;
  }

  static async update(id: string, body: any) {
    const { data, error } = await supabase
      .from("collections")
      .update(body)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async incrementLikes(collectionId: string): Promise<Collection> {
    const { data: currentData, error: fetchError } = await supabase
      .from("collections")
      .select("likes_count")
      .eq("id", collectionId)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from("collections")
      .update({
        likes_count: currentData.likes_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", collectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAiSummaryText(collectionId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("collections")
      .select("ai_summary_text")
      .eq("id", collectionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data?.ai_summary_text || null;
  }

  static async getAiSummaryMeta(
    collectionId: string
  ): Promise<{
    ai_summary_text: string | null;
    last_summary_generated_at: string | null;
  } | null> {
    const { data, error } = await supabase
      .from("collections")
      .select("ai_summary_text, last_summary_generated_at")
      .eq("id", collectionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data;
  }

  static async getLatestCommentTimestamp(
    collectionId: string
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from("comments")
      .select("created_at")
      .eq("collection_id", collectionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No comments
      throw error;
    }
    return data?.created_at || null;
  }
}
