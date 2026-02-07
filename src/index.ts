import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { rateLimiter } from "hono-rate-limiter";
import { apiReference } from "@scalar/hono-api-reference";

import conversionRoutes from "./routes/conversion.js";
import whatsappRoutes from "./routes/whatsapp.js";
import { openAPISpec } from "./openapi.js";
import { adminAccessMiddleware, getClientIp } from "./middleware/auth.js";
import { IS_PRODUCTION, ALLOWED_ORIGINS, ADMIN_IPS, ADMIN_TOKEN, PORT } from "./config/env.js";

const app = new Hono();

// ========== Middlewares ==========

// 1️⃣ Logger
app.use("*", logger());

// 2️⃣ Rate Limiting - فقط في Production
if (IS_PRODUCTION) {
  app.use("*", rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    limit: 100,
    standardHeaders: "draft-6",
    keyGenerator: (c) => getClientIp(c) || "unknown",
  }));
}

// 3️⃣ CORS
app.use("*", cors({
  origin: (origin) => {
    // في التطوير: اسمح لكل شيء
    if (!IS_PRODUCTION) {
      return origin || "*";
    }
    
    // في Production: تحقق صارم
    if (!origin) return null;
    if (ALLOWED_ORIGINS.includes(origin)) {
      return origin;
    }
    return null;
  },
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "X-API-Key"],
  credentials: true,
}));

// 4️⃣ Admin access middleware - تم نقلها إلى middleware/auth.ts

// ========== Routes ==========

// Health check (عام)
app.get("/", (c) => c.json({ 
  status: "ok", 
  version: "1.0.0",
  environment: IS_PRODUCTION ? "production" : "development",
  timestamp: new Date().toISOString(),
}));

// API Routes
app.route("/api/events", conversionRoutes);
app.route("/api/whatsapp", whatsappRoutes);

// OpenAPI JSON endpoint (محمي في Production)
app.get("/doc", adminAccessMiddleware, (c) => c.json(openAPISpec));

// Scalar API Reference UI (محمي في Production)
app.get(
  "/docs",
  adminAccessMiddleware,
  async (c) => {
    // الحصول على token من الـ query
    const token = c.req.query("token") || "";
    const docUrl = token ? `/doc?token=${token}` : "/doc";
    
    // إنشاء apiReference مع الـ URL الصحيح
    const reference = apiReference({
      spec: { url: docUrl },
      theme: "purple",
      pageTitle: "Masa Fashion API Docs",
      layout: "modern",
      darkMode: true,
      metaData: {
        title: "Masa Fashion API",
        description: "Backend API for Masa Fashion store",
      },
    });
    
    return reference(c, async () => {});
  }
);

// ========== Start Server ==========
console.log(`\n${"=".repeat(50)}`);
console.log(`🚀 Server running on http://localhost:${PORT}`);
console.log(`📚 API Docs: http://localhost:${PORT}/docs`);
console.log(`${"=".repeat(50)}`);
console.log(`🌍 Environment: ${IS_PRODUCTION ? "🔴 PRODUCTION" : "🟢 DEVELOPMENT"}`);

if (IS_PRODUCTION) {
  console.log(`🔒 Security: ENABLED`);
  console.log(`   ├─ CORS: ${ALLOWED_ORIGINS.join(", ")}`);
  console.log(`   ├─ Rate Limit: 100 req/min`);
  console.log(`   ├─ Admin IPs: ${ADMIN_IPS.length > 0 ? ADMIN_IPS.join(", ") : "Not set"}`);
  console.log(`   └─ Admin Token: ${ADMIN_TOKEN ? "✅ Configured" : "Not set"}`);
} else {
  console.log(`🔓 Security: DISABLED (development mode)`);
  console.log(`   └─ All origins allowed, no rate limit, /docs open`);
}
console.log(`${"=".repeat(50)}\n`);

serve({ fetch: app.fetch, port: PORT });
