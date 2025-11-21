import { Router } from "express";
import {
  getCollection,
  getCollectionComments,
  addComment,
  getAiSummary,
  createCollection,
  updateCollection,
} from "../controllers/collectionController";

const router = Router();

router.post("/", createCollection);
router.get("/:id", getCollection);
router.put("/:id", updateCollection);
router.get("/:id/comments", getCollectionComments);
router.post("/:id/comments", addComment);
router.get("/:id/ai-summary", getAiSummary);

export default router;
