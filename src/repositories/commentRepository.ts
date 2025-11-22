import { supabase } from "../config/supabase";
import {
  Comment,
  CommentCollection,
  CommentSearchParams,
  PaginatedResponse,
} from "../types";
import {
  parseCursor,
  generateCursor,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from "../utils/pagination";

export class CommentRepository {
  static async findByCollectionId(
    collectionId: string,
    params: CommentSearchParams
  ): Promise<PaginatedResponse<Comment>> {
    const limit = Math.min(params.limit || DEFAULT_LIMIT, MAX_LIMIT);

    let query = supabase
      .from("comments")
      .select("*")
      .eq("collection_id", collectionId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit + 1);

    // Apply search filter
    if (params.q) {
      const searchTerm = `%${params.q}%`;
      query = query.or(
        `comment_text.ilike.${searchTerm},username.ilike.${searchTerm}`
      );
    }

    // Apply cursor pagination
    if (params.cursor) {
      const parsed = parseCursor(params.cursor);
      if (parsed) {
        query = query.or(
          `created_at.lt.${parsed.createdAt},and(created_at.eq.${parsed.createdAt},id.lt.${parsed.id})`
        );
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, -1) : data;
    const nextCursor =
      hasMore && items.length > 0
        ? generateCursor(
            items[items.length - 1]!.created_at,
            items[items.length - 1]!.id
          )
        : null;

    return {
      data: items,
      pagination: {
        nextCursor,
        hasMore,
      },
    };
  }

  static async create(
    collectionId: string,
    username: string,
    userPicUrl: string | null,
    commentText: string
  ): Promise<Comment> {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        collection_id: collectionId,
        username,
        user_pic_url: userPicUrl,
        comment_text: commentText,
        likes_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findById(commentId: string): Promise<Comment | null> {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("id", commentId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data;
  }

  static async incrementLikes(commentId: string): Promise<Comment> {
    const { data: currentData, error: fetchError } = await supabase
      .from("comments")
      .select("likes_count")
      .eq("id", commentId)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from("comments")
      .update({
        likes_count: currentData.likes_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getCommentText(commentId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("comments")
      .select("comment_text")
      .eq("id", commentId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data?.comment_text || null;
  }
}
