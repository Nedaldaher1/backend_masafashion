import nodeHtmlToImage from "node-html-to-image";

interface OrderItem {
  productName: string;
  colorName: string;
  size: string;
  price: number;
  quantity: number;
}

interface InvoiceData {
  customerName: string;
  customerPhone: string;
  governorate: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  totalValue: number;
  orderNumber?: string;
}

/**
 * توليد صورة الفاتورة باستخدام HTML/CSS
 */
export async function generateInvoiceImage(data: InvoiceData): Promise<Buffer> {
  const orderNum = data.orderNumber || `ORD-${Date.now().toString(36).toUpperCase()}`;
  const date = new Date().toLocaleDateString("ar-JO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // بناء صفوف المنتجات
  const itemsRows = data.items
    .map(
      (item, index) => `
      <tr class="${index % 2 === 0 ? "even" : ""}">
        <td class="product-name">${item.productName}</td>
        <td>${item.colorName}</td>
        <td>${item.size}</td>
        <td>${item.quantity}</td>
        <td class="price">${item.price * item.quantity} د.أ</td>
      </tr>
    `
    )
    .join("");

  const html = `
    <html dir="rtl">
    <head>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
          background: #ffffff;
          padding: 40px;
          width: 800px;
        }
        
        .invoice {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
          color: #ffffff;
          padding: 30px 40px;
          text-align: center;
        }
        
        .header-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .header-subtitle {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .order-meta {
          display: flex;
          justify-content: space-between;
          padding: 15px 40px;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
          font-size: 14px;
          color: #666;
        }
        
        .content {
          padding: 30px 40px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0e0e0;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        th {
          background: #f8f9fa;
          padding: 14px 12px;
          text-align: right;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e0e0e0;
        }
        
        td {
          padding: 14px 12px;
          border-bottom: 1px solid #eee;
          color: #444;
        }
        
        tr.even {
          background: #fafafa;
        }
        
        .product-name {
          font-weight: 500;
          color: #2c3e50;
        }
        
        .price {
          text-align: left;
          font-weight: 600;
          color: #27ae60;
        }
        
        .total-row {
          background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
          border-radius: 10px;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #ffffff;
          margin-bottom: 30px;
        }
        
        .total-label {
          font-size: 20px;
          font-weight: 600;
        }
        
        .total-value {
          font-size: 28px;
          font-weight: bold;
        }
        
        .customer-info {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .customer-info div {
          display: flex;
          margin: 8px 0;
          font-size: 14px;
        }
        
        .customer-info .label {
          color: #666;
          min-width: 80px;
          font-weight: 500;
        }
        
        .customer-info .value {
          color: #333;
        }
        
        .footer {
          text-align: center;
          padding: 25px;
          background: #f8f9fa;
          color: #666;
          font-size: 16px;
        }
        
        .footer .heart {
          color: #e74c3c;
          font-size: 20px;
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <div class="header-title">✅ تم تأكيد طلبك بنجاح!</div>
          <div class="header-subtitle">شكراً لثقتك بنا</div>
        </div>
        
        <div class="order-meta">
          <span>رقم الطلب: ${orderNum}</span>
          <span>${date}</span>
        </div>
        
        <div class="content">
          <div class="section-title">📋 تفاصيل الطلب</div>
          
          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>اللون</th>
                <th>المقاس</th>
                <th>الكمية</th>
                <th style="text-align: left;">السعر</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          
          <div class="total-row">
            <span class="total-label">💰 المجموع الكلي</span>
            <span class="total-value">${data.totalValue} د.أ</span>
          </div>
          
          <div class="section-title">👤 معلومات التوصيل</div>
          
          <div class="customer-info">
            <div>
              <span class="label">الاسم:</span>
              <span class="value">${data.customerName}</span>
            </div>
            <div>
              <span class="label">الهاتف:</span>
              <span class="value">${data.customerPhone}</span>
            </div>
            <div>
              <span class="label">المحافظة:</span>
              <span class="value">${data.governorate}</span>
            </div>
            <div>
              <span class="label">العنوان:</span>
              <span class="value">${data.address}</span>
            </div>
            ${
              data.notes && data.notes !== "لا يوجد"
                ? `<div>
                    <span class="label">ملاحظات:</span>
                    <span class="value">${data.notes}</span>
                  </div>`
                : ""
            }
          </div>
        </div>
        
        <div class="footer">
          <div>شكراً لشرائك <span class="heart">♥</span></div>
        </div>
      </div>
    </body>
    </html>
  `;

  const image = await nodeHtmlToImage({
    html,
    quality: 100,
    type: "png",
    puppeteerArgs: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  return image as Buffer;
}
