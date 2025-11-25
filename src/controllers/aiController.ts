import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import multer from "multer";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY || "";

// Configure multer for file uploads (memory storage for STT)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Multer for TTS (no file upload, just form fields)
const ttsMulter = multer();

/**
 * TTS Proxy - Forward TTS request to AI service and stream response
 * Fast streaming - no buffering, direct proxy
 */
export const ttsProxyMiddleware = ttsMulter.none();
export const ttsProxy = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { text, lang, voice, voice_type, format_ } = req.body;

    if (!text) {
      const response: ApiResponse = {
        success: false,
        error: "Text is required",
      };
      res.status(400).json(response);
      return;
    }

    // Create FormData for AI service
    const FormData = (await import("form-data")).default;
    const formData = new FormData();
    formData.append("text", text);
    formData.append("lang", lang || "id-ID");
    if (voice) formData.append("voice", voice);
    if (voice_type) formData.append("voice_type", voice_type);
    formData.append("format_", format_ || "ogg");

    // Get headers from form-data
    const formHeaders = formData.getHeaders();
    
    // Use node-fetch for better form-data support (same as STT)
    const fetch = (await import("node-fetch")).default;
    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/v1/tts`, {
      method: "POST",
      headers: {
        ...formHeaders,
        "X-API-Key": AI_SERVICE_API_KEY,
      },
      body: formData as any,
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI Service error: ${aiResponse.status} - ${errorText}`);
    }

    // Get content type from AI service
    const contentType = aiResponse.headers.get("content-type") || "audio/ogg";

    // Stream audio directly to client (fast, no buffering)
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

    // Stream response directly (fast!)
    const audioBuffer = await aiResponse.arrayBuffer();
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    next(error);
  }
};

/**
 * STT Proxy - Forward STT request to AI service
 */
export const sttProxy = upload.single("file");
export const sttProxyHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!(req as any).file) {
      const response: ApiResponse = {
        success: false,
        error: "Audio file is required",
      };
      res.status(400).json(response);
      return;
    }

    // Don't send encoding if not provided - let AI service auto-detect
    const encoding = req.body.encoding && req.body.encoding !== "" ? req.body.encoding : undefined;
    const sample_rate = req.body.sample_rate 
      ? parseInt(req.body.sample_rate.toString(), 10) 
      : undefined;
    const lang = req.body.lang || "id-ID";

    // Create FormData for AI service
    const FormData = (await import("form-data")).default;
    const formData = new FormData();
    
    // Append file buffer - form-data expects Buffer or Stream
    // Important: Don't use Buffer.from() here, use the buffer directly
    formData.append("file", (req as any).file.buffer, {
      filename: (req as any).file.originalname || "audio.ogg",
      contentType: (req as any).file.mimetype || "audio/ogg",
    });
    
    // Append other form fields - only send encoding if provided
    // FastAPI will use empty string default if not sent, which routes.py handles correctly
    if (encoding) {
      formData.append("encoding", encoding);
    }
    if (sample_rate && !isNaN(sample_rate)) {
      formData.append("sample_rate", sample_rate.toString());
    }
    formData.append("lang", lang);

    // Get headers from form-data (includes boundary and content-type)
    const formHeaders = formData.getHeaders();
    
    // Use node-fetch for better form-data support
    const fetch = (await import("node-fetch")).default;
    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/v1/stt`, {
      method: "POST",
      headers: {
        ...formHeaders,
        "X-API-Key": AI_SERVICE_API_KEY,
      },
      body: formData as any,
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI Service error: ${aiResponse.status} - ${errorText}`);
    }

    const data = await aiResponse.json();

    const response: ApiResponse = {
      success: true,
      data: data,
      message: "Speech transcribed successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

