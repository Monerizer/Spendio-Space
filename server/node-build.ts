import path from "path";
import { createServer } from "./index";
import * as express from "express";

const app = createServer();
const port = process.env.PORT || 3000;

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API, non-static routes
app.get("*", (req, res) => {
  // For any non-API request, serve the React app
  // (API routes are already handled by createServer())
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      res.status(500).json({ error: "Failed to serve index.html" });
    }
  });
});

// Log all requests in development/debug mode
if (process.env.DEBUG) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
  console.log(`📂 Static files serving from: ${distPath}`);
  console.log(`✅ Ready to accept connections`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
