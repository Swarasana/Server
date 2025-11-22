import { Merch } from "../types";
import { MerchRepository } from "../repositories/merchRepository";

export class MerchService {
  static async getMerch(): Promise<Merch[]> {
    return await MerchRepository.getAll();
  }
}
