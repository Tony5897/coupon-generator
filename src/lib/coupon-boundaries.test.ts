import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultExpiration, localDate, parseSavedCoupons, validateDiscount, validateExpiration } from "./coupons";

afterEach(() => vi.useRealTimers());
describe("calendar and persisted-input boundaries", () => {
  it("uses the local calendar across month boundaries", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 31, 23, 30));
    expect(localDate()).toBe("2026-01-31");
    expect(defaultExpiration()).toBe("2026-03-02");
    expect(validateExpiration("2026-01-31")).toBeNull();
    expect(validateExpiration("2026-01-30")).toBeTruthy();
    expect(validateExpiration("2026-02-30")).toBeTruthy();
  });
  it.each(["2abc", "1.5", "1e2", " "])("rejects partial numeric input %s", (input) => {
    expect(validateDiscount(input)).toBeTruthy();
  });
  it.each(['null', '{}', '[null]', '[{"code":12}]', 'broken'])("rejects malformed storage %s", (input) => {
    expect(() => parseSavedCoupons(input)).toThrow();
  });
});
