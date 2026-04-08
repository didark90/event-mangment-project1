import express from "express";
import cors from "cors";
import helmet from "helmet";
import { initDatabase } from "./config/database.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

const app = express();
const PORT = 3005;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/", (_req, res) => {
  res.json({
    message: "EventHub API Server",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api", routes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
initDatabase();

app.listen(PORT, () => {
  console.log(`🚀 EventHub API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
});

export default app;
