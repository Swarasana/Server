import crypto from "crypto";
import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/userRepository";
import { generateToken } from "../utils/jwt";

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
      level_id: data.level_id ?? null,
    });

    return { user };
  }

  static async login(username: string, password: string) {
    const user = await UserRepository.findByUsername(username);
    if (!user) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid credentials");

    const token = generateToken(user.id);
    return { user, token };
  }

  static async getProfile(userId: string) {
    return await UserRepository.findById(userId);
  }

  static async editProfile(userId: string, data: any) {
    return await UserRepository.update(userId, data);
  }
}
