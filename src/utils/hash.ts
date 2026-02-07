import { createHash } from "crypto";

/** نتيجة تحويل رقم الهاتف */
interface PhoneNormalizationResult {
  isValid: boolean;
  normalized: string;
  error?: string;
}

/**
 * SHA256 hash للبيانات الشخصية (مطلوب من Meta)
 * @param value - القيمة المراد تشفيرها
 * @returns Hash string أو null إذا كانت القيمة فارغة
 */
export function hashData(value: string | undefined | null): string | null {
  if (!value || value.trim() === "") {
    return null;
  }
  
  const normalized = value.toLowerCase().trim();
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * SHA256 hash مع ضمان إرجاع قيمة (للحقول المطلوبة)
 * يُرجع hash لـ "unknown" إذا كانت القيمة فارغة
 */
export function hashDataRequired(value: string | undefined | null): string {
  const hash = hashData(value);
  return hash ?? createHash("sha256").update("unknown").digest("hex");
}

/**
 * التحقق من صحة رقم الهاتف الأردني
 */
function isValidJordanianPhone(cleaned: string): boolean {
  // يجب أن يبدأ بـ 7 ويكون 9 أرقام (بدون 962)
  // أو 12 رقم مع 962 في البداية
  if (cleaned.startsWith("962") && cleaned.length === 12) {
    return /^962[7][0-9]{8}$/.test(cleaned);
  }
  
  if (cleaned.length === 9 && cleaned.startsWith("7")) {
    return /^[7][0-9]{8}$/.test(cleaned);
  }
  
  if (cleaned.length === 10 && cleaned.startsWith("07")) {
    return /^0[7][0-9]{8}$/.test(cleaned);
  }
  
  return false;
}

/**
 * تنسيق رقم الهاتف للأردن مع التحقق من الصحة
 * يدعم الصيغ: 07xxxxxxxx, 962xxxxxxxx, 00962xxxxxxxx, 7xxxxxxxx
 */
export function normalizePhoneSafe(phone: string | undefined | null): PhoneNormalizationResult {
  // التحقق من الإدخال
  if (!phone || phone.trim() === "") {
    return { isValid: false, normalized: "", error: "Phone number is required" };
  }
  
  // إزالة كل شيء ما عدا الأرقام
  let cleaned = phone.replace(/\D/g, "");
  
  // التحقق من وجود أرقام
  if (cleaned.length === 0) {
    return { isValid: false, normalized: "", error: "No digits found in phone number" };
  }
  
  // إزالة 00 من البداية
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }
  
  // إذا بدأ بـ 962، تحقق من الطول والصحة
  if (cleaned.startsWith("962")) {
    if (cleaned.length === 12 && isValidJordanianPhone(cleaned)) {
      return { isValid: true, normalized: cleaned };
    }
    return { isValid: false, normalized: cleaned, error: "Invalid Jordanian phone format (with 962)" };
  }
  
  // إذا بدأ بـ 07 (صيغة محلية أردنية)
  if (cleaned.startsWith("07") && cleaned.length === 10) {
    const normalized = "962" + cleaned.slice(1);
    return { isValid: true, normalized };
  }
  
  // إذا بدأ بـ 7 مباشرة (بدون 0)
  if (cleaned.startsWith("7") && cleaned.length === 9) {
    const normalized = "962" + cleaned;
    return { isValid: true, normalized };
  }
  
  // صيغة غير معروفة
  return { 
    isValid: false, 
    normalized: "962" + cleaned, 
    error: `Unusual phone format: ${phone}` 
  };
}

/**
 * تنسيق رقم الهاتف (للتوافق مع الكود القديم)
 * يسجّل تحذير في حالة الأرقام غير الصحيحة
 */
export function normalizePhone(phone: string): string {
  const result = normalizePhoneSafe(phone);
  
  if (!result.isValid && result.error) {
    console.warn(`[normalizePhone] ${result.error}`);
  }
  
  return result.normalized;
}

/**
 * توليد Event ID فريد
 * الصيغة: timestamp_randomString
 */
export function generateEventId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${timestamp}_${random}`;
}