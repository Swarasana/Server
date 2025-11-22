import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { MerchService } from "../services/merchService";

export const getMerch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const merch = await MerchService.getMerch();

    const response: ApiResponse = {
      success: true,
      data: merch,
      message: "Merchandises fetched successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
