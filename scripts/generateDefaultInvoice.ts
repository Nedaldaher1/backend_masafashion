/**
 * Script لتوليد صورة الفاتورة الافتراضية ورفعها إلى R2
 * يُستخدم مرة واحدة فقط لإنشاء الصورة الافتراضية
 * 
 * تشغيل: npx tsx scripts/generateDefaultInvoice.ts
 */

import "dotenv/config";
import nodeHtmlToImage from "node-html-to-image";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const html = `
<html dir="rtl">
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      background: #ffffff;
      padding: 40px;
      width: 800px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
    .container {
      text-align: center;
      background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
      color: white;
      padding: 60px 80px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(46, 204, 113, 0.3);
    }
    .logo {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .subtitle {
      font-size: 24px;
      opacity: 0.9;
    }
    .icon {
      font-size: 72px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🛍️</div>
    <div class="logo">MASA Fashion</div>
    <div class="subtitle">تفاصيل طلبك</div>
  </div>
</body>
</html>
`;

async function main() {
  try {
    console.log("Generating default invoice image...");
    
    const imageBuffer = await nodeHtmlToImage({
      html,
      puppeteerArgs: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    }) as Buffer;
    
    console.log("Image generated, size:", imageBuffer.length, "bytes");
    
    // رفع إلى R2
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: "default-invoice.png",
      Body: imageBuffer,
      ContentType: "image/png",
    });
    
    await s3Client.send(command);
    
    const publicUrl = `${process.env.R2_PUBLIC_URL}/default-invoice.png`;
    console.log("✅ Default invoice uploaded successfully!");
    console.log("📍 URL:", publicUrl);
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
