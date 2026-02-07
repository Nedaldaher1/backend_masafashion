import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} from "../config/env.js";

// إنشاء S3 Client للتعامل مع R2
let s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (s3Client) return s3Client;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("[R2] Missing R2 configuration");
    return null;
  }

  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  console.log("[R2] Client initialized successfully");
  return s3Client;
}

/**
 * رفع صورة إلى Cloudflare R2
 * @param imageBuffer - Buffer الصورة
 * @param fileName - اسم الملف (اختياري)
 * @returns رابط الصورة العام أو null في حالة الفشل
 */
export async function uploadImage(
  imageBuffer: Buffer,
  fileName?: string
): Promise<string | null> {
  const client = getS3Client();

  if (!client) {
    console.error("[R2] Client not initialized");
    return null;
  }

  if (!R2_PUBLIC_URL) {
    console.error("[R2] R2_PUBLIC_URL not configured");
    return null;
  }

  try {
    // إنشاء اسم فريد للملف
    const uniqueFileName = fileName || `invoices/invoice_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.png`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uniqueFileName,
      Body: imageBuffer,
      ContentType: "image/png",
    });

    await client.send(command);

    // بناء الرابط العام
    const publicUrl = `${R2_PUBLIC_URL}/${uniqueFileName}`;

    console.log("[R2] Image uploaded successfully:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("[R2] Upload error:", error);
    return null;
  }
}
