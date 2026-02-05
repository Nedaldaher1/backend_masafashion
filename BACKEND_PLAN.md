# 🚀 خطة بناء Backend بـ Hono JS

## نظرة عامة

سيرفر Backend مبني على **Hono JS** يعمل على **VPS** باستخدام Node.js، يتضمن:
- **Meta Conversion API v22.0** - لتتبع الأحداث من السيرفر
- **WhatsApp Cloud API v22.0** - لإرسال الرسائل وإشعارات الطلبات

---

## 📁 هيكل المشروع

```
masa-backend/
├── src/
│   ├── index.ts                 # Entry point + Hono app
│   ├── routes/
│   │   ├── conversion.ts        # Meta Conversion API endpoints
│   │   └── whatsapp.ts          # WhatsApp Cloud API endpoints
│   ├── services/
│   │   ├── metaConversion.ts    # Conversion API logic
│   │   └── whatsappCloud.ts     # WhatsApp API logic
│   ├── utils/
│   │   ├── hash.ts              # SHA256 hashing for user data
│   │   └── validation.ts        # Zod schemas
│   └── types/
│       └── index.ts             # TypeScript types
├── .env
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## 📋 الخطوات

### الخطوة 1: إنشاء المشروع

```bash
mkdir masa-backend
cd masa-backend
npm init -y
```

### الخطوة 2: تثبيت الاعتمادات

```bash
# Dependencies
npm install hono @hono/node-server zod dotenv

# Dev Dependencies
npm install -D typescript tsx @types/node
```

### الخطوة 3: إعداد الملفات

اتبع محتويات الملفات أدناه.

### الخطوة 4: التشغيل

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### الخطوة 5: النشر على VPS

```bash
# تثبيت PM2
npm install -g pm2

# تشغيل
pm2 start dist/index.js --name "masa-backend"
pm2 save
pm2 startup
```

---

## 📄 محتويات الملفات

### `package.json`

```json
{
  "name": "masa-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.8.0",
    "zod": "^3.22.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "@types/node": "^20.10.0"
  }
}
```

---

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

---

### `.env`

```env
PORT=3000
NODE_ENV=production

# Meta Conversion API
META_PIXEL_ID=your_pixel_id
META_ACCESS_TOKEN=your_access_token
META_TEST_EVENT_CODE=TEST12345

# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_BUSINESS_ID=your_business_id

# Webhook
WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# API Security
API_SECRET_KEY=your_secret_key_here
```

---

### `.gitignore`

```
node_modules/
dist/
.env
*.log
```

---

### `src/index.ts`

```typescript
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import "dotenv/config";

import conversionRoutes from "./routes/conversion";
import whatsappRoutes from "./routes/whatsapp";

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

