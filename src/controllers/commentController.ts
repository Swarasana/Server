import { Request, Response, NextFunction } from "express";
import { CommentService } from "../services/commentService";
import { ApiResponse } from "../types";
import { BadRequestError, NotFoundError } from "../utils/errors";

export const likeComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Comment ID is required");
    }

    const comment = await CommentService.likeComment(id);

    const response: ApiResponse = {
      success: true,
      data: comment,
      message: "Comment liked successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getCommentText = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Comment ID is required");
    }

    const commentText = await CommentService.getCommentText(id);

    if (!commentText) {
      throw new NotFoundError("Comment");
    }

    const response: ApiResponse = {
      success: true,
      data: { text: commentText },
      message: "Comment text fetched successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getCommentCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Comment ID is required");
    }
    const commentCollection = await CommentService.getCommentCollection(id);
    if (!commentCollection) {
      throw new NotFoundError("Comment");
    }

    const response: ApiResponse = {
      success: true,
      data: commentCollection,
      message: "Comment and collection fetched successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
