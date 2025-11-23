import { Router } from "express";
import { ttsProxyMiddleware, ttsProxy, sttProxy, sttProxyHandler } from "../controllers/aiController";

const router = Router();

router.post("/tts", ttsProxyMiddleware, ttsProxy);
router.post("/stt", sttProxy, sttProxyHandler);

export default router;

