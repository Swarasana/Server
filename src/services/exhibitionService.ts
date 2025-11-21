import {
  Exhibition,
  Collection,
  ExhibitionSearchParams,
  CollectionSearchParams,
  PaginatedResponse,
} from "../types";
import { ExhibitionRepository } from "../repositories/exhibitionRepository";

export class ExhibitionService {
  static async getAll(
    params: ExhibitionSearchParams
  ): Promise<PaginatedResponse<Exhibition>> {
    return await ExhibitionRepository.findAll(params);
  }

  static async getById(id: string): Promise<Exhibition | null> {
    return await ExhibitionRepository.findById(id);
  }

  static async create(body: any) {
    const id = crypto.randomUUID();
    return await ExhibitionRepository.create({
      id,
      name: body.name,
      description: body.description,
      curator_id: body.curator_id,
      curator_name: body.curator_name,
      location: body.location,
      image_url: body.image_url,
    });
  }

  static async update(id: string, body: any) {
    return await ExhibitionRepository.update(id, body);
  }

  static async getCollections(
    exhibitionId: string,
    params: CollectionSearchParams
  ): Promise<PaginatedResponse<Collection>> {
    // Check if exhibition exists first
    const exhibition = await ExhibitionRepository.findById(exhibitionId);
    if (!exhibition) {
      throw new Error("Exhibition not found");
    }

    return await ExhibitionRepository.findCollectionsByExhibitionId(
      exhibitionId,
      params
    );
  }

  static async addCollection(exhibitionId: string, body: any) {
    const row = {
      id: crypto.randomUUID(),
      exhibition_id: exhibitionId,
      collection_id: body.collection_id,
      start_date: body.start_date,
      end_date: body.end_date,
    };

    return await ExhibitionRepository.addCollection(row);
  }

  static async addCollectionsBulk(
    exhibitionId: string,
    collectionIds: string[],
    startDate: string,
    endDate: string
  ) {
    const rows = collectionIds.map((collection_id) => ({
      id: crypto.randomUUID(),
      exhibition_id: exhibitionId,
      collection_id: collection_id,
      start_date: startDate,
      end_date: endDate,
    }));

    return await ExhibitionRepository.addCollectionsBulk(rows);
  }
}
