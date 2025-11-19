import { Exhibition, Collection, ExhibitionSearchParams, CollectionSearchParams, PaginatedResponse } from '../types';
import { ExhibitionRepository } from '../repositories/exhibitionRepository';

export class ExhibitionService {
  static async getAll(params: ExhibitionSearchParams): Promise<PaginatedResponse<Exhibition>> {
    return await ExhibitionRepository.findAll(params);
  }

  static async getById(id: string): Promise<Exhibition | null> {
    return await ExhibitionRepository.findById(id);
  }

  static async getCollections(
    exhibitionId: string,
    params: CollectionSearchParams
  ): Promise<PaginatedResponse<Collection>> {
    // Check if exhibition exists first
    const exhibition = await ExhibitionRepository.findById(exhibitionId);
    if (!exhibition) {
      throw new Error('Exhibition not found');
    }

    return await ExhibitionRepository.findCollectionsByExhibitionId(exhibitionId, params);
  }
}