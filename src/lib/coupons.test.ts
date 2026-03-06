import { describe, it, expect } from "vitest";
import {
  validateDiscount,
  validateCustomCode,
  generateRandomSuffix,
  buildCouponCode,
  defaultExpiration,
  createCoupon,
} from "./coupons";

describe("validateDiscount", () => {
  it("returns error for 0", () => {
    expect(validateDiscount("0")).toBeTruthy();
  });

  it("accepts 1 (lower bound)", () => {
    expect(validateDiscount("1")).toBeNull();
  });

  it("accepts 50 (mid-range)", () => {
    expect(validateDiscount("50")).toBeNull();
  });

  it("accepts 100 (upper bound)", () => {
    expect(validateDiscount("100")).toBeNull();
  });

  it("returns error for 101", () => {
    expect(validateDiscount("101")).toBeTruthy();
  });

  it("returns error for empty string", () => {
    expect(validateDiscount("")).toBeTruthy();
  });

  it("returns error for non-numeric input", () => {
    expect(validateDiscount("abc")).toBeTruthy();
  });

  it("returns error for negative values", () => {
    expect(validateDiscount("-5")).toBeTruthy();
  });
});

describe("validateCustomCode", () => {
  it("accepts empty string (optional field)", () => {
    expect(validateCustomCode("")).toBeNull();
  });

  it("returns error for 2-character code", () => {
    expect(validateCustomCode("AB")).toBeTruthy();
  });

  it("accepts 3-character code (minimum)", () => {
    expect(validateCustomCode("ABC")).toBeNull();
  });

  it("accepts long codes", () => {
    expect(validateCustomCode("SUPERSALE2026")).toBeNull();
  });
});

describe("generateRandomSuffix", () => {
  it("returns a 6-character string", () => {
    expect(generateRandomSuffix()).toHaveLength(6);
  });

  it("contains only uppercase alphanumeric characters", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateRandomSuffix()).toMatch(/^[A-Z0-9]{6}$/);
    }
  });

  it("produces unique values across 100 calls", () => {
    const results = new Set(Array.from({ length: 100 }, () => generateRandomSuffix()));
    expect(results.size).toBeGreaterThan(90);
  });
});

describe("buildCouponCode", () => {
  it("uses custom code when provided", () => {
    expect(buildCouponCode(25, "MYCODE")).toBe("MYCODE");
  });

  it("trims whitespace from custom code", () => {
    expect(buildCouponCode(25, "  MYCODE  ")).toBe("MYCODE");
  });

  it("generates SAVE{discount}-XXXXXX format when no custom code", () => {
    const code = buildCouponCode(25, "");
    expect(code).toMatch(/^SAVE25-[A-Z0-9]{6}$/);
  });

  it("generates SAVE{discount}-XXXXXX format for whitespace-only custom code", () => {
    const code = buildCouponCode(10, "   ");
    expect(code).toMatch(/^SAVE10-[A-Z0-9]{6}$/);
  });
});

describe("defaultExpiration", () => {
  it("returns a date string in YYYY-MM-DD format", () => {
    expect(defaultExpiration()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns a date approximately 30 days in the future", () => {
    const result = new Date(defaultExpiration()).getTime();
    const now = Date.now();
    const diffDays = (result - now) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThanOrEqual(29);
    expect(diffDays).toBeLessThanOrEqual(31);
  });
});

describe("createCoupon", () => {
  it("assembles a coupon with all fields", () => {
    const coupon = createCoupon("25", "TESTCODE", "2026-12-31");
    expect(coupon.discount).toBe(25);
    expect(coupon.code).toBe("TESTCODE");
    expect(coupon.expirationDate).toBe("2026-12-31");
    expect(coupon.createdAt).toBeTruthy();
  });

  it("falls back to default expiration when none provided", () => {
    const coupon = createCoupon("10", "", "");
    expect(coupon.expirationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(coupon.expirationDate).toBe(defaultExpiration());
  });

  it("generates a code when custom code is empty", () => {
    const coupon = createCoupon("50", "", "2026-06-15");
    expect(coupon.code).toMatch(/^SAVE50-[A-Z0-9]{6}$/);
  });

  it("uses custom code when provided", () => {
    const coupon = createCoupon("15", "HOLIDAY", "2026-12-25");
    expect(coupon.code).toBe("HOLIDAY");
  });

  it("sets createdAt to a valid ISO string", () => {
    const coupon = createCoupon("10", "", "");
    expect(() => new Date(coupon.createdAt).toISOString()).not.toThrow();
  });
});
