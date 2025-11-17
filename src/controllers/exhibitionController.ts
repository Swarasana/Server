import { Request, Response, NextFunction } from 'express';
import { ExhibitionService } from '../services/exhibitionService';
import { ApiResponse, PaginationParams } from '../types';

export const getExhibitions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { cursor, limit } = req.query;

    const paginationParams: PaginationParams = {
      cursor: cursor as string
    };
    
    if (limit) {
      paginationParams.limit = parseInt(limit as string);
    }

    const result = await ExhibitionService.getAll(paginationParams);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Exhibitions fetched successfully'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getExhibition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Exhibition ID is required'
      };
      res.status(400).json(response);
      return;
    }
    
    const exhibition = await ExhibitionService.getById(id);
    
    if (!exhibition) {
      const response: ApiResponse = {
        success: false,
        error: 'Exhibition not found'
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: exhibition,
      message: 'Exhibition fetched successfully'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getExhibitionCollections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Exhibition ID is required'
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

    const result = await ExhibitionService.getCollections(id, paginationParams);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Exhibition collections fetched successfully'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};