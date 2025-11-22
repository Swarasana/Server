import { supabase } from "../config/supabase";
import { CommentCollection, User } from "../types";

export class UserRepository {
  static async findByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data;
  }

  static async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data;
  }

  static async create(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .insert(userData)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async update(
    id: string,
    updates: Partial<User>
  ): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async getUserComments(username: string): Promise<CommentCollection[]> {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
          id,
          comment_text,
          likes_count,
          collection:collection_id!inner (
            id,
            name,
            exhibition_collections (
              exhibition:exhibition_id (
                location
              )
            )
          )
        `
      )
      .eq("username", username);

    if (error) throw error;

    return data.map((c) => {
      const collection = Array.isArray(c.collection)
        ? c.collection[0]
        : c.collection;

      const exhibitionCollection = collection?.exhibition_collections?.[0];
      const exhibition = exhibitionCollection?.exhibition?.[0];

      return {
        id: c.id,
        comment_text: c.comment_text,
        likes_count: c.likes_count,
        collection_id: collection?.id,
        collection_name: collection?.name,
        location: exhibition?.location ?? "",
      };
    });
  }
}
