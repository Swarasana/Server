import { Request, Response } from "express";
import { UserService } from "../services/userService";

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const data = await UserService.register(req.body);
      return res.json({ success: true, ...data });
    } catch (e: any) {
      return res.status(400).json({ success: false, message: e.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      if (!req.body) throw new Error("Missing request body");

      const { username, password } = req.body;

      if (!username || !password)
        throw new Error("Masukkan username dan password Anda.");

      const data = await UserService.login(username, password);
      return res.json({ success: true, ...data });
    } catch (e: any) {
      return res.status(400).json({ success: false, message: e.message });
    }
  }

  static async getProfile(req: Request, res: Response) {
    const userId = (req as any).userId;
    const user = await UserService.getProfile(userId);
    return res.json({ success: true, user });
  }

  static async editProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const updated = await UserService.editProfile(userId, req.body);
      return res.json({ success: true, user: updated });
    } catch (e: any) {
      return res.status(400).json({ success: false, message: e.message });
    }
  }

  static async addPoints(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { points } = req.body;

      if (!points || typeof points !== "number") {
        return res
          .status(400)
          .json({ success: false, message: "Points must be a number" });
      }

      const updated = await UserService.addPoints(userId, points);
      return res.json({ success: true, user: updated });
    } catch (e: any) {
      return res.status(400).json({ success: false, message: e.message });
    }
  }
}
