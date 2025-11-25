import {
  Collection,
  Comment,
  CommentSearchParams,
  PaginatedResponse,
} from "../types";
import { CollectionRepository } from "../repositories/collectionRepository";
import { CommentRepository } from "../repositories/commentRepository";
import { triggerSummaryGeneration, getSummarySync } from "./aiService";

import QRCode from "qrcode";
import { supabase } from "../config/supabase";

export class CollectionService {
  static async getById(id: string): Promise<Collection | null> {
    return await CollectionRepository.findById(id);
  }

  static async create(body: any) {
    const id = crypto.randomUUID();

    const qrLink = `${process.env.FRONTEND_URL}/collection/${id}`;
    const qrBuffer = await QRCode.toBuffer(qrLink, { type: "png" });

    const fileName = `collection_${id}.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("qr-codes")
      .upload(fileName, qrBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const qrUrl = supabase.storage.from("qr-codes").getPublicUrl(fileName)
      .data.publicUrl;

    return await CollectionRepository.create({
      id,
      name: body.name,
      picture_url: body.picture_url,
      artist_name: body.artist_name,
      artist_explanation: body.artist_explanation,
      ai_summary_text: body.ai_summary_text,
      qr_code_url: qrUrl,
    });
  }

  static async update(id: string, body: any) {
    return await CollectionRepository.update(id, body);
  }

  static async getComments(
    collectionId: string,
    params: CommentSearchParams
  ): Promise<PaginatedResponse<Comment>> {
    // Check if collection exists first
    const collection = await CollectionRepository.findById(collectionId);
    if (!collection) {
      throw new Error("Collection not found");
    }

    return await CommentRepository.findByCollectionId(collectionId, params);
  }

  static async addComment(
    collectionId: string,
    username: string,
    userPicUrl: string | null,
    commentText: string
  ): Promise<Comment> {
    // Check if collection exists first
    const collection = await CollectionRepository.findById(collectionId);
    if (!collection) {
      throw new Error("Collection not found");
    }

    return await CommentRepository.create(
      collectionId,
      username,
      userPicUrl,
      commentText
    );
  }

  static async getAiSummary(
    collectionId: string,
    forceRefresh: boolean = false
  ): Promise<string | null> {
    // Check if collection exists
    const collection = await CollectionRepository.findById(collectionId);
    if (!collection) {
      throw new Error("Collection not found");
    }

    // Get summary metadata
    const meta = await CollectionRepository.getAiSummaryMeta(collectionId);
    if (!meta) {
      return null;
    }

    const { ai_summary_text, last_summary_generated_at } = meta;

    // If force refresh, trigger generation and return existing or wait
    if (forceRefresh) {
      // Trigger async generation
      triggerSummaryGeneration(collectionId);
      // Return existing summary if available, otherwise return null
      return ai_summary_text;
    }

    // Check if summary exists and is fresh
    if (ai_summary_text && last_summary_generated_at) {
      // Check if summary is stale (newer comments exist)
      const latestCommentTs = await CollectionRepository.getLatestCommentTimestamp(
        collectionId
      );

      if (latestCommentTs) {
        const summaryDate = new Date(last_summary_generated_at);
        const commentDate = new Date(latestCommentTs);

        // If summary is newer than latest comment, return cached
        if (summaryDate > commentDate) {
          return ai_summary_text;
        }
      } else {
        // No comments, return existing summary
        return ai_summary_text;
      }
    }

    // Summary is stale or doesn't exist - trigger generation in background
    // Return existing summary immediately (or null if none exists)
    triggerSummaryGeneration(collectionId);
    return ai_summary_text;
  }

  /**
   * Get AI summary synchronously (waits for generation)
   * Use this only if you really need to wait for the summary
   */
  static async getAiSummarySync(collectionId: string): Promise<string | null> {
    // Check if collection exists
    const collection = await CollectionRepository.findById(collectionId);
    if (!collection) {
      throw new Error("Collection not found");
    }

    return await getSummarySync(collectionId);
  }

  static async likeCollection(collectionId: string): Promise<Collection> {
    // Check if collection exists first
    const collection = await CollectionRepository.findById(collectionId);
    if (!collection) {
      throw new Error("Collection not found");
    }

    return await CollectionRepository.incrementLikes(collectionId);
  }
}
