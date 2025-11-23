import crypto from "crypto";
import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/userRepository";
import { generateToken } from "../utils/jwt";
import { LevelRepository } from "../repositories/levelRepository";
import { ExhibitionRepository } from "../repositories/exhibitionRepository";

export class UserService {
  static async register(data: any) {
    const existing = await UserRepository.findByUsername(data.username);
    if (existing) throw new Error("Username already exists");

    const id = crypto.randomUUID();

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await UserRepository.create({
      id: id,
      username: data.username,
      display_name: data.display_name,
      user_pic_url: data.user_pic_url ?? null,
      role: data.role ?? "visitor",
      password: hashedPassword,
      points: 0,
    });

    return { user };
  }

  static async login(username: string, password: string) {
    const user = await UserRepository.findByUsername(username);
    if (!user) throw new Error("Username atau password salah");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Username atau password salah");

    const token = generateToken(user.id);
    return { user, token };
  }

  static async getProfile(userId: string) {
    const user = await UserRepository.findById(userId);

    if (!user) return null;

    let comments = null;
    let level = null;

    if (user.role == "visitor") {
      comments = await UserRepository.getUserComments(user.username);
      level = await LevelRepository.getByPoints(user.points);
    }

    return {
      ...user,
      level,
      comments,
    };
  }

  static async editProfile(userId: string, data: any) {
    return await UserRepository.update(userId, data);
  }

  static async addPoints(userId: string, points: number) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const newPoints = (user.points || 0) + points;

    return await UserRepository.update(userId, { points: newPoints });
  }
}
