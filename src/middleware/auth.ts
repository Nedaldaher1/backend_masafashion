import type { Context, Next } from "hono";
import { API_SECRET_KEY, IS_PRODUCTION, ADMIN_TOKEN, ADMIN_IPS } from "../config/env.js";

/**
 * استخراج عنوان IP للعميل من الـ headers
 */
export function getClientIp(c: Context): string {
  return c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || 
         c.req.header("x-real-ip") || 
         c.req.header("cf-connecting-ip") ||
         "0.0.0.0";
}

/**
 * Middleware للتحقق من API Key
 */
export async function authMiddleware(c: Context, next: Next): Promise<Response | void> {
  const apiKey = c.req.header("X-API-Key");
  
  if (apiKey !== API_SECRET_KEY) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  await next();
}

/**
 * Middleware للتحقق من صلاحية الوصول لـ /docs
 * يتحقق من Token أو IP في Production
 */
export async function adminAccessMiddleware(c: Context, next: Next): Promise<Response | void> {
  // في التطوير: اسمح للجميع
  if (!IS_PRODUCTION) {
    await next();
    return;
  }
  
  // التحقق من Token أولاً
  const tokenFromQuery = c.req.query("token");
  const tokenFromHeader = c.req.header("X-Admin-Token");
  
  if (ADMIN_TOKEN && (tokenFromQuery === ADMIN_TOKEN || tokenFromHeader === ADMIN_TOKEN)) {
    await next();
    return;
  }
  
  // التحقق من IP
  const clientIp = getClientIp(c);
  
  if (ADMIN_IPS.includes(clientIp)) {
    await next();
    return;
  }
  
  // لا يوجد أي وسيلة مصادقة مُعدّة
  if (ADMIN_IPS.length === 0 && !ADMIN_TOKEN) {
    console.warn("[Security] No ADMIN_IPS or ADMIN_TOKEN configured - blocking /docs");
    return c.json({ error: "Access denied - No auth configured" }, 403);
  }
  
  console.log(`[Security] Blocked access to docs - IP: ${clientIp}`);
  return c.json({ error: "Access denied" }, 403);
}
