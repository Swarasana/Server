import { Router } from "express";
import {
  getLevels,
  getLevelById,
  getLevelByPoints,
} from "../controllers/levelController";

const router = Router();

router.get("/", getLevels);
router.get("/:id", getLevelById);
router.get("/points/:points", getLevelByPoints);

export default router;
