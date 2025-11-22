import { Comment, CommentCollection } from "../types";
import { CommentRepository } from "../repositories/commentRepository";

export class CommentService {
  static async likeComment(commentId: string): Promise<Comment> {
    // Check if comment exists first
    const comment = await CommentRepository.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    return await CommentRepository.incrementLikes(commentId);
  }

  static async getCommentText(commentId: string): Promise<string | null> {
    return await CommentRepository.getCommentText(commentId);
  }

  static async getCommentCollection(
    commentId: string
  ): Promise<CommentCollection | null> {
    return await CommentRepository.getCommentCollection(commentId);
  }
}
