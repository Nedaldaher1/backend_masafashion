import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { apiReference } from "@scalar/hono-api-reference";
import "dotenv/config";

import conversionRoutes from "./routes/conversion.js";
import whatsappRoutes from "./routes/whatsapp.js";
import { openAPISpec } from "./openapi.js";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors({
  origin: ["https://masa-fashion.store", "http://localhost:4321"],
  allowMethods: ["GET", "POST"],
  allowHeaders: ["Content-Type", "X-API-Key"],
}));

// Health check
app.get("/", (c) => c.json({ status: "ok", version: "1.0.0" }));

// Routes
app.route("/api/events", conversionRoutes);
app.route("/api/whatsapp", whatsappRoutes);

// OpenAPI JSON endpoint
app.get("/doc", (c) => c.json(openAPISpec));

// Scalar API Reference UI
app.get(
  "/docs",
  apiReference({
    spec: { url: "/doc" },
    theme: "purple",
    pageTitle: "Masa Fashion API Docs",
    layout: "modern",
    darkMode: true,
    metaData: {
      title: "Masa Fashion API",
      description: "Backend API for Masa Fashion store",
    },
  })
);

// Start server
const port = Number(process.env.PORT) || 3000;
console.log(`🚀 Server running on http://localhost:${port}`);
console.log(`📚 API Docs available at http://localhost:${port}/docs`);

serve({ fetch: app.fetch, port });
