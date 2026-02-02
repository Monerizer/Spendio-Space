import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleAIChat, handleHealthScore } from "./routes/ai";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: "*", // Allow all origins in development, restrict in production
    credentials: true,
  }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Log API requests in debug mode
  if (process.env.DEBUG === "true") {
    app.use((req, res, next) => {
      console.log(`[API] ${req.method} ${req.path}`);
      next();
    });
  }

  // Health check endpoints
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping, timestamp: new Date().toISOString() });
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      server: "Spendio Space API",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || "production",
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    });
  });

  app.get("/api/demo", handleDemo);

  // AI routes
  app.post("/api/ai/chat", handleAIChat);
  app.post("/api/ai/health-score", handleHealthScore);

  return app;
}
