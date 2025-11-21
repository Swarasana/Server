import { Request, Response, NextFunction } from "express";
import { CollectionService } from "../services/collectionService";
import { ApiResponse, CommentSearchParams } from "../types";
import { generateGuestUsername } from "../utils/guestUser";
import { BadRequestError, NotFoundError } from "../utils/errors";

export const getCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Collection ID is required");
    }

    const userRole = (req.headers["x-user-role"] as string) || "visitor";

    const collection = await CollectionService.getById(id);

    if (!collection) {
      throw new NotFoundError("Collection");
    }

    const responseData = {
      ...collection,
      canEdit: userRole === "curator",
    };

    const response: ApiResponse = {
      success: true,
      data: responseData,
      message: "Collection fetched successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await CollectionService.create(req.body);
    res.json({ success: true, data, message: "Collection created" });
  } catch (error) {
    next(error);
  }
};

export const updateCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("Collection ID is required");

    const data = await CollectionService.update(id, req.body);
    res.json({ success: true, data, message: "Collection updated" });
  } catch (error) {
    next(error);
  }
};

export const getCollectionComments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: "Collection ID is required",
      };
      res.status(400).json(response);
      return;
    }

    const { cursor, limit, q } = req.query;

    const searchParams: CommentSearchParams = {
      cursor: cursor as string,
      q: q as string,
    };

    if (limit) {
      searchParams.limit = parseInt(limit as string);
    }

    const result = await CollectionService.getComments(id, searchParams);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: "Comments fetched successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: "Collection ID is required",
      };
      res.status(400).json(response);
      return;
    }

    const { username, user_pic_url, comment_text } = req.body;

    if (!comment_text?.trim()) {
      throw new BadRequestError("Comment text is required");
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
      message: "Comment added successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const likeCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Collection ID is required");
    }

    const collection = await CollectionService.likeCollection(id);

    const response: ApiResponse = {
      success: true,
      data: collection,
      message: "Collection liked successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getAiSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Collection ID is required");
    }

    const summaryText = await CollectionService.getAiSummary(id);

    if (!summaryText) {
      throw new NotFoundError("AI summary");
    }

    const response: ApiResponse = {
      success: true,
      data: { text: summaryText },
      message: "AI summary fetched successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
