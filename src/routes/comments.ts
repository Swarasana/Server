import { Router } from "express";
import {
  likeComment,
  getCommentText,
  getCommentCollection,
} from "../controllers/commentController";

const router = Router();

router.put("/:id/like", likeComment);
router.get("/:id/text", getCommentText);
router.get("/:id/collection", getCommentCollection);

export default router;
