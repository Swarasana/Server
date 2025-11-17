import { Collection, Comment, PaginationParams, PaginatedResponse } from '../types';
import { CollectionRepository } from '../repositories/collectionRepository';
import { CommentRepository } from '../repositories/commentRepository';

export class CollectionService {
  static async getById(id: string): Promise<Collection | null> {
    return await CollectionRepository.findById(id);
  }

  static async getComments(
    collectionId: string, 
    params: PaginationParams
  ): Promise<PaginatedResponse<Comment>> {
    // Check if collection exists first
    const collection = await CollectionRepository.findById(collectionId);
    if (!collection) {
      throw new Error('Collection not found');
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
      throw new Error('Collection not found');
    }

    return await CommentRepository.create(collectionId, username, userPicUrl, commentText);
  }

  static async getAiSummary(collectionId: string): Promise<string | null> {
    return await CollectionRepository.getAiSummaryText(collectionId);
  }
}