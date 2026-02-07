# 🔗 دليل ربط Frontend مع Backend

> **آخر تحديث:** February 2026  
> **الإصدار:** 1.0.0  
> **Base URL:** `https://api.masa-fashion.store`

---

## 📋 جدول المحتويات

1. [ملخص التغييرات](#-ملخص-التغييرات)
2. [معلومات الاتصال](#-معلومات-الاتصال)
3. [Meta Conversion API Events](#-meta-conversion-api-events)
4. [WhatsApp API](#-whatsapp-api)
5. [دوال مساعدة](#-دوال-مساعدة)
6. [أمثلة التكامل الكامل](#-أمثلة-التكامل-الكامل)
7. [ملاحظات أمنية](#-ملاحظات-أمنية)

---

## 📝 ملخص التغييرات

### التغييرات الرئيسية في Backend:

| التغيير | الوصف |
|---------|-------|
| ✅ قالب WhatsApp جديد | `purchase_receipt` بدلاً من الرسائل النصية |
| ✅ حقول جديدة | `governorate`, `address`, `notes`, `size` |
| ✅ تنسيق المنتجات | يتم تلقائياً في Backend |
| ✅ إرسال مزدوج | رسالة للعميل + رسالة للمتجر |
| ✅ Validation محسّن | تحقق من جميع البيانات قبل الإرسال |
| ✅ Rate Limiting | 100 طلب/دقيقة لكل IP |
| ✅ CORS محدد | فقط `masa-fashion.store` مسموح |

### الـ Endpoints المتاحة:

| Method | Endpoint | الوظيفة |
|--------|----------|---------|
| GET | `/` | Health check |
| POST | `/api/events/view-content` | تتبع عرض منتج |
| POST | `/api/events/add-to-cart` | تتبع إضافة للسلة |
| POST | `/api/events/initiate-checkout` | تتبع بدء الشراء |
| POST | `/api/events/purchase` | تتبع إتمام الشراء |
| POST | `/api/whatsapp/notify-order` | إرسال إشعار WhatsApp |

---

## 🔗 معلومات الاتصال

### Base URL
```
Production: https://api.masa-fashion.store
Development: http://localhost:3000
```

### Headers المطلوبة

```typescript
const headers = {
  "Content-Type": "application/json",
  "X-API-Key": "YOUR_API_SECRET_KEY"  // مطلوب لكل طلب
};
```

### Environment Variables للـ Frontend

```env
# .env.local أو .env
PUBLIC_API_URL=https://api.masa-fashion.store
PUBLIC_API_KEY=6wUwe9xTQQC7RUB2AjFKoWEPBUdhYCks
```

---

## 📊 Meta Conversion API Events

### 1️⃣ ViewContent - عرض منتج

**متى يُستخدم:** عند فتح صفحة منتج

```typescript
// POST /api/events/view-content

interface ViewContentRequest {
  productId: string;      // معرف المنتج (مطلوب)
  productName: string;    // اسم المنتج (مطلوب)
  price: number;          // السعر (مطلوب)
  category?: string;      // التصنيف (اختياري)
  eventId: string;        // معرف فريد (مطلوب)
  sourceUrl: string;      // رابط الصفحة (مطلوب)
  fbp?: string;           // Facebook Browser ID (اختياري)
  userAgent: string;      // معلومات المتصفح (مطلوب)
}
```

**مثال:**
```typescript
await fetch(`${API_URL}/api/events/view-content`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  },
  body: JSON.stringify({
    productId: "prod_123",
    productName: "فستان سهرة أسود",
    price: 45.00,
    category: "فساتين",
    eventId: generateEventId(),
    sourceUrl: window.location.href,
    fbp: getCookie("_fbp"),
    userAgent: navigator.userAgent,
  }),
});
```

---

### 2️⃣ AddToCart - إضافة للسلة

**متى يُستخدم:** عند النقر على "أضف للسلة"

```typescript
// POST /api/events/add-to-cart

interface AddToCartRequest {
  productId: string;      // معرف المنتج (مطلوب)
  productName: string;    // اسم المنتج (مطلوب)
  price: number;          // سعر الوحدة (مطلوب)
  quantity: number;       // الكمية (مطلوب)
  eventId: string;        // معرف فريد (مطلوب)
  sourceUrl: string;      // رابط الصفحة (مطلوب)
  fbp?: string;           // Facebook Browser ID (اختياري)
  userAgent: string;      // معلومات المتصفح (مطلوب)
}
```

**مثال:**
```typescript
await fetch(`${API_URL}/api/events/add-to-cart`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  },
  body: JSON.stringify({
    productId: "prod_123",
    productName: "فستان سهرة أسود",
    price: 45.00,
    quantity: 1,
    eventId: generateEventId(),
    sourceUrl: window.location.href,
    fbp: getCookie("_fbp"),
    userAgent: navigator.userAgent,
  }),
});
```

---

### 3️⃣ InitiateCheckout - بدء الشراء

**متى يُستخدم:** عند فتح نافذة/صفحة إتمام الطلب

```typescript
// POST /api/events/initiate-checkout

interface InitiateCheckoutRequest {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  totalValue: number;     // المجموع الكلي (مطلوب)
  eventId: string;        // معرف فريد (مطلوب)
  sourceUrl: string;      // رابط الصفحة (مطلوب)
  fbp?: string;           // Facebook Browser ID (اختياري)
  userAgent: string;      // معلومات المتصفح (مطلوب)
}
```

**مثال:**
```typescript
await fetch(`${API_URL}/api/events/initiate-checkout`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  },
  body: JSON.stringify({
    items: cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
    })),
    totalValue: calculateTotal(),
    eventId: generateEventId(),
    sourceUrl: window.location.href,
    fbp: getCookie("_fbp"),
    userAgent: navigator.userAgent,
  }),
});
```

---

### 4️⃣ Purchase - إتمام الشراء

**متى يُستخدم:** بعد تأكيد الطلب بنجاح

```typescript
// POST /api/events/purchase

interface PurchaseRequest {
  customerName: string;   // اسم العميل (مطلوب)
  customerPhone: string;  // رقم الهاتف (مطلوب)
  city: string;           // المدينة (مطلوب)
  items: {
    productId: string;
    productName: string;
    colorName: string;
    price: number;
    quantity: number;
  }[];
  totalValue: number;     // المجموع الكلي (مطلوب)
  eventId: string;        // معرف فريد (مطلوب)
  sourceUrl: string;      // رابط الصفحة (مطلوب)
  fbc?: string;           // Facebook Click ID (اختياري)
  fbp?: string;           // Facebook Browser ID (اختياري)
  userAgent: string;      // معلومات المتصفح (مطلوب)
}
```

**مثال:**
```typescript
await fetch(`${API_URL}/api/events/purchase`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  },
  body: JSON.stringify({
    customerName: formData.name,
    customerPhone: formData.phone,
    city: formData.city,
    items: cartItems.map(item => ({
      productId: item.id,
      productName: item.name,
      colorName: item.color,
      price: item.price,
      quantity: item.quantity,
    })),
    totalValue: calculateTotal(),
    eventId: generateEventId(),
    sourceUrl: window.location.href,
    fbc: getCookie("_fbc"),
    fbp: getCookie("_fbp"),
    userAgent: navigator.userAgent,
  }),
});
```

---

## 📱 WhatsApp API

### Notify Order - إشعار الطلب

**متى يُستخدم:** بعد تأكيد الطلب - يُرسل رسالة WhatsApp للعميل والمتجر

```typescript
// POST /api/whatsapp/notify-order

interface OrderNotificationRequest {
  customerName: string;   // اسم العميل (مطلوب)
  customerPhone: string;  // رقم الهاتف (مطلوب) - صيغة: 07xxxxxxxx أو 962xxxxxxxx
  governorate: string;    // المحافظة (مطلوب)
  address: string;        // العنوان التفصيلي (مطلوب)
  notes?: string;         // ملاحظات (اختياري)
  items: {
    productName: string;  // اسم المنتج
    colorName: string;    // اللون
    size: string;         // المقاس
    price: number;        // السعر
    quantity: number;     // الكمية
  }[];
  totalValue: number;     // المجموع الكلي (مطلوب)
}
```

**الرسالة التي ستُرسل (قالب `purchase_receipt`):**

```
تم استلام طلبك بنجاح.
تفاصيل الطلب:
━━━━━━━━━━━━━━
الاسم: أحمد محمد
الهاتف: 0797514430
المحافظة: عمان
العنوان: شارع المدينة، بناية رقم 5
ملاحظات: الرجاء الاتصال قبل التوصيل
━━━━━━━━━━━━━━

تفاصيل الطلب:
1. فستان سهرة أسود
   اللون: أسود | المقاس: M
   الكمية: 1 × 45 د.أ

2. حذاء كعب عالي
   اللون: ذهبي | المقاس: 38
   الكمية: 1 × 30 د.أ
━━━━━━━━━━━━━━

المبلغ الإجمالي: 75 د.أ
━━━━━━━━━━━━━━
```

**مثال:**
```typescript
const response = await fetch(`${API_URL}/api/whatsapp/notify-order`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  },
  body: JSON.stringify({
    customerName: formData.name,
    customerPhone: formData.phone,
    governorate: formData.governorate,
    address: formData.address,
    notes: formData.notes || "",
    items: cartItems.map(item => ({
      productName: item.name,
      colorName: item.color,
      size: item.size,
      price: item.price,
      quantity: item.quantity,
    })),
    totalValue: calculateTotal(),
  }),
});

const result = await response.json();
// result = {
//   success: true,
//   customerNotification: { success: true, error: null },
//   storeNotification: { success: true, error: null }
// }
```

---

## 🛠️ دوال مساعدة

أضف هذا الملف في مشروع الـ Frontend:

```typescript
// src/lib/api.ts

const API_URL = import.meta.env.PUBLIC_API_URL || "https://api.masa-fashion.store";
const API_KEY = import.meta.env.PUBLIC_API_KEY || "";

/**
 * توليد معرف فريد للحدث
 */
export function generateEventId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * قراءة قيمة Cookie
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
  return undefined;
}

/**
 * إرسال طلب للـ API
 */
async function sendToAPI<T>(endpoint: string, data: object): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`[API] ${endpoint} failed:`, error);
    throw error;
  }
}

// ========== Conversion API Events ==========

/**
 * تتبع عرض منتج
 */
export async function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) {
  return sendToAPI("/api/events/view-content", {
    productId: product.id,
    productName: product.name,
    price: product.price,
    category: product.category,
    eventId: generateEventId(),
    sourceUrl: window.location.href,
    fbp: getCookie("_fbp"),
    userAgent: navigator.userAgent,
  });
}

/**
 * تتبع إضافة للسلة
 */
export async function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}) {
  return sendToAPI("/api/events/add-to-cart", {
    productId: product.id,
    productName: product.name,
    price: product.price,
    quantity: product.quantity,
    eventId: generateEventId(),
    sourceUrl: window.location.href,
    fbp: getCookie("_fbp"),
    userAgent: navigator.userAgent,
  });
}

/**
 * تتبع بدء الشراء
 */
export async function trackInitiateCheckout(cart: {
  items: { id: string; quantity: number; price: number }[];
  total: number;
}) {
  return sendToAPI("/api/events/initiate-checkout", {
    items: cart.items.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
    })),
    totalValue: cart.total,
    eventId: generateEventId(),
    sourceUrl: window.location.href,
    fbp: getCookie("_fbp"),
    userAgent: navigator.userAgent,
  });
}

/**
 * تتبع إتمام الشراء
 */
export async function trackPurchase(order: {
  customerName: string;
  customerPhone: string;
  city: string;
  items: {
    id: string;
    name: string;
    color: string;
    price: number;
    quantity: number;
  }[];
  total: number;
}) {
  return sendToAPI("/api/events/purchase", {
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    city: order.city,
    items: order.items.map(item => ({
      productId: item.id,
      productName: item.name,
      colorName: item.color,
      price: item.price,
      quantity: item.quantity,
    })),
    totalValue: order.total,
    eventId: generateEventId(),
    sourceUrl: window.location.href,
    fbc: getCookie("_fbc"),
    fbp: getCookie("_fbp"),
    userAgent: navigator.userAgent,
  });
}

// ========== WhatsApp API ==========

/**
 * إرسال إشعار الطلب عبر WhatsApp
 */
export async function sendOrderNotification(order: {
  customerName: string;
  customerPhone: string;
  governorate: string;
  address: string;
  notes?: string;
  items: {
    name: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
  }[];
  total: number;
}) {
  return sendToAPI("/api/whatsapp/notify-order", {
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    governorate: order.governorate,
    address: order.address,
    notes: order.notes || "",
    items: order.items.map(item => ({
      productName: item.name,
      colorName: item.color,
      size: item.size,
      price: item.price,
      quantity: item.quantity,
    })),
    totalValue: order.total,
  });
}
```

---

## 🎯 أمثلة التكامل الكامل

### صفحة المنتج (Product Page)

```tsx
// src/components/ProductPage.tsx
import { useEffect } from "react";
import { trackViewContent } from "@/lib/api";

export function ProductPage({ product }) {
  useEffect(() => {
    // تتبع عرض المنتج عند تحميل الصفحة
    trackViewContent({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
    }).catch(console.error);
  }, [product.id]);

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price} د.أ</p>
      {/* ... */}
    </div>
  );
}
```

### زر إضافة للسلة

```tsx
// src/components/AddToCartButton.tsx
import { trackAddToCart } from "@/lib/api";

export function AddToCartButton({ product, quantity, onAdd }) {
  const handleClick = async () => {
    // إضافة للسلة محلياً
    onAdd(product, quantity);
    
    // تتبع الحدث
    try {
      await trackAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
      });
    } catch (error) {
      // لا توقف التجربة إذا فشل التتبع
      console.error("Tracking failed:", error);
    }
  };

  return (
    <button onClick={handleClick}>
      أضف للسلة
    </button>
  );
}
```

### نافذة إتمام الطلب (Checkout Modal)

```tsx
// src/components/CheckoutModal.tsx
import { useEffect, useState } from "react";
import { 
  trackInitiateCheckout, 
  trackPurchase, 
  sendOrderNotification 
} from "@/lib/api";

export function CheckoutModal({ cart, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    governorate: "",
    address: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تتبع فتح نافذة الشراء
  useEffect(() => {
    if (isOpen) {
      trackInitiateCheckout({
        items: cart.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total: cart.total,
      }).catch(console.error);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. تتبع الشراء (Meta Conversion API)
      await trackPurchase({
        customerName: formData.name,
        customerPhone: formData.phone,
        city: formData.governorate,
        items: cart.items.map(item => ({
          id: item.id,
          name: item.name,
          color: item.color,
          price: item.price,
          quantity: item.quantity,
        })),
        total: cart.total,
      });

      // 2. إرسال إشعار WhatsApp
      const result = await sendOrderNotification({
        customerName: formData.name,
        customerPhone: formData.phone,
        governorate: formData.governorate,
        address: formData.address,
        notes: formData.notes,
        items: cart.items.map(item => ({
          name: item.name,
          color: item.color,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
        })),
        total: cart.total,
      });

      if (result.success) {
        // نجاح! عرض رسالة للمستخدم
        alert("تم إرسال طلبك بنجاح! ستصلك رسالة تأكيد على WhatsApp");
        
        // تفريغ السلة
        clearCart();
        onClose();
      } else {
        throw new Error("Failed to send notification");
      }
    } catch (error) {
      console.error("Order failed:", error);
      alert("حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* حقول النموذج */}
      <input
        type="text"
        placeholder="الاسم الكامل"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        minLength={2}
      />
      
      <input
        type="tel"
        placeholder="رقم الهاتف (07xxxxxxxx)"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
        minLength={9}
      />
      
      <select
        value={formData.governorate}
        onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
        required
      >
        <option value="">اختر المحافظة</option>
        <option value="عمان">عمان</option>
        <option value="إربد">إربد</option>
        <option value="الزرقاء">الزرقاء</option>
        {/* ... باقي المحافظات */}
      </select>
      
      <textarea
        placeholder="العنوان التفصيلي"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        required
        minLength={5}
      />
      
      <textarea
        placeholder="ملاحظات (اختياري)"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "جاري الإرسال..." : "تأكيد الطلب"}
      </button>
    </form>
  );
}
```

---

## 🔄 تسلسل الأحداث

```
┌─────────────────────────────────────────────────────────────┐
│                    رحلة المستخدم                            │
└─────────────────────────────────────────────────────────────┘

1. 👁️ فتح صفحة منتج
   └── POST /api/events/view-content
   
2. 🛒 إضافة للسلة
   └── POST /api/events/add-to-cart
   
3. 💳 فتح نافذة الشراء
   └── POST /api/events/initiate-checkout
   
4. ✅ تأكيد الطلب
   ├── POST /api/events/purchase
   └── POST /api/whatsapp/notify-order
       ├── 📱 رسالة للعميل
       └── 📱 رسالة للمتجر
```

---

## 🔒 ملاحظات أمنية

### ⚠️ مهم جداً:

1. **API Key:**
   - لا تكشف الـ API Key في الـ client-side code مباشرة
   - استخدم environment variables
   - في Astro: `import.meta.env.PUBLIC_API_KEY`

2. **CORS:**
   - الـ Backend يقبل فقط طلبات من `masa-fashion.store`
   - في التطوير المحلي: `localhost:4321` و `localhost:3000` مسموحة

3. **Rate Limiting:**
   - الحد الأقصى: 100 طلب/دقيقة لكل IP
   - إذا تجاوزت الحد: ستحصل على خطأ 429

4. **التحقق من البيانات:**
   - جميع البيانات تُتحقق في Backend
   - إذا كانت البيانات غير صالحة: ستحصل على خطأ 400 مع التفاصيل

### أخطاء شائعة:

| الخطأ | السبب | الحل |
|-------|-------|------|
| 401 Unauthorized | API Key مفقود أو خاطئ | تحقق من الـ Header |
| 400 Invalid data | بيانات ناقصة أو غير صالحة | راجع الـ request body |
| 403 Forbidden | CORS أو IP محظور | تحقق من الدومين |
| 429 Too Many Requests | تجاوز حد الطلبات | انتظر دقيقة |
| 500 Internal Error | خطأ في الخادم | تحقق من logs |

---

## 📞 الدعم

إذا واجهت مشاكل:

1. تحقق من Console للـ errors
2. تحقق من Network tab للـ response
3. راجع logs الـ Backend على VPS:
   ```bash
   pm2 logs masa-backend
   ```

---

> **ملاحظة:** هذا الملف محدّث لآخر إصدار من الـ Backend. تأكد من تحديث الـ Frontend ليتوافق مع هذه المتطلبات.
