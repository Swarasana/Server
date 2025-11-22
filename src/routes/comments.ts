import { Router } from "express";
import { likeComment, getCommentText } from "../controllers/commentController";

const router = Router();

router.put("/:id/like", likeComment);
router.get("/:id/text", getCommentText);

export default router;
