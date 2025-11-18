import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { LevelService } from "../services/levelService";

export const getLevels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const levels = await LevelService.getLevels();

    const response: ApiResponse = {
      success: true,
      data: levels,
      message: "Levels fetched successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getLevelById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) throw new BadRequestError("Level ID is required");

    const level = await LevelService.getLevelById(id);
    if (!level) throw new NotFoundError("Level");

    const response: ApiResponse = {
      success: true,
      data: level,
      message: "Level fetched successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getLevelByPoints = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const points = Number(req.params.points);
    if (isNaN(points)) throw new BadRequestError("Points must be a number");

    const level = await LevelService.getLevelByPoints(points);
    if (!level) throw new NotFoundError("Level points");

    const response: ApiResponse = {
      success: true,
      data: level,
      message: "Level fetched successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
