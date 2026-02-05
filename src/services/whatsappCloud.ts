import { normalizePhone } from "../utils/hash.js";

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const STORE_PHONE_NUMBER = process.env.STORE_PHONE_NUMBER!;
const API_VERSION = "v22.0";
const API_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

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
}

/**
 * تنسيق المنتجات كنص للقالب
 * حد WhatsApp للـ parameter: 1024 حرف
 */
function formatProducts(items: OrderItem[]): string {
  const MAX_LENGTH = 900; // نترك مساحة أمان
  
  let result = items.map((item, index) => {
    return `${index + 1}. ${item.productName}\n   اللون: ${item.colorName} | المقاس: ${item.size}\n   الكمية: ${item.quantity} × ${item.price} د.أ`;
  }).join("\n\n");
  
  // إذا تجاوز الحد، اختصر
  if (result.length > MAX_LENGTH) {
    result = result.substring(0, MAX_LENGTH - 20) + "\n... (المزيد)";
  }
  
  return result;
}

/**
 * إرسال قالب purchase_receipt
 * القالب يحتوي على:
 * {{1}} - الاسم
 * {{2}} - الهاتف
 * {{3}} - المحافظة
 * {{4}} - العنوان
 * {{5}} - ملاحظات
 * {{6}} - تفاصيل المنتجات
 * {{7}} - المبلغ الإجمالي
 */
async function sendPurchaseReceiptTemplate(
  to: string,
  params: {
    customerName: string;
    customerPhone: string;
    governorate: string;
    address: string;
    notes: string;
    products: string;
    totalValue: string;
  }
): Promise<ApiResponse> {
  try {
    const normalizedPhone = normalizePhone(to);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizedPhone,
        type: "template",
        template: {
          name: "purchase_receipt",
          language: { code: "ar" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: params.customerName },
                { type: "text", text: params.customerPhone },
                { type: "text", text: params.governorate },
                { type: "text", text: params.address },
                { type: "text", text: params.notes || "لا يوجد" },
                { type: "text", text: params.products },
                { type: "text", text: params.totalValue },
              ],
            },
          ],
        },
      }),
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
 */
export async function notifyOrder(order: OrderNotification): Promise<{
  customerResult: ApiResponse;
  storeResult: ApiResponse;
}> {
  const formattedProducts = formatProducts(order.items);
  
  const templateParams = {
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    governorate: order.governorate,
    address: order.address,
    notes: order.notes || "لا يوجد",
    products: formattedProducts,
    totalValue: `${order.totalValue}`,
  };

  // إرسال للعميل
  const customerResult = await sendPurchaseReceiptTemplate(order.customerPhone, templateParams);

  // إرسال للمتجر
  let storeResult: ApiResponse = { success: false, error: "Store phone not configured" };
  
  if (STORE_PHONE_NUMBER) {
    storeResult = await sendPurchaseReceiptTemplate(STORE_PHONE_NUMBER, templateParams);
  } else {
    console.error("[WhatsApp] STORE_PHONE_NUMBER not configured in .env");
  }

  return { customerResult, storeResult };
}