import { hashData, hashDataRequired, normalizePhone } from "../utils/hash.js";
import type { ConversionEvent, PurchaseRequest, AddToCartRequest } from "../types/index.js";
import { 
  META_ACCESS_TOKEN, 
  META_API_URL, 
  META_TEST_EVENT_CODE, 
  IS_PRODUCTION 
} from "../config/env.js";

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
    const payload: Record<string, unknown> = {
      data: [event],
      access_token: META_ACCESS_TOKEN,
    };

    // إضافة test_event_code في بيئة التطوير
    if (META_TEST_EVENT_CODE && !IS_PRODUCTION) {
      payload.test_event_code = META_TEST_EVENT_CODE;
    }

    const response = await fetch(META_API_URL, {
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

  // بناء user_data مع تصفية القيم الفارغة
  const phoneHash = hashDataRequired(normalizePhone(req.customerPhone));
  const firstNameHash = hashData(firstName);
  const lastNameHash = hashData(lastName);
  const cityHash = hashData(req.city);
  const countryHash = hashDataRequired("jo");

  const event: ConversionEvent = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: req.eventId,
    event_source_url: req.sourceUrl,
    action_source: "website",
    user_data: {
      ph: [phoneHash],
      ...(firstNameHash && { fn: [firstNameHash] }),
      ...(lastNameHash && { ln: [lastNameHash] }),
      ...(cityHash && { ct: [cityHash] }),
      country: [countryHash],
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