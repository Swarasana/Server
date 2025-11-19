import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Unauthorized" });

    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const payload = verifyToken(token);
    (req as any).userId = payload.userId;

    return next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
