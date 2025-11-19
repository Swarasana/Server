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
      const data = await UserService.login(
        req.body.username,
        req.body.password
      );
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
}
