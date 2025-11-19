import { Level } from "../types";
import bcrypt from "bcrypt";
import { LevelRepository } from "../repositories/levelRepository";
import { UserRepository } from "../repositories/userRepository";
import { generateToken } from "../utils/jwt";

export class UserService {
  static async register(data: any) {
    const existing = await UserRepository.findById(data.username);
    if (existing) throw new Error("Username already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await UserRepository.create({
      ...data,
      password: hashedPassword,
    });

    const token = generateToken(user.id);
    return { user, token };
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
