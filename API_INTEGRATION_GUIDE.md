# 📘 دليل دمج Frontend مع Backend API

## 🔗 معلومات الاتصال

```
Base URL: https://api.masa-fashion.store (أو IP الخادم)
```

### Headers المطلوبة لكل طلب

```javascript
headers: {
  "Content-Type": "application/json",
  "X-API-Key": "YOUR_API_SECRET_KEY"
}
```

---

## 📊 Meta Conversion API Events

جميع الأحداث تُرسل إلى Meta لتتبع سلوك المستخدم وتحسين الإعلانات.

---

### 1️⃣ ViewContent - عرض منتج

**متى يُستخدم:** عند فتح صفحة منتج

**Endpoint:**
```
POST /api/events/view-content
```

**البيانات المطلوبة:**

| الحقل | النوع | مطلوب | الوصف |
|-------|-------|-------|-------|
| `productId` | string | ✅ | معرف المنتج الفريد |
| `productName` | string | ✅ | اسم المنتج |
| `price` | number | ✅ | سعر المنتج |
| `category` | string | ❌ | تصنيف المنتج |
| `eventId` | string | ✅ | معرف فريد للحدث |
| `sourceUrl` | string | ✅ | رابط الصفحة الحالية |
| `fbp` | string | ❌ | قيمة _fbp cookie |
| `userAgent` | string | ✅ | معلومات المتصفح |

**مثال الاستخدام في Frontend:**

```typescript
// عند تحميل صفحة المنتج
async function trackViewContent(product: Product) {
  try {
    await fetch(`${API_URL}/api/events/view-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({
        productId: product.id,
        productName: product.name,
        price: product.price,
        category: product.category,
        eventId: generateEventId(),
        sourceUrl: window.location.href,
        fbp: getCookie("_fbp"),
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error("ViewContent tracking failed:", error);
  }
}
```

---

### 2️⃣ AddToCart - إضافة للسلة

**متى يُستخدم:** عند إضافة منتج إلى سلة التسوق

**Endpoint:**
```
POST /api/events/add-to-cart
```

**البيانات المطلوبة:**

| الحقل | النوع | مطلوب | الوصف |
|-------|-------|-------|-------|
| `productId` | string | ✅ | معرف المنتج |
| `productName` | string | ✅ | اسم المنتج |
| `price` | number | ✅ | سعر الوحدة |
| `quantity` | number | ✅ | الكمية المضافة |
| `eventId` | string | ✅ | معرف فريد للحدث |
| `sourceUrl` | string | ✅ | رابط الصفحة |
| `fbp` | string | ❌ | قيمة _fbp cookie |
| `userAgent` | string | ✅ | معلومات المتصفح |

**مثال الاستخدام في Frontend:**

```typescript
// عند النقر على زر "أضف للسلة"
async function trackAddToCart(product: Product, quantity: number) {
  try {
    await fetch(`${API_URL}/api/events/add-to-cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: quantity,
        eventId: generateEventId(),
        sourceUrl: window.location.href,
        fbp: getCookie("_fbp"),
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error("AddToCart tracking failed:", error);
  }
}
```

---

### 3️⃣ InitiateCheckout - بدء الشراء

**متى يُستخدم:** عند فتح نافذة/صفحة إتمام الطلب

**Endpoint:**
```
POST /api/events/initiate-checkout
```

**البيانات المطلوبة:**

| الحقل | النوع | مطلوب | الوصف |
|-------|-------|-------|-------|
| `items` | array | ✅ | قائمة المنتجات في السلة |
| `items[].productId` | string | ✅ | معرف المنتج |
| `items[].quantity` | number | ✅ | الكمية |
| `items[].price` | number | ✅ | سعر الوحدة |
| `totalValue` | number | ✅ | المجموع الكلي |
| `eventId` | string | ✅ | معرف فريد للحدث |
| `sourceUrl` | string | ✅ | رابط الصفحة |
| `fbp` | string | ❌ | قيمة _fbp cookie |
| `userAgent` | string | ✅ | معلومات المتصفح |

**مثال الاستخدام في Frontend:**

```typescript
// عند فتح modal الشراء أو صفحة Checkout
async function trackInitiateCheckout(cartItems: CartItem[], total: number) {
  try {
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
        totalValue: total,
        eventId: generateEventId(),
        sourceUrl: window.location.href,
        fbp: getCookie("_fbp"),
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error("InitiateCheckout tracking failed:", error);
  }
}
```

---

### 4️⃣ Purchase - إتمام الشراء

**متى يُستخدم:** بعد تأكيد الطلب بنجاح

**Endpoint:**
```
POST /api/events/purchase
```

**البيانات المطلوبة:**

| الحقل | النوع | مطلوب | الوصف |
|-------|-------|-------|-------|
| `customerName` | string | ✅ | اسم العميل الكامل |
| `customerPhone` | string | ✅ | رقم الهاتف |
| `city` | string | ✅ | المدينة |
| `items` | array | ✅ | قائمة المنتجات |
| `items[].productId` | string | ✅ | معرف المنتج |
| `items[].productName` | string | ✅ | اسم المنتج |
| `items[].colorName` | string | ✅ | اللون المختار |
| `items[].price` | number | ✅ | سعر الوحدة |
| `items[].quantity` | number | ✅ | الكمية |
| `totalValue` | number | ✅ | المجموع الكلي |
| `eventId` | string | ✅ | معرف فريد للحدث |
| `sourceUrl` | string | ✅ | رابط الصفحة |
| `fbc` | string | ❌ | قيمة _fbc cookie |
| `fbp` | string | ❌ | قيمة _fbp cookie |
| `userAgent` | string | ✅ | معلومات المتصفح |

**مثال الاستخدام في Frontend:**

```typescript
// بعد تأكيد الطلب بنجاح
async function trackPurchase(orderData: OrderData) {
  try {
    await fetch(`${API_URL}/api/events/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({
        customerName: orderData.name,
        customerPhone: orderData.phone,
        city: orderData.city,
        items: orderData.items.map(item => ({
          productId: item.id,
          productName: item.name,
          colorName: item.color,
          price: item.price,
          quantity: item.quantity,
        })),
        totalValue: orderData.total,
        eventId: generateEventId(),
        sourceUrl: window.location.href,
        fbc: getCookie("_fbc"),
        fbp: getCookie("_fbp"),
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error("Purchase tracking failed:", error);
  }
}
```

---

## 📱 WhatsApp API

### 5️⃣ Notify Order - إشعار الطلب

**متى يُستخدم:** بعد تأكيد الطلب - يُرسل رسالة WhatsApp للعميل والمتجر

**Endpoint:**
```
POST /api/whatsapp/notify-order
```

**قالب الرسالة:** `purchase_receipt`

```
تم استلام طلبك بنجاح.
تفاصيل الطلب:
━━━━━━━━━━━━━━
الاسم: {{1}}
الهاتف: {{2}}
المحافظة: {{3}}
العنوان: {{4}}
ملاحظات: {{5}}
━━━━━━━━━━━━━━

تفاصيل الطلب:
{{6}}
━━━━━━━━━━━━━━

المبلغ الإجمالي: {{7}} د.أ
━━━━━━━━━━━━━━
```

**البيانات المطلوبة:**

| الحقل | النوع | مطلوب | الوصف | يُملأ في القالب |
|-------|-------|-------|-------|-----------------|
| `customerName` | string | ✅ | اسم العميل | `{{1}}` |
| `customerPhone` | string | ✅ | رقم هاتف العميل | `{{2}}` |
| `governorate` | string | ✅ | المحافظة | `{{3}}` |
| `address` | string | ✅ | العنوان التفصيلي | `{{4}}` |
| `notes` | string | ❌ | ملاحظات إضافية | `{{5}}` |
| `items` | array | ✅ | قائمة المنتجات | `{{6}}` (تُنسّق تلقائياً) |
| `items[].productName` | string | ✅ | اسم المنتج | - |
| `items[].colorName` | string | ✅ | اللون | - |
| `items[].size` | string | ✅ | المقاس | - |
| `items[].price` | number | ✅ | السعر | - |
| `items[].quantity` | number | ✅ | الكمية | - |
| `totalValue` | number | ✅ | المجموع الكلي | `{{7}}` |

**تنسيق المنتجات `{{6}}` (يتم تلقائياً في Backend):**

```
1. اسم المنتج
   اللون: أسود | المقاس: L
   الكمية: 2 × 15 د.أ

2. اسم المنتج الثاني
   اللون: أبيض | المقاس: M
   الكمية: 1 × 20 د.أ
```

**مثال الاستخدام في Frontend:**

```typescript
// بعد تأكيد الطلب - إرسال إشعار WhatsApp
async function sendOrderNotification(orderData: OrderData) {
  try {
    const response = await fetch(`${API_URL}/api/whatsapp/notify-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({
        customerName: orderData.name,
        customerPhone: orderData.phone,
        governorate: orderData.governorate,
        address: orderData.address,
        notes: orderData.notes || "",
        items: orderData.items.map(item => ({
          productName: item.name,
          colorName: item.color,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
        })),
        totalValue: orderData.total,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("WhatsApp notification failed:", error);
    throw error;
  }
}
```

**الاستجابة:**

```json
{
  "success": true,
  "customerNotification": {
    "success": true,
    "error": null
  },
  "storeNotification": {
    "success": true,
    "error": null
  }
}
```

---

## 🛠️ دوال مساعدة للـ Frontend

```typescript
// ========== Constants ==========
const API_URL = "https://api.masa-fashion.store"; // غيّر هذا حسب الخادم
const API_KEY = "your_api_secret_key";

// ========== Helper Functions ==========

/**
 * توليد معرف فريد للحدث
 */
function generateEventId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * قراءة قيمة Cookie
 */
function getCookie(name: string): string | undefined {
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
async function sendToAPI(endpoint: string, data: object): Promise<any> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

---

## 📋 ملخص المسارات

| المسار | الحدث | الاستخدام |
|--------|-------|----------|
| `POST /api/events/view-content` | ViewContent | عند فتح صفحة منتج |
| `POST /api/events/add-to-cart` | AddToCart | عند إضافة منتج للسلة |
| `POST /api/events/initiate-checkout` | InitiateCheckout | عند فتح صفحة الدفع |
| `POST /api/events/purchase` | Purchase | بعد تأكيد الطلب |
| `POST /api/whatsapp/notify-order` | - | إرسال إشعار WhatsApp |

---

## 🔄 تسلسل الأحداث النموذجي

```
1. المستخدم يفتح صفحة منتج
   └── ✅ ViewContent

2. المستخدم يضيف للسلة
   └── ✅ AddToCart

3. المستخدم يفتح modal الشراء
   └── ✅ InitiateCheckout

4. المستخدم يؤكد الطلب
   ├── ✅ Purchase (Meta Conversion)
   └── ✅ Notify Order (WhatsApp)
```

---

## ⚠️ ملاحظات مهمة

1. **الـ eventId:** يجب أن يكون فريداً لكل حدث (استخدم `generateEventId()`)

2. **الـ cookies:**
   - `_fbp`: Facebook Browser ID - يُنشأ تلقائياً من Meta Pixel
   - `_fbc`: Facebook Click ID - يُنشأ عند النقر على إعلان فيسبوك

3. **الأخطاء:** لا توقف تجربة المستخدم إذا فشل التتبع - استخدم try/catch

4. **الأمان:** لا تكشف الـ API_KEY في الـ client-side code في Production
