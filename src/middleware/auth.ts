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

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      // No auth header - continue as anonymous user
      return next();
    }

    const token = header.split(" ")[1];
    if (!token) {
      // No token - continue as anonymous user
      return next();
    }

    const payload = verifyToken(token);
    (req as any).userId = payload.userId;

    return next();
  } catch (e) {
    // Invalid token - continue as anonymous user (don't fail)
    return next();
  }
};
