import { Hono } from "hono";
import { notifyOrder } from "../services/whatsappCloud.js";
import { orderNotificationSchema } from "../utils/validation.js";
import { authMiddleware } from "../middleware/auth.js";

const app = new Hono();

app.use("*", authMiddleware);

/**
 * POST /api/whatsapp/notify-order
 * إرسال إشعار الطلب للعميل والمتجر باستخدام قالب purchase_receipt
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

    const { customerResult, storeResult } = await notifyOrder(parsed.data);

    return c.json({
      success: customerResult.success || storeResult.success,
      customerNotification: {
        success: customerResult.success,
        error: customerResult.error,
      },
      storeNotification: {
        success: storeResult.success,
        error: storeResult.error,
      },
    });
  } catch (error) {
    console.error("[Route /notify-order] Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;