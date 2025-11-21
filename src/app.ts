import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

import collectionsRoutes from "./routes/collections";
import commentsRoutes from "./routes/comments";
import exhibitionsRoutes from "./routes/exhibitions";
import levelRoutes from "./routes/levels";
import userRoutes from "./routes/users";
import visitorsRoutes from "./routes/visitors";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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

app.get("/api", (_, res) => {
  res.json({
    success: true,
    endpoints: {
      health: "/health",
      collections: "/api/collections",
      comments: "/api/comments",
      exhibitions: "/api/exhibitions",
      levels: "/api/levels",
    },
    documentation: {
      collections: {
        "GET /api/collections/:id": "Get collection details",
        "GET /api/collections/:id/comments": "Get collection comments (paginated)",
        "POST /api/collections/:id/comments": "Add comment to collection",
        "PUT /api/collections/:id/like": "Like a collection",
        "GET /api/collections/:id/ai-summary": "Get AI summary for TTS",
      },
      comments: {
        "PUT /api/comments/:id/like": "Like a comment",
        "GET /api/comments/:id/text": "Get comment text for TTS",
      },
      exhibitions: {
        "GET /api/exhibitions": "Get all exhibitions (paginated)",
        "GET /api/exhibitions/:id": "Get exhibition details",
        "GET /api/exhibitions/:id/collections": "Get collections in exhibition (paginated)",
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
        "POST /api/visitors/collections/:id/visit": "Record visit to collection",
        "GET /api/visitors/collections/:id/visitor-count": "Get visitor count",
        "GET /api/visitors/collections/:id/analytics": "Get visit analytics (curator only)",
        "GET /api/visitors/trending": "Get trending collections",
      },
    },
  });
});

app.use("/api/collections", collectionsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/exhibitions", exhibitionsRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/users", userRoutes);
app.use("/api/visitors", visitorsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
