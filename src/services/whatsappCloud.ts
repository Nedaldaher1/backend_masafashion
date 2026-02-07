import { normalizePhone, normalizePhoneSafe } from "../utils/hash.js";
import { 
  WHATSAPP_ACCESS_TOKEN, 
  WHATSAPP_API_URL, 
  STORE_PHONE_NUMBER 
} from "../config/env.js";
import { generateInvoiceImage } from "./invoiceGenerator.js";
import { uploadImage } from "./r2Upload.js";

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface OrderItem {
  productName: string;
  colorName: string;
  size: string;
  price: number;
  quantity: number;
}

interface OrderNotification {
  customerName: string;
  customerPhone: string;
  governorate: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  totalValue: number;
  orderNumber?: string; // رقم الطلب للفاتورة
}

/**
 * إرسال صورة عبر واتساب
 */
async function sendImage(
  to: string,
  imageUrl: string,
  caption?: string
): Promise<ApiResponse> {
  try {
    const normalizedPhone = normalizePhone(to);
    
    console.log("[WhatsApp] Sending image to:", normalizedPhone);
    console.log("[WhatsApp] Image URL:", imageUrl);

    const requestBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizedPhone,
      type: "image",
      image: {
        link: imageUrl,
        caption: caption || "",
      },
    };
    
    console.log("[WhatsApp] Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log("[WhatsApp] Image response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("[WhatsApp] Image send error:", data);
      return { success: false, error: data.error?.message || "Failed to send image" };
    }

    console.log("[WhatsApp] Image sent successfully to:", normalizedPhone);
    return { success: true, data };
  } catch (error) {
    console.error("[WhatsApp] Send image error:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * إرسال قالب information (تسويقي) مع صورة في الهيدر
 * القالب يحتوي على:
 * Header: صورة الفاتورة
 * {{1}} - الاسم
 * {{2}} - الهاتف
 * {{3}} - المحافظة
 * {{4}} - العنوان
 * {{5}} - ملاحظات
 * {{6}} - رقم الطلب
 * {{7}} - المبلغ الإجمالي
 */
async function sendInformationTemplate(
  to: string,
  params: {
    customerName: string;
    customerPhone: string;
    governorate: string;
    address: string;
    notes: string;
    orderNumber: string;
    totalValue: string;
  },
  headerImageUrl?: string
): Promise<ApiResponse> {
  try {
    const normalizedPhone = normalizePhone(to);

    // بناء الـ components
    const components: any[] = [];
    
    // إضافة الهيدر مع الصورة (إذا موجودة)
    if (headerImageUrl) {
      components.push({
        type: "header",
        parameters: [
          {
            type: "image",
            image: {
              link: headerImageUrl,
            },
          },
        ],
      });
    }
    
    // إضافة الـ body
    components.push({
      type: "body",
      parameters: [
        { type: "text", text: params.customerName },
        { type: "text", text: params.customerPhone },
        { type: "text", text: params.governorate },
        { type: "text", text: params.address },
        { type: "text", text: params.notes || "لا يوجد" },
        { type: "text", text: params.orderNumber },
        { type: "text", text: params.totalValue },
      ],
    });

    const requestBody = {
      messaging_product: "whatsapp",
      to: normalizedPhone,
      type: "template",
      template: {
        name: "information",
        language: { code: "ar" },
        components,
      },
    };
    
    console.log("[WhatsApp] Sending template with image header:", headerImageUrl ? "Yes" : "No");

    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp] Template error:", data);
      return { success: false, error: data.error?.message || "Failed to send template" };
    }

    console.log("[WhatsApp] Template sent successfully to:", normalizedPhone);
    return { success: true, data };
  } catch (error) {
    console.error("[WhatsApp] Send template error:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * إرسال إشعار الطلب للعميل والمتجر
 * 1. يرسل القالب أولاً (لفتح نافذة المحادثة)
 * 2. ثم يرسل صورة الفاتورة
 */
export async function notifyOrder(order: OrderNotification): Promise<{
  customerResult: ApiResponse;
  storeResult: ApiResponse;
  invoiceUrl?: string;
}> {
  // توليد صورة الفاتورة ورفعها
  let invoiceUrl: string | null = null;
  try {
    console.log("[Invoice] Generating invoice image...");
    const invoiceBuffer = await generateInvoiceImage({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      governorate: order.governorate,
      address: order.address,
      notes: order.notes,
      items: order.items,
      totalValue: order.totalValue,
      orderNumber: order.orderNumber,
    });
    
    console.log("[Invoice] Uploading to Cloudflare R2...");
    invoiceUrl = await uploadImage(invoiceBuffer);
    
    if (invoiceUrl) {
      console.log("[Invoice] Invoice ready:", invoiceUrl);
    } else {
      console.error("[Invoice] Failed to upload invoice image");
    }
  } catch (error) {
    console.error("[Invoice] Error generating invoice:", error);
  }
  
  // تنظيف النصوص
  const sanitize = (text: string) => text.replace(/[\n\t\r]/g, ' ').replace(/\s{4,}/g, '   ').trim();
  
  // إعداد رقم الطلب
  const orderNum = order.orderNumber || `ORD-${Date.now().toString(36).toUpperCase()}`;
  
  // إعداد معلومات القالب
  const templateParams = {
    customerName: sanitize(order.customerName),
    customerPhone: sanitize(order.customerPhone),
    governorate: sanitize(order.governorate),
    address: sanitize(order.address),
    notes: sanitize(order.notes || "لا يوجد"),
    orderNumber: orderNum,
    totalValue: `${order.totalValue}`,
  };

  // إرسال للعميل: القالب مع صورة الفاتورة في الهيدر
  console.log("[WhatsApp] Sending information template to customer...");
  const customerResult = await sendInformationTemplate(
    order.customerPhone, 
    templateParams, 
    invoiceUrl || undefined  // إرسال الصورة في الهيدر
  );

  // إرسال للمتجر
  let storeResult: ApiResponse = { success: false, error: "Store phone not configured" };
  
  if (STORE_PHONE_NUMBER) {
    const storePhoneResult = normalizePhoneSafe(STORE_PHONE_NUMBER);
    if (storePhoneResult.isValid) {
      console.log("[WhatsApp] Sending information template to store...");
      storeResult = await sendInformationTemplate(
        STORE_PHONE_NUMBER, 
        templateParams,
        invoiceUrl || undefined  // نفس الصورة للمتجر
      );
    } else {
      console.error("[WhatsApp] Invalid STORE_PHONE_NUMBER format:", storePhoneResult.error);
      storeResult = { success: false, error: `Invalid store phone: ${storePhoneResult.error}` };
    }
  } else {
    console.error("[WhatsApp] STORE_PHONE_NUMBER not configured in .env");
  }

  return { customerResult, storeResult, invoiceUrl: invoiceUrl || undefined };
}