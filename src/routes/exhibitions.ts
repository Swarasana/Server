import { Router } from "express";
import {
  getExhibitions,
  getExhibition,
  getExhibitionCollections,
  createExhibition,
  updateExhibition,
  addCollectionToExhibition,
  addCollectionsInBulk,
} from "../controllers/exhibitionController";

const router = Router();

router.get("/", getExhibitions);
router.post("/", createExhibition);
router.get("/:id", getExhibition);
router.put("/:id", updateExhibition);
router.get("/:id/collections", getExhibitionCollections);
router.post("/:id/collections", addCollectionToExhibition);
router.post("/:id/collections/bulk", addCollectionsInBulk);

export default router;
