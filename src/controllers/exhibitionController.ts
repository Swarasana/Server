import { Request, Response, NextFunction } from "express";
import { ExhibitionService } from "../services/exhibitionService";
import {
  ApiResponse,
  ExhibitionSearchParams,
  CollectionSearchParams,
} from "../types";
import { BadRequestError, NotFoundError } from "../utils/errors";

export const getExhibitions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { cursor, limit, q, curator, curatorId } = req.query;

    const searchParams: ExhibitionSearchParams = {
      cursor: cursor as string,
      q: q as string,
      curator: curator as string,
      curatorId: curatorId as string,
    };

    if (limit) {
      searchParams.limit = parseInt(limit as string);
    }

    const result = await ExhibitionService.getAll(searchParams);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: "Exhibitions fetched successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getExhibition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Exhibition ID is required");
    }

    const exhibition = await ExhibitionService.getById(id);

    if (!exhibition) {
      throw new NotFoundError("Exhibition");
    }

    const response: ApiResponse = {
      success: true,
      data: exhibition,
      message: "Exhibition fetched successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getExhibitionCollections = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Exhibition ID is required");
    }

    const { cursor, limit, q, artist } = req.query;

    const searchParams: CollectionSearchParams = {
      cursor: cursor as string,
      q: q as string,
      artist: artist as string,
    };

    if (limit) {
      searchParams.limit = parseInt(limit as string);
    }

    const result = await ExhibitionService.getCollections(id, searchParams);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: "Exhibition collections fetched successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createExhibition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await ExhibitionService.create(req.body);
    res.json({ success: true, data, message: "Exhibition created" });
  } catch (error) {
    next(error);
  }
};

export const updateExhibition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Exhibition ID is required");
    }

    // Validate exhibition exists
    const existingExhibition = await ExhibitionService.getById(id);
    if (!existingExhibition) {
      throw new NotFoundError("Exhibition");
    }

    const data = await ExhibitionService.update(id, req.body);
    res.json({ success: true, data, message: "Exhibition updated" });
  } catch (error) {
    next(error);
  }
};

export const addCollectionToExhibition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params; // exhibition id
    if (!id) {
      throw new BadRequestError("Exhibition ID is required");
    }

    // Validate exhibition exists
    const exhibition = await ExhibitionService.getById(id);
    if (!exhibition) {
      throw new NotFoundError("Exhibition");
    }

    const data = await ExhibitionService.addCollection(id, req.body);
    res.json({
      success: true,
      data,
      message: "Collection added to exhibition",
    });
  } catch (error) {
    next(error);
  }
};

export const addCollectionsInBulk = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params; // exhibition id
    if (!id) {
      throw new BadRequestError("Exhibition ID is required");
    }

    // Validate exhibition exists
    const exhibition = await ExhibitionService.getById(id);
    if (!exhibition) {
      throw new NotFoundError("Exhibition");
    }

    const data = await ExhibitionService.addCollectionsBulk(
      id,
      req.body.collectionIds,
      req.body.startDte,
      req.body.endDate
    );
    res.json({ success: true, data, message: "Collections added in bulk" });
  } catch (error) {
    next(error);
  }
};