// Start server
const port = Number(process.env.PORT) || 3000;
console.log(`🚀 Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
```

---

### `src/types/index.ts`

```typescript
// ===== أنواع Conversion API =====

export interface ConversionEvent {
  event_name: "Purchase" | "AddToCart" | "InitiateCheckout" | "ViewContent";
  event_time: number;
  event_id: string;
  event_source_url: string;
  action_source: "website";
  user_data: UserData;
  custom_data?: CustomData;
}

export interface UserData {
  em?: string[];           // hashed email
  ph?: string[];           // hashed phone
  fn?: string[];           // hashed first name
  ln?: string[];           // hashed last name
  ct?: string[];           // hashed city
  country?: string[];      // hashed country
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string;            // Facebook click ID (_fbc cookie)
  fbp?: string;            // Facebook browser ID (_fbp cookie)
}

export interface CustomData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  contents?: ContentItem[];
  num_items?: number;
}

export interface ContentItem {
  id: string;
  quantity: number;
  item_price?: number;
}

// ===== أنواع WhatsApp =====

export interface WhatsAppMessage {
  to: string;
  type: "text" | "template";
  text?: { body: string };
  template?: {
    name: string;
    language: { code: string };
    components?: any[];
  };
}

// ===== طلبات من Frontend =====

export interface PurchaseRequest {
  customerName: string;
  customerPhone: string;
  city: string;
  items: {
    productId: string;
    productName: string;
    colorName: string;
    price: number;
    quantity: number;
  }[];
  totalValue: number;
  eventId: string;
  sourceUrl: string;
  fbc?: string;
  fbp?: string;
  userAgent: string;
}

export interface AddToCartRequest {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  eventId: string;
  sourceUrl: string;
  fbp?: string;
  userAgent: string;
}
```

---

### `src/utils/hash.ts`

```typescript
import { createHash } from "crypto";

/**
 * SHA256 hash للبيانات الشخصية (مطلوب من Meta)
 */
export function hashData(value: string): string {
  if (!value) return "";
  const normalized = value.toLowerCase().trim();
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * تنسيق رقم الهاتف للأردن
 */
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  
  // إزالة 00 من البداية
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }
  
  // إضافة كود الأردن إذا لم يكن موجوداً
  if (cleaned.startsWith("07")) {
    cleaned = "962" + cleaned.slice(1);
  } else if (!cleaned.startsWith("962")) {
    cleaned = "962" + cleaned;
  }
  
  return cleaned;
}

/**
 * توليد Event ID فريد
 */
export function generateEventId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
```

---

### `src/utils/validation.ts`

```typescript
import { z } from "zod";

export const purchaseSchema = z.object({
  customerName: z.string().min(2, "الاسم مطلوب"),
  customerPhone: z.string().min(9, "رقم الهاتف غير صحيح"),
  city: z.string().min(2, "المدينة مطلوبة"),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    colorName: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
  })).min(1, "يجب إضافة منتج واحد على الأقل"),
  totalValue: z.number().positive(),
  eventId: z.string(),
  sourceUrl: z.string().url(),
  fbc: z.string().optional(),
  fbp: z.string().optional(),
  userAgent: z.string(),
});

export const addToCartSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  eventId: z.string(),
  sourceUrl: z.string().url(),
  fbp: z.string().optional(),
  userAgent: z.string(),
});

export const whatsappMessageSchema = z.object({
  to: z.string().min(10),
  message: z.string().min(1),
});

export const orderNotificationSchema = z.object({
  customerName: z.string(),
  customerPhone: z.string(),
  city: z.string(),
  items: z.array(z.object({
    productName: z.string(),
    colorName: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
  totalValue: z.number(),
});
```

---

### `src/services/metaConversion.ts`

```typescript
import { hashData, normalizePhone } from "../utils/hash";
import type { ConversionEvent, PurchaseRequest, AddToCartRequest } from "../types";

const PIXEL_ID = process.env.META_PIXEL_ID!;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;
const API_VERSION = "v22.0";
const API_URL = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * إرسال حدث إلى Meta Conversion API
 */
export async function sendEvent(event: ConversionEvent): Promise<ApiResponse> {
  try {
    const payload: any = {
      data: [event],
      access_token: ACCESS_TOKEN,
    };

    // إضافة test_event_code في بيئة التطوير
    if (TEST_EVENT_CODE && process.env.NODE_ENV !== "production") {
      payload.test_event_code = TEST_EVENT_CODE;
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Conversion API] Error:", data);
      return { success: false, error: data.error?.message || "Unknown error" };
    }

    console.log("[Conversion API] Success:", event.event_name, data);
    return { success: true, data };
  } catch (error) {
    console.error("[Conversion API] Exception:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * إرسال حدث Purchase
 */
export async function sendPurchaseEvent(
  req: PurchaseRequest, 
  clientIp: string
): Promise<ApiResponse> {
  const nameParts = req.customerName.trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const event: ConversionEvent = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: req.eventId,
    event_source_url: req.sourceUrl,
    action_source: "website",
    user_data: {
      ph: [hashData(normalizePhone(req.customerPhone))],
      fn: [hashData(firstName)],
      ln: [hashData(lastName)],
      ct: [hashData(req.city)],
      country: [hashData("jo")],
      client_ip_address: clientIp,
      client_user_agent: req.userAgent,
      fbc: req.fbc,
      fbp: req.fbp,
    },
    custom_data: {
      value: req.totalValue,
      currency: "JOD",
      content_type: "product",
      content_ids: req.items.map(item => item.productId),
      contents: req.items.map(item => ({
        id: item.productId,
        quantity: item.quantity,
        item_price: item.price,
      })),
      num_items: req.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  };

  return sendEvent(event);
}

/**
 * إرسال حدث AddToCart
 */
export async function sendAddToCartEvent(
  req: AddToCartRequest,
  clientIp: string
): Promise<ApiResponse> {
  const event: ConversionEvent = {
    event_name: "AddToCart",
    event_time: Math.floor(Date.now() / 1000),
    event_id: req.eventId,
    event_source_url: req.sourceUrl,
    action_source: "website",
    user_data: {
      client_ip_address: clientIp,
      client_user_agent: req.userAgent,
      fbp: req.fbp,
    },
    custom_data: {
      value: req.price * req.quantity,
      currency: "JOD",
      content_type: "product",
      content_ids: [req.productId],
      contents: [{
        id: req.productId,
        quantity: req.quantity,
        item_price: req.price,
      }],
    },
  };

  return sendEvent(event);
}

/**
 * إرسال حدث InitiateCheckout
 */
export async function sendInitiateCheckoutEvent(params: {
  items: { productId: string; quantity: number; price: number }[];
  totalValue: number;
  eventId: string;
  sourceUrl: string;
  fbp?: string;
  userAgent: string;
  clientIp: string;
}): Promise<ApiResponse> {
  const event: ConversionEvent = {
    event_name: "InitiateCheckout",
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.eventId,
    event_source_url: params.sourceUrl,
    action_source: "website",
    user_data: {
      client_ip_address: params.clientIp,
      client_user_agent: params.userAgent,
      fbp: params.fbp,
    },
    custom_data: {
      value: params.totalValue,
      currency: "JOD",
      content_type: "product",
      content_ids: params.items.map(item => item.productId),
      contents: params.items.map(item => ({
        id: item.productId,
        quantity: item.quantity,
        item_price: item.price,
      })),
      num_items: params.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  };

  return sendEvent(event);
}

/**
 * إرسال حدث ViewContent
 */
export async function sendViewContentEvent(params: {
  productId: string;
  productName: string;
  price: number;
  category?: string;
  eventId: string;
  sourceUrl: string;
  fbp?: string;
  userAgent: string;
  clientIp: string;
}): Promise<ApiResponse> {
  const event: ConversionEvent = {
    event_name: "ViewContent",
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.eventId,
    event_source_url: params.sourceUrl,
    action_source: "website",
    user_data: {
      client_ip_address: params.clientIp,
      client_user_agent: params.userAgent,
      fbp: params.fbp,
    },
    custom_data: {
      value: params.price,
      currency: "JOD",
      content_type: "product",
      content_ids: [params.productId],
      contents: [{
        id: params.productId,
        quantity: 1,
        item_price: params.price,
      }],
    },
  };

  return sendEvent(event);
}
```

---

### `src/services/whatsappCloud.ts`

```typescript
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const API_VERSION = "v22.0";
const API_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * إرسال رسالة نصية عبر WhatsApp
 */
export async function sendTextMessage(
  to: string, 
  message: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to.replace(/\D/g, ""),
        type: "text",
        text: { body: message },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp API] Error:", data);
      return { success: false, error: data.error?.message || "Unknown error" };
    }

    console.log("[WhatsApp API] Message sent to:", to);
    return { success: true, data };
  } catch (error) {
    console.error("[WhatsApp API] Exception:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * إرسال Template Message
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = "ar",
  components?: any[]
): Promise<ApiResponse> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to.replace(/\D/g, ""),
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: components || [],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp API] Template Error:", data);
      return { success: false, error: data.error?.message || "Unknown error" };
    }

    console.log("[WhatsApp API] Template sent to:", to);
    return { success: true, data };
  } catch (error) {
    console.error("[WhatsApp API] Exception:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * إرسال إشعار طلب جديد للمتجر
 */
export async function notifyNewOrder(order: {
  customerName: string;
  customerPhone: string;
  city: string;
  items: { productName: string; colorName: string; quantity: number; price: number }[];
  totalValue: number;
}): Promise<ApiResponse> {
  const itemsList = order.items
    .map((item, i) => `${i + 1}. ${item.productName} - ${item.colorName} (${item.quantity}x) - ${item.price} د.أ`)
    .join("\n");

  const message = `🛒 *طلب جديد*

👤 *العميل:* ${order.customerName}
📞 *الهاتف:* ${order.customerPhone}
🏙️ *المدينة:* ${order.city}

📦 *المنتجات:*
${itemsList}

💰 *المجموع:* ${order.totalValue.toFixed(2)} د.أ`;

  // إرسال للمتجر
  const storePhone = "962797514430";
  return sendTextMessage(storePhone, message);
}

/**
 * إرسال تأكيد الطلب للعميل
 */
export async function sendOrderConfirmation(
  customerPhone: string,
  orderDetails: {
    customerName: string;
    items: { productName: string; quantity: number }[];
    totalValue: number;
  }
): Promise<ApiResponse> {
  const itemsList = orderDetails.items
    .map((item, i) => `${i + 1}. ${item.productName} (${item.quantity}x)`)
    .join("\n");

  const message = `✅ *تأكيد الطلب*

مرحباً ${orderDetails.customerName}،
تم استلام طلبك بنجاح!

📦 *المنتجات:*
${itemsList}

💰 *المجموع:* ${orderDetails.totalValue.toFixed(2)} د.أ

سيتم التواصل معك قريباً لتأكيد التوصيل.
شكراً لتسوقك من ماسة فاشن! 🛍️`;

  return sendTextMessage(customerPhone, message);
}
```

---

### `src/routes/conversion.ts`

```typescript
import { Hono } from "hono";
import { 
  sendPurchaseEvent, 
  sendAddToCartEvent,
  sendInitiateCheckoutEvent,
  sendViewContentEvent 
} from "../services/metaConversion";
import { purchaseSchema, addToCartSchema } from "../utils/validation";

const app = new Hono();

// Middleware للتحقق من API Key
const authMiddleware = async (c: any, next: any) => {
  const apiKey = c.req.header("X-API-Key");
  if (apiKey !== process.env.API_SECRET_KEY) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
};

app.use("*", authMiddleware);

// Helper للحصول على IP
const getClientIp = (c: any): string => {
  return c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || 
         c.req.header("x-real-ip") || 
         c.req.header("cf-connecting-ip") ||
         "0.0.0.0";
};

/**
 * POST /api/events/purchase
 */
app.post("/purchase", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = purchaseSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ 
        error: "Invalid data", 
        details: parsed.error.errors 
      }, 400);
    }

    const clientIp = getClientIp(c);
    const result = await sendPurchaseEvent(parsed.data, clientIp);

    return c.json({
      success: result.success,
      message: result.success ? "Purchase event sent" : result.error,
      data: result.data,
    }, result.success ? 200 : 500);
  } catch (error) {
    console.error("[Route /purchase] Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * POST /api/events/add-to-cart
 */
app.post("/add-to-cart", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = addToCartSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ 
        error: "Invalid data", 
        details: parsed.error.errors 
      }, 400);
    }

    const clientIp = getClientIp(c);
    const result = await sendAddToCartEvent(parsed.data, clientIp);

    return c.json({
      success: result.success,
      message: result.success ? "AddToCart event sent" : result.error,
      data: result.data,
    }, result.success ? 200 : 500);
  } catch (error) {
    console.error("[Route /add-to-cart] Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * POST /api/events/initiate-checkout
 */
app.post("/initiate-checkout", async (c) => {
  try {
    const body = await c.req.json();
    const clientIp = getClientIp(c);

    const result = await sendInitiateCheckoutEvent({
      ...body,
      clientIp,
    });

    return c.json({
      success: result.success,
      message: result.success ? "InitiateCheckout event sent" : result.error,
      data: result.data,
    }, result.success ? 200 : 500);
  } catch (error) {
    console.error("[Route /initiate-checkout] Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * POST /api/events/view-content
 */
app.post("/view-content", async (c) => {
  try {
    const body = await c.req.json();
    const clientIp = getClientIp(c);

    const result = await sendViewContentEvent({
      ...body,
      clientIp,
    });

    return c.json({
      success: result.success,
      message: result.success ? "ViewContent event sent" : result.error,
      data: result.data,
    }, result.success ? 200 : 500);
  } catch (error) {
    console.error("[Route /view-content] Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
```

---

### `src/routes/whatsapp.ts`

```typescript
import { Hono } from "hono";
import { 
  sendTextMessage, 
  notifyNewOrder,
  sendOrderConfirmation 
} from "../services/whatsappCloud";
import { whatsappMessageSchema, orderNotificationSchema } from "../utils/validation";

const app = new Hono();

// Middleware للتحقق من API Key (ما عدا webhook)
const authMiddleware = async (c: any, next: any) => {
  const path = c.req.path;
  if (path.includes("/webhook")) {
    await next();
    return;
  }
  
  const apiKey = c.req.header("X-API-Key");
  if (apiKey !== process.env.API_SECRET_KEY) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
};

app.use("*", authMiddleware);

/**
 * POST /api/whatsapp/send
 */
app.post("/send", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = whatsappMessageSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ 
        error: "Invalid data", 
        details: parsed.error.errors 
      }, 400);
    }

    const result = await sendTextMessage(parsed.data.to, parsed.data.message);

    return c.json({
      success: result.success,
      message: result.success ? "Message sent" : result.error,
      data: result.data,
    }, result.success ? 200 : 500);
  } catch (error) {
    console.error("[Route /send] Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * POST /api/whatsapp/notify-order
 */
app.post("/notify-order", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = orderNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ 
        error: "Invalid data", 
        details: parsed.error.errors 
      }, 400);
    }

    // إرسال إشعار للمتجر
    const storeResult = await notifyNewOrder(parsed.data);

    // إرسال تأكيد للعميل
    const customerResult = await sendOrderConfirmation(
      parsed.data.customerPhone,
      {
        customerName: parsed.data.customerName,
        items: parsed.data.items,
        totalValue: parsed.data.totalValue,
      }
    );

    return c.json({
      success: storeResult.success,
      storeNotification: storeResult.success,
      customerConfirmation: customerResult.success,
    });
  } catch (error) {
    console.error("[Route /notify-order] Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * GET /api/whatsapp/webhook
 * التحقق من Webhook (مطلوب من Meta)
 */
app.get("/webhook", (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log("[Webhook] Verified successfully!");
    return c.text(challenge || "");
  }

  console.log("[Webhook] Verification failed");
  return c.json({ error: "Forbidden" }, 403);
});

/**
 * POST /api/whatsapp/webhook
 * استقبال رسائل الواتساب
 */
app.post("/webhook", async (c) => {
  try {
    const body = await c.req.json();
    
    console.log("[Webhook] Received:", JSON.stringify(body, null, 2));

    // استخراج الرسالة
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages.length > 0) {
      const message = messages[0];
      const from = message.from;
      const text = message.text?.body;

      console.log(`[Webhook] Message from ${from}: ${text}`);

      // يمكنك إضافة معالجة للرسائل هنا
    }

    // يجب إرجاع 200 دائماً لـ Meta
    return c.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return c.json({ success: true });
  }
});

export default app;
```

---

## 🔗 ربط Frontend بالـ Backend

### مثال استدعاء من Frontend

```typescript
// في CartOrderModal.tsx أو أي مكان آخر

const API_URL = "https://api.masa-fashion.store"; // أو IP الـ VPS
const API_KEY = "your_secret_key_here";

// إرسال حدث Purchase
async function sendPurchaseToServer(data: PurchaseRequest) {
  try {
    const response = await fetch(`${API_URL}/api/events/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({
        ...data,
        eventId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sourceUrl: window.location.href,
        userAgent: navigator.userAgent,
        fbp: getCookie("_fbp"),
        fbc: getCookie("_fbc"),
      }),
    });

    const result = await response.json();
    console.log("[Server] Purchase tracked:", result);
  } catch (error) {
    console.error("[Server] Error:", error);
  }
}

