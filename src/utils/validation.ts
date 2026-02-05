import { z } from "zod";

export const purchaseSchema = z.object({
  customerName: z.string().min(2, "الاسم مطلوب"),
  customerPhone: z.string().min(9, "رقم الهاتف غير صحيح"),
  city: z.string().min(2, "المدينة مطلوبة"),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    colorName: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
  })).min(1, "يجب إضافة منتج واحد على الأقل"),
  totalValue: z.number().positive(),
  eventId: z.string(),
  sourceUrl: z.string().url(),
  fbc: z.string().optional(),
  fbp: z.string().optional(),
  userAgent: z.string(),
});

export const addToCartSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  eventId: z.string(),
  sourceUrl: z.string().url(),
  fbp: z.string().optional(),
  userAgent: z.string(),
});

export const initiateCheckoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1, "يجب إضافة منتج واحد على الأقل"),
  totalValue: z.number().positive(),
  eventId: z.string(),
  sourceUrl: z.string().url(),
  fbp: z.string().optional(),
  userAgent: z.string(),
});

export const viewContentSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number().positive(),
  category: z.string().optional(),
  eventId: z.string(),
  sourceUrl: z.string().url(),
  fbp: z.string().optional(),
  userAgent: z.string(),
});

export const orderNotificationSchema = z.object({
  customerName: z.string().min(2, "الاسم مطلوب"),
  customerPhone: z.string().min(9, "رقم الهاتف مطلوب"),
  governorate: z.string().min(2, "المحافظة مطلوبة"),
  address: z.string().min(5, "العنوان مطلوب"),
  notes: z.string().optional(),
  items: z.array(z.object({
    productName: z.string(),
    colorName: z.string(),
    size: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
  })).min(1, "يجب إضافة منتج واحد على الأقل"),
  totalValue: z.number().positive(),
});