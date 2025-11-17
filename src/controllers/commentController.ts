import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/commentService';
import { ApiResponse } from '../types';

export const likeComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Comment ID is required'
      };
      res.status(400).json(response);
      return;
    }
    
    const comment = await CommentService.likeComment(id);

    const response: ApiResponse = {
      success: true,
      data: comment,
      message: 'Comment liked successfully'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getCommentText = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Comment ID is required'
      };
      res.status(400).json(response);
      return;
    }
    
    const commentText = await CommentService.getCommentText(id);
    
    if (!commentText) {
      const response: ApiResponse = {
        success: false,
        error: 'Comment not found'
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: { text: commentText },
      message: 'Comment text fetched successfully'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};