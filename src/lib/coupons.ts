export interface Coupon {
  discount: number;
  code: string;
  expirationDate: string;
  createdAt: string;
}

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const SUFFIX_LENGTH = 6;
const DEFAULT_EXPIRY_DAYS = 30;

export function validateDiscount(value: string): string | null {
  const n = Number(value);
  if (!/^\d+$/.test(value) || !Number.isInteger(n) || n < 1 || n > 100) {
    return "Enter a discount between 1 and 100.";
  }
  return null;
}

export function validateCustomCode(code: string): string | null {
  if (code.trim().length > 0 && code.trim().length < 3) {
    return "Custom code must be at least 3 characters.";
  }
  return null;
}

export function generateRandomSuffix(): string {
  const bytes = new Uint8Array(SUFFIX_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => CHARSET[b % CHARSET.length])
    .join("");
}

export function buildCouponCode(
  discount: number,
  customCode: string,
): string {
  const trimmed = customCode.trim();
  if (trimmed) return trimmed;
  return `SAVE${discount}-${generateRandomSuffix()}`;
}

export function defaultExpiration(): string {
  const date = new Date();
  date.setDate(date.getDate() + DEFAULT_EXPIRY_DAYS);
  return localDate(date);
}

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function validateExpiration(value: string): string | null {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime()) || localDate(date) !== value || value < localDate()) {
    return "Choose today or a later expiration date.";
  }
  return null;
}

export function parseSavedCoupons(value: string | null): Coupon[] {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every((item: unknown) => {
    if (!item || typeof item !== "object") return false;
    const c = item as Record<string, unknown>;
    return typeof c.code === "string" && typeof c.discount === "number" && Number.isInteger(c.discount) && c.discount >= 1 && c.discount <= 100 && typeof c.expirationDate === "string" && typeof c.createdAt === "string";
  })) throw new Error("Invalid saved coupons");
  return parsed as Coupon[];
}

export function createCoupon(
  discountStr: string,
  customCode: string,
  expirationDate: string,
): Coupon {
  const discount = parseInt(discountStr, 10);
  return {
    discount,
    code: buildCouponCode(discount, customCode),
    expirationDate: expirationDate || defaultExpiration(),
    createdAt: new Date().toISOString(),
  };
}
