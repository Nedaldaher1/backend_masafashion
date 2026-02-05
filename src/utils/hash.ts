import { createHash } from "crypto";

/**
 * SHA256 hash للبيانات الشخصية (مطلوب من Meta)
 */
export function hashData(value: string): string {
  if (!value) return "";
  const normalized = value.toLowerCase().trim();
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * تنسيق رقم الهاتف للأردن
 * يدعم الصيغ: 07xxxxxxxx, 962xxxxxxxx, 00962xxxxxxxx, 7xxxxxxxx
 */
export function normalizePhone(phone: string): string {
  // إزالة كل شيء ما عدا الأرقام
  let cleaned = phone.replace(/\D/g, "");
  
  // إزالة 00 من البداية
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }
  
  // إذا بدأ بـ 962، تحقق من الطول
  if (cleaned.startsWith("962")) {
    // رقم أردني صحيح: 962 + 9 أرقام = 12 رقم
    if (cleaned.length === 12) {
      return cleaned;
    }
  }
  
  // إذا بدأ بـ 07 (صيغة محلية أردنية)
  if (cleaned.startsWith("07") && cleaned.length === 10) {
    return "962" + cleaned.slice(1); // 962 + 7xxxxxxxx
  }
  
  // إذا بدأ بـ 7 مباشرة (بدون 0)
  if (cleaned.startsWith("7") && cleaned.length === 9) {
    return "962" + cleaned; // 962 + 7xxxxxxxx
  }
  
  // إذا لم يطابق أي صيغة، أضف 962 كافتراضي
  // لكن سجّل تحذير
  console.warn("[normalizePhone] Unusual phone format:", phone, "-> 962" + cleaned);
  return "962" + cleaned;
}

/**
 * توليد Event ID فريد
 */
export function generateEventId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}