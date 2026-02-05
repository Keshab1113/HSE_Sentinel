import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import inspectionRoutes from "./routes/inspection.routes.js";
import trainingRoutes from "./routes/training.routes.js";
import jsaRoutes from "./routes/jsa.routes.js";
import groupsRoutes from "./routes/groups.routes.js";
import teamsRoutes from "./routes/teams.routes.js";
import usersRoutes from "./routes/users.routes.js";
import indicatorsRoutes from "./routes/indicators.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import rbacRoutes from "./routes/ Systemadministration/rbac.routes.js";
import complianceRoutes from "./routes/compliance.routes.js";
import emailRoutes from "./routes/email.routes.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => callback(null, true), // allow all for dev
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

// Body parsing
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/inspection", inspectionRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/jsa", jsaRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/indicators", indicatorsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use('/api/rbac', rbacRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/email", emailRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "ASES Backend ",
    timestamp: new Date().toISOString(),
  });
});

// Root
app.get("/", (req, res) => {
  res.json({
    status: "HSE backend running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      groups: "/api/groups",
      teams: "/api/teams",
      indicators: "/api/indicators",
      analytics: "/api/analytics",
    },
  });
});

// 404 handler - FIXED: Use /* instead of *
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
    availableEndpoints: [
      "/api/auth/login",
      "/api/auth/register",
      "/api/users",
      "/api/groups",
      "/api/teams",
      "/api/indicators/scores",
    ],
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
