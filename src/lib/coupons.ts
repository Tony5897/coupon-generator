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
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 1 || n > 100) {
    return "Enter a discount between 1 and 100.";
  }
  return null;
}

export function validateCustomCode(code: string): string | null {
  if (code.length > 0 && code.length < 3) {
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
  return new Date(Date.now() + DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
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
