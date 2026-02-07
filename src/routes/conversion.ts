import { Hono } from "hono";
import { 
  sendPurchaseEvent, 
  sendAddToCartEvent,
  sendInitiateCheckoutEvent,
  sendViewContentEvent 
} from "../services/metaConversion.js";
import { 
  purchaseSchema, 
  addToCartSchema, 
  initiateCheckoutSchema, 
  viewContentSchema 
} from "../utils/validation.js";
import { authMiddleware, getClientIp } from "../middleware/auth.js";

const app = new Hono();

app.use("*", authMiddleware);

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
    const parsed = initiateCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ 
        error: "Invalid data", 
        details: parsed.error.errors 
      }, 400);
    }

    const clientIp = getClientIp(c);
    const result = await sendInitiateCheckoutEvent({
      ...parsed.data,
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
    const parsed = viewContentSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ 
        error: "Invalid data", 
        details: parsed.error.errors 
      }, 400);
    }

    const clientIp = getClientIp(c);
    const result = await sendViewContentEvent({
      ...parsed.data,
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