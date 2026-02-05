import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { rateLimiter } from "hono-rate-limiter";
import { apiReference } from "@scalar/hono-api-reference";
import "dotenv/config";

import conversionRoutes from "./routes/conversion.js";
import whatsappRoutes from "./routes/whatsapp.js";
import { openAPISpec } from "./openapi.js";

const app = new Hono();

// ========== Environment ==========
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ========== Security Configuration ==========

// الدومينات المسموح لها
const ALLOWED_ORIGINS = IS_PRODUCTION 
  ? [
      "https://masa-fashion.store",
      "https://www.masa-fashion.store",
    ]
  : [
      "http://localhost:4321",
      "http://localhost:3000",
      "http://127.0.0.1:4321",
      "http://127.0.0.1:3000",
    ];

// IPs المسموح لها بالوصول للـ /docs
const ADMIN_IPS = (process.env.ADMIN_IPS || "").split(",").filter(Boolean);

// ========== Middlewares ==========

// 1️⃣ Logger
app.use("*", logger());

// 2️⃣ Rate Limiting - فقط في Production
if (IS_PRODUCTION) {
  app.use("*", rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    limit: 100,
    standardHeaders: "draft-6",
    keyGenerator: (c) => {
      return c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || 
             c.req.header("x-real-ip") || 
             "unknown";
    },
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

// 4️⃣ IP Whitelist للـ /docs - فقط في Production
const ipWhitelistMiddleware = async (c: any, next: any) => {
  // في التطوير: اسمح للجميع
  if (!IS_PRODUCTION) {
    await next();
    return;
  }
  
  const clientIp = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || 
                   c.req.header("x-real-ip") || 
                   c.req.header("cf-connecting-ip") ||
                   "unknown";
  
  // إذا كانت قائمة الـ IPs فارغة في Production، امنع الجميع
  if (ADMIN_IPS.length === 0) {
    console.warn("[Security] ADMIN_IPS not configured - blocking /docs access");
    return c.json({ error: "Access denied - No admin IPs configured" }, 403);
  }
  
  // التحقق من الـ IP
  if (ADMIN_IPS.includes(clientIp)) {
    await next();
    return;
  }
  
  console.log(`[Security] Blocked access to docs from IP: ${clientIp}`);
  return c.json({ error: "Access denied" }, 403);
};

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
app.get("/doc", ipWhitelistMiddleware, (c) => c.json(openAPISpec));

// Scalar API Reference UI (محمي في Production)
app.get(
  "/docs",
  ipWhitelistMiddleware,
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

// ========== Start Server ==========
const port = Number(process.env.PORT) || 3000;

console.log(`\n${"=".repeat(50)}`);
console.log(`🚀 Server running on http://localhost:${port}`);
console.log(`📚 API Docs: http://localhost:${port}/docs`);
console.log(`${"=".repeat(50)}`);
console.log(`🌍 Environment: ${IS_PRODUCTION ? "🔴 PRODUCTION" : "🟢 DEVELOPMENT"}`);

if (IS_PRODUCTION) {
  console.log(`🔒 Security: ENABLED`);
  console.log(`   ├─ CORS: ${ALLOWED_ORIGINS.join(", ")}`);
  console.log(`   ├─ Rate Limit: 100 req/min`);
  console.log(`   └─ Admin IPs: ${ADMIN_IPS.length > 0 ? ADMIN_IPS.join(", ") : "⚠️ NOT CONFIGURED"}`);
} else {
  console.log(`🔓 Security: DISABLED (development mode)`);
  console.log(`   └─ All origins allowed, no rate limit, /docs open`);
}
console.log(`${"=".repeat(50)}\n`);

serve({ fetch: app.fetch, port });
