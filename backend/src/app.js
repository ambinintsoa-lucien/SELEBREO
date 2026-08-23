import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";

import { globalRateLimiter } from "./middleware/rateLimiters.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import voteRoutes from "./routes/vote.routes.js";
import rankingRoutes from "./routes/ranking.routes.js";
import duelRoutes from "./routes/duel.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import moderationRoutes from "./routes/moderation.routes.js";
import reportRoutes from "./routes/report.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

export const app = express();

// Sécurité de base + logs + CORS restreint à l'origine du frontend
// crossOriginResourcePolicy désactivé sur les fichiers statiques (uploads) pour que
// le frontend (autre origine en dev) puisse afficher les vidéos.
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
const allowedOrigins = [
  "https://selebreo.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans Origin
      // (Postman, certains outils backend, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origine non autorisée par CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(globalRateLimiter);

app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/duels", duelRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