// Helper للحصول على cookies
function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}
```

---

## 🛡️ إعداد Nginx (Reverse Proxy + SSL)

```nginx
server {
    listen 80;
    server_name api.masa-fashion.store;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.masa-fashion.store;

    ssl_certificate /etc/letsencrypt/live/api.masa-fashion.store/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.masa-fashion.store/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 الـ Endpoints المتاحة

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/` | Health check |
| POST | `/api/events/purchase` | تتبع عملية شراء |
| POST | `/api/events/add-to-cart` | تتبع إضافة للسلة |
| POST | `/api/events/initiate-checkout` | تتبع بدء الشراء |
| POST | `/api/events/view-content` | تتبع عرض منتج |
| POST | `/api/whatsapp/send` | إرسال رسالة واتساب |
| POST | `/api/whatsapp/notify-order` | إشعار طلب جديد |
| GET | `/api/whatsapp/webhook` | تحقق Webhook |
| POST | `/api/whatsapp/webhook` | استقبال رسائل |

---

## ✅ قائمة التحقق للنشر

- [ ] إنشاء المشروع وتثبيت الاعتمادات
- [ ] إعداد ملفات `.env`
- [ ] اختبار محلي بـ `npm run dev`
- [ ] إعداد VPS (Node.js 20+)
- [ ] نسخ المشروع للـ VPS
- [ ] إعداد PM2
- [ ] إعداد Nginx + SSL
- [ ] إعداد Domain (اختياري)
- [ ] اختبار الـ endpoints
- [ ] ربط Frontend بالـ Backend
