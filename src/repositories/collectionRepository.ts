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
}
