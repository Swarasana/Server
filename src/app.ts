import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { apiKeyAuth } from "./middleware/apiKey";

import collectionsRoutes from "./routes/collections";
import commentsRoutes from "./routes/comments";
import exhibitionsRoutes from "./routes/exhibitions";
import levelRoutes from "./routes/levels";
import userRoutes from "./routes/users";
import visitorsRoutes from "./routes/visitors";
import merchRoutes from "./routes/merch";
import aiRoutes from "./routes/ai";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// Note: Multer will handle multipart/form-data for /api/ai/stt

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Welcome to Swarasana API",
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: `Server is running`,
    timestamp: new Date().toISOString(),
  });
});

// Handle favicon.ico requests to prevent 404 errors
app.get("/favicon.ico", (_, res) => {
  res.status(204).send();
});

app.get("/api", (_, res) => {
  res.json({
    success: true,
    message: "Swarasana API",
    endpoints: {
      health: "/health",
      collections: "/api/collections",
      comments: "/api/comments",
      exhibitions: "/api/exhibitions",
      levels: "/api/levels",
      users: "/api/users",
      visitors: "/api/visitors",
      merch: "/api/merch",
      ai: "/api/ai"
    },
    documentation: {
      collections: {
        "POST /api/collections": "Create a new collection",
        "GET /api/collections/:id": "Get collection details",
        "PUT /api/collections/:id": "Update collection details",
        "GET /api/collections/:id/comments":
          "Get collection comments (paginated)",
        "POST /api/collections/:id/comments": "Add comment to collection",
        "PUT /api/collections/:id/like": "Like a collection",
        "GET /api/collections/:id/ai-summary": "Get AI summary for TTS",
      },
      comments: {
        "PUT /api/comments/:id/like": "Like a comment",
        "GET /api/comments/:id/text": "Get comment text for TTS",
        "GET /api/comments/:id/collection":
          "Get comment and its collection info",
      },
      exhibitions: {
        "GET /api/exhibitions": "Get all exhibitions (paginated)",
        "POST /api/exhibitions": "Create a new exhibition",
        "GET /api/exhibitions/:id": "Get exhibition details",
        "PUT /api/exhibitions/:id": "Update exhibition details",
        "GET /api/exhibitions/:id/collections":
          "Get collections in exhibition (paginated)",
        "POST /api/exhibitions/:id/collections":
          "Add a collection in exhibition",
        "POST /api/exhibitions/:id/collections/bulk":
          "Add collections (in bulk) in exhibition",
      },
      levels: {
        "GET /api/levels": "Get all levels",
        "GET /api/levels/:id": "Get level details",
        "GET /api/levels/points/:points": "Get levels by points",
      },
      users: {
        "POST /api/users/register": "Register new user",
        "POST /api/users/login": "Login to existing user account",
        "GET /api/users/me": "Get user profile",
        "PUT /api/users/me": "Update user profile",
      },
      visitors: {
        "POST /api/visitors/collections/:id/visit":
          "Record visit to collection",
        "GET /api/visitors/collections/:id/visitor-count": "Get visitor count",
        "GET /api/visitors/collections/:id/analytics":
          "Get visit analytics (curator only)",
        "GET /api/visitors/trending": "Get trending collections",
      },
      merch: {
        "GET /api/merch": "Get all merchandises",
      },
    },
  });
});

// Apply API key authentication to all /api routes
app.use("/api", apiKeyAuth);

app.use("/api/collections", collectionsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/exhibitions", exhibitionsRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/users", userRoutes);
app.use("/api/visitors", visitorsRoutes);
app.use("/api/merch", merchRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
