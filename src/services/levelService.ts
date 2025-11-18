import { Level } from "../types";
import { LevelRepository } from "../repositories/levelRepository";

export class LevelService {
  static async getLevels(): Promise<Level[]> {
    return await LevelRepository.getAll();
  }

  static async getLevelById(id: string): Promise<Level | null> {
    return await LevelRepository.getById(id);
  }

  static async getLevelByPoints(points: number): Promise<Level | null> {
    return await LevelRepository.getByPoints(points);
  }
}
