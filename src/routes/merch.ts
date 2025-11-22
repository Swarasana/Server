import { Router } from "express";
import { getMerch } from "../controllers/merchController";

const router = Router();

router.get("/", getMerch);

export default router;
