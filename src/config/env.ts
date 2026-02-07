/**
 * تحقق وتصدير متغيرات البيئة
 * يتم التحقق عند بدء التشغيل لتجنب الأخطاء في وقت التشغيل
 */

function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  
  if (required && !value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  
  return value || "";
}

// ========== App Config ==========
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const PORT = Number(process.env.PORT) || 3000;

// ========== Security ==========
export const API_SECRET_KEY = getEnvVar("API_SECRET_KEY");
export const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
export const ADMIN_IPS = (process.env.ADMIN_IPS || "").split(",").filter(Boolean);

// ========== Meta Conversion API ==========
export const META_PIXEL_ID = getEnvVar("META_PIXEL_ID");
export const META_ACCESS_TOKEN = getEnvVar("META_ACCESS_TOKEN");
export const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || "";
export const META_API_VERSION = "v22.0";
export const META_API_URL = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events`;

// ========== WhatsApp Cloud API ==========
export const WHATSAPP_PHONE_NUMBER_ID = getEnvVar("WHATSAPP_PHONE_NUMBER_ID");
export const WHATSAPP_ACCESS_TOKEN = getEnvVar("WHATSAPP_ACCESS_TOKEN");
export const STORE_PHONE_NUMBER = process.env.STORE_PHONE_NUMBER || "";
export const WHATSAPP_API_VERSION = "v22.0";
export const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

// ========== Cloudflare R2 Storage ==========
export const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
export const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
export const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "masa-fashion";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ""; // رابط الـ public bucket

// ========== CORS ==========
export const ALLOWED_ORIGINS = IS_PRODUCTION 
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
