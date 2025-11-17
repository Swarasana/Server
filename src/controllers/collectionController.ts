import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../services/collectionService';
import { ApiResponse, PaginationParams } from '../types';
import { generateGuestUsername } from '../utils/guestUser';

export const getCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Collection ID is required'
      };
      res.status(400).json(response);
      return;
    }

    const userRole = req.headers['x-user-role'] as string || 'visitor';
    
    const collection = await CollectionService.getById(id);
    
    if (!collection) {
      const response: ApiResponse = {
        success: false,
        error: 'Collection not found'
      };
      res.status(404).json(response);
      return;
    }

    const responseData = {
      ...collection,
      canEdit: userRole === 'curator'
    };

    const response: ApiResponse = {
      success: true,
      data: responseData,
      message: 'Collection fetched successfully'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getCollectionComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Collection ID is required'
      };
      res.status(400).json(response);
      return;
    }

    const { cursor, limit } = req.query;

    const paginationParams: PaginationParams = {
      cursor: cursor as string
    };
    
    if (limit) {
      paginationParams.limit = parseInt(limit as string);
    }

    const result = await CollectionService.getComments(id, paginationParams);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Comments fetched successfully'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Collection ID is required'
      };
      res.status(400).json(response);
      return;
    }

    const { username, user_pic_url, comment_text } = req.body;

    if (!comment_text?.trim()) {
      const response: ApiResponse = {
        success: false,
        error: 'Comment text is required'
      };
      res.status(400).json(response);
      return;
    }

    const finalUsername = username?.trim() || generateGuestUsername();
    
    const comment = await CollectionService.addComment(
      id,
      finalUsername,
      user_pic_url || null,
      comment_text.trim()
    );

    const response: ApiResponse = {
      success: true,
      data: comment,
      message: 'Comment added successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getAiSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Collection ID is required'
      };
      res.status(400).json(response);
      return;
    }
    
    const summaryText = await CollectionService.getAiSummary(id);
    
    if (!summaryText) {
      const response: ApiResponse = {
        success: false,
        error: 'AI summary not found'
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: { text: summaryText },
      message: 'AI summary fetched successfully'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};