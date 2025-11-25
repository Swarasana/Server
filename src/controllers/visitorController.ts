import { Request, Response, NextFunction } from 'express';
import { VisitorService } from '../services/visitorService';
import { CollectionService } from '../services/collectionService';
import { ApiResponse } from '../types';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const recordVisit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError('Collection ID is required');
    }

    // Validate collection exists
    const collection = await CollectionService.getById(id);
    if (!collection) {
      throw new NotFoundError('Collection');
    }

    const { session_id } = req.body;

    const userId = (req as any).userId; // Get user ID from auth middleware (optional)
    const result = await VisitorService.recordVisit(id, req, session_id, userId);

    const response: ApiResponse = {
      success: true,
      data: {
        isNewVisit: result.isNewVisit,
        totalVisitorCount: result.totalCount
      },
      message: result.isNewVisit ? 'Visit recorded successfully' : 'Visit already recorded today'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getVisitorCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError('Collection ID is required');
    }

    // Validate collection exists
    const collection = await CollectionService.getById(id);
    if (!collection) {
      throw new NotFoundError('Collection');
    }

    const visitorCount = await VisitorService.getVisitorCount(id);

    const response: ApiResponse = {
      success: true,
      data: {
        visitorCount
      },
      message: 'Visitor count fetched successfully'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getVisitAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError('Collection ID is required');
    }

    // Validate collection exists
    const collection = await CollectionService.getById(id);
    if (!collection) {
      throw new NotFoundError('Collection');
    }

    /* // Check if user is curator (basic role check)
    const userRole = req.headers['x-user-role'] as string;
    if (userRole !== 'curator') {
      throw new BadRequestError('Analytics access requires curator role');
    } */

    const analytics = await VisitorService.getVisitAnalytics(id);

    const response: ApiResponse = {
      success: true,
      data: analytics,
      message: 'Visit analytics fetched successfully'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getTrendingCollections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 10;

    const trending = await VisitorService.getTrendingCollections(limitNum);

    const response: ApiResponse = {
      success: true,
      data: {
        trending
      },
      message: 'Trending collections fetched successfully'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getUserVisitedCollections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId; // Get user ID from auth middleware
    if (!userId) {
      throw new BadRequestError('Authentication required');
    }

    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 50;

    const visitedCollections = await VisitorService.getUserVisitedCollections(userId, limitNum);

    const response: ApiResponse = {
      success: true,
      data: {
        visitedCollections
      },
      message: 'User visited collections fetched successfully'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};