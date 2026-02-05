/**
 * OpenAPI Specification for Masa Fashion API
 */
export const openAPISpec = {
  openapi: "3.1.0",
  info: {
    title: "Masa Fashion API",
    version: "1.0.0",
    description: `
# 🛍️ Masa Fashion Backend API

Backend API لمتجر ماسة فاشن يتضمن:
- **Meta Conversion API** - لتتبع الأحداث من السيرفر
- **WhatsApp Cloud API** - لإرسال الرسائل وإشعارات الطلبات

## 🔐 المصادقة

جميع الـ endpoints (ما عدا webhooks) تتطلب إرسال API Key في الـ header:

\`\`\`
X-API-Key: your_secret_key_here
\`\`\`
    `,
    contact: {
      name: "Masa Fashion",
      url: "https://masa-fashion.store",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development Server",
    },
    {
      url: "https://api.masa-fashion.store",
      description: "Production Server",
    },
  ],
  tags: [
    {
      name: "Health",
      description: "فحص حالة السيرفر",
    },
    {
      name: "Conversion Events",
      description: "Meta Conversion API - تتبع أحداث التجارة الإلكترونية",
    },
    {
      name: "WhatsApp",
      description: "WhatsApp Cloud API - إرسال الرسائل والإشعارات",
    },
    {
      name: "Webhook",
      description: "WhatsApp Webhook - استقبال الرسائل",
    },
  ],
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "Health Check",
        description: "فحص حالة السيرفر والتأكد من أنه يعمل",
        responses: {
          "200": {
            description: "السيرفر يعمل بشكل صحيح",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    version: { type: "string", example: "1.0.0" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/events/purchase": {
      post: {
        tags: ["Conversion Events"],
        summary: "تتبع عملية شراء",
        description: "إرسال حدث Purchase إلى Meta Conversion API عند إتمام عملية شراء",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PurchaseRequest" },
              example: {
                customerName: "أحمد محمد",
                customerPhone: "0791234567",
                city: "عمان",
                items: [
                  {
                    productId: "prod_123",
                    productName: "فستان سهرة",
                    colorName: "أسود",
                    price: 45.0,
                    quantity: 1,
                  },
                ],
                totalValue: 45.0,
                eventId: "1706972400000_abc123def",
                sourceUrl: "https://masa-fashion.store/checkout",
                fbp: "fb.1.1706972400000.1234567890",
                fbc: "fb.1.1706972400000.AbCdEfGhIjKl",
                userAgent: "Mozilla/5.0...",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "تم إرسال الحدث بنجاح",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EventResponse" },
              },
            },
          },
          "400": {
            description: "بيانات غير صالحة",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "غير مصرح - API Key مفقود أو غير صحيح",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UnauthorizedResponse" },
              },
            },
          },
        },
      },
    },
    "/api/events/add-to-cart": {
      post: {
        tags: ["Conversion Events"],
        summary: "تتبع إضافة للسلة",
        description: "إرسال حدث AddToCart إلى Meta Conversion API عند إضافة منتج للسلة",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddToCartRequest" },
              example: {
                productId: "prod_123",
                productName: "فستان سهرة",
                price: 45.0,
                quantity: 1,
                eventId: "1706972400000_abc123def",
                sourceUrl: "https://masa-fashion.store/product/123",
                fbp: "fb.1.1706972400000.1234567890",
                userAgent: "Mozilla/5.0...",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "تم إرسال الحدث بنجاح",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EventResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/events/initiate-checkout": {
      post: {
        tags: ["Conversion Events"],
        summary: "تتبع بدء الشراء",
        description: "إرسال حدث InitiateCheckout إلى Meta Conversion API عند بدء عملية الدفع",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InitiateCheckoutRequest" },
              example: {
                items: [
                  { productId: "prod_123", quantity: 1, price: 45.0 },
                ],
                totalValue: 45.0,
                eventId: "1706972400000_abc123def",
                sourceUrl: "https://masa-fashion.store/checkout",
                fbp: "fb.1.1706972400000.1234567890",
                userAgent: "Mozilla/5.0...",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "تم إرسال الحدث بنجاح",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EventResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/events/view-content": {
      post: {
        tags: ["Conversion Events"],
        summary: "تتبع عرض منتج",
        description: "إرسال حدث ViewContent إلى Meta Conversion API عند عرض صفحة منتج",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ViewContentRequest" },
              example: {
                productId: "prod_123",
                productName: "فستان سهرة",
                price: 45.0,
                category: "فساتين",
                eventId: "1706972400000_abc123def",
                sourceUrl: "https://masa-fashion.store/product/123",
                fbp: "fb.1.1706972400000.1234567890",
                userAgent: "Mozilla/5.0...",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "تم إرسال الحدث بنجاح",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EventResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/whatsapp/send": {
      post: {
        tags: ["WhatsApp"],
        summary: "إرسال رسالة واتساب",
        description: "إرسال رسالة نصية عبر WhatsApp Cloud API",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WhatsAppMessageRequest" },
              example: {
                to: "962791234567",
                message: "مرحباً! شكراً لتواصلك مع ماسة فاشن 🛍️",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "تم إرسال الرسالة بنجاح",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WhatsAppResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/whatsapp/notify-order": {
      post: {
        tags: ["WhatsApp"],
        summary: "إشعار طلب جديد",
        description: "إرسال إشعار للمتجر وتأكيد للعميل عند استلام طلب جديد",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderNotificationRequest" },
              example: {
                customerName: "أحمد محمد",
                customerPhone: "962791234567",
                city: "عمان",
                items: [
                  {
                    productName: "فستان سهرة",
                    colorName: "أسود",
                    quantity: 1,
                    price: 45.0,
                  },
                ],
                totalValue: 45.0,
              },
            },
          },
        },
        responses: {
          "200": {
            description: "تم إرسال الإشعارات بنجاح",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    storeNotification: { type: "boolean", example: true },
                    customerConfirmation: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/whatsapp/webhook": {
      get: {
        tags: ["Webhook"],
        summary: "التحقق من Webhook",
        description: "Endpoint للتحقق من Webhook (مطلوب من Meta عند إعداد الـ webhook)",
        parameters: [
          {
            name: "hub.mode",
            in: "query",
            required: true,
            schema: { type: "string", example: "subscribe" },
          },
          {
            name: "hub.verify_token",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "hub.challenge",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "التحقق ناجح - يرجع challenge",
            content: {
              "text/plain": {
                schema: { type: "string" },
              },
            },
          },
          "403": {
            description: "التحقق فشل - token غير صحيح",
          },
        },
      },
      post: {
        tags: ["Webhook"],
        summary: "استقبال رسائل الواتساب",
        description: "Endpoint لاستقبال الرسائل الواردة من WhatsApp",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WebhookPayload" },
            },
          },
        },
        responses: {
          "200": {
            description: "تم استلام الرسالة",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
        description: "API Key للمصادقة",
      },
    },
    schemas: {
      PurchaseRequest: {
        type: "object",
        required: ["customerName", "customerPhone", "city", "items", "totalValue", "eventId", "sourceUrl", "userAgent"],
        properties: {
          customerName: { type: "string", description: "اسم العميل" },
          customerPhone: { type: "string", description: "رقم هاتف العميل" },
          city: { type: "string", description: "مدينة العميل" },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/PurchaseItem" },
          },
          totalValue: { type: "number", description: "القيمة الإجمالية" },
          eventId: { type: "string", description: "معرف الحدث الفريد" },
          sourceUrl: { type: "string", format: "uri", description: "رابط الصفحة" },
          fbc: { type: "string", description: "Facebook Click ID (اختياري)" },
          fbp: { type: "string", description: "Facebook Browser ID (اختياري)" },
          userAgent: { type: "string", description: "User Agent للمتصفح" },
        },
      },
      PurchaseItem: {
        type: "object",
        required: ["productId", "productName", "colorName", "price", "quantity"],
        properties: {
          productId: { type: "string" },
          productName: { type: "string" },
          colorName: { type: "string" },
          price: { type: "number" },
          quantity: { type: "integer" },
        },
      },
      AddToCartRequest: {
        type: "object",
        required: ["productId", "productName", "price", "quantity", "eventId", "sourceUrl", "userAgent"],
        properties: {
          productId: { type: "string" },
          productName: { type: "string" },
          price: { type: "number" },
          quantity: { type: "integer" },
          eventId: { type: "string" },
          sourceUrl: { type: "string", format: "uri" },
          fbp: { type: "string" },
          userAgent: { type: "string" },
        },
      },
      InitiateCheckoutRequest: {
        type: "object",
        required: ["items", "totalValue", "eventId", "sourceUrl", "userAgent"],
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "string" },
                quantity: { type: "integer" },
                price: { type: "number" },
              },
            },
          },
          totalValue: { type: "number" },
          eventId: { type: "string" },
          sourceUrl: { type: "string", format: "uri" },
          fbp: { type: "string" },
          userAgent: { type: "string" },
        },
      },
      ViewContentRequest: {
        type: "object",
        required: ["productId", "productName", "price", "eventId", "sourceUrl", "userAgent"],
        properties: {
          productId: { type: "string" },
          productName: { type: "string" },
          price: { type: "number" },
          category: { type: "string" },
          eventId: { type: "string" },
          sourceUrl: { type: "string", format: "uri" },
          fbp: { type: "string" },
          userAgent: { type: "string" },
        },
      },
      WhatsAppMessageRequest: {
        type: "object",
        required: ["to", "message"],
        properties: {
          to: { type: "string", description: "رقم الهاتف (مع كود الدولة)" },
          message: { type: "string", description: "نص الرسالة" },
        },
      },
      OrderNotificationRequest: {
        type: "object",
        required: ["customerName", "customerPhone", "city", "items", "totalValue"],
        properties: {
          customerName: { type: "string" },
          customerPhone: { type: "string" },
          city: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productName: { type: "string" },
                colorName: { type: "string" },
                quantity: { type: "number" },
                price: { type: "number" },
              },
            },
          },
          totalValue: { type: "number" },
        },
      },
      WebhookPayload: {
        type: "object",
        properties: {
          object: { type: "string", example: "whatsapp_business_account" },
          entry: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                changes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      value: {
                        type: "object",
                        properties: {
                          messages: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                from: { type: "string" },
                                text: {
                                  type: "object",
                                  properties: {
                                    body: { type: "string" },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      EventResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: { type: "object" },
        },
      },
      WhatsAppResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: { type: "object" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
          details: { type: "array", items: { type: "object" } },
        },
      },
      UnauthorizedResponse: {
        type: "object",
        properties: {
          error: { type: "string", example: "Unauthorized" },
        },
      },
    },
    responses: {
      BadRequest: {
        description: "بيانات غير صالحة",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Unauthorized: {
        description: "غير مصرح",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UnauthorizedResponse" },
          },
        },
      },
    },
  },
};
