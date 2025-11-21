import {
  Collection,
  Comment,
  CommentSearchParams,
  PaginatedResponse,
} from "../types";
import { CollectionRepository } from "../repositories/collectionRepository";
import { CommentRepository } from "../repositories/commentRepository";

export class CollectionService {
  static async getById(id: string): Promise<Collection | null> {
    return await CollectionRepository.findById(id);
  }

  static async create(body: any) {
    const id = crypto.randomUUID();
    return await CollectionRepository.create({
      id,
      name: body.name,
      picture_url: body.picture_url,
      artist_name: body.artist_name,
      artist_explanation: body.artist_explanation,
      ai_summary_text: body.ai_summary_text,
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

  static async getAiSummary(collectionId: string): Promise<string | null> {
    return await CollectionRepository.getAiSummaryText(collectionId);
  }
}
