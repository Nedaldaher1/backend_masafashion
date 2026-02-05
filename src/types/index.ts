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