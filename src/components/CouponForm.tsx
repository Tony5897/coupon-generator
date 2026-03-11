import React, { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  type Coupon,
  validateDiscount,
  validateCustomCode,
  createCoupon,
} from "@/lib/coupons";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function CouponForm() {
  const [discount, setDiscount] = useState<string>("10");
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [customCode, setCustomCode] = useState<string>("");
  const [couponCode, setCouponCode] = useState<string>("");
  const [savedCoupons, setSavedCoupons] = useState<Coupon[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
    const storedCoupons = localStorage.getItem("coupons");
    if (storedCoupons) {
      try {
        setSavedCoupons(JSON.parse(storedCoupons));
      } catch {
        localStorage.removeItem("coupons");
      }
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (savedCoupons.length > 0) {
      localStorage.setItem("coupons", JSON.stringify(savedCoupons));
    } else {
      localStorage.removeItem("coupons");
    }
  }, [savedCoupons, isClient]);

  const generateCouponCode = useCallback(() => {
    setError("");

    const discountError = validateDiscount(discount);
    if (discountError) {
      setError(discountError);
      return;
    }

    const codeError = validateCustomCode(customCode);
    if (codeError) {
      setError(codeError);
      return;
    }

    const newCoupon = createCoupon(discount, customCode, expirationDate);

    setCouponCode(newCoupon.code);
    setSavedCoupons((prev) => [newCoupon, ...prev]);
    setCopied(false);
    setCustomCode("");
  }, [discount, customCode, expirationDate]);

  const copyToClipboard = useCallback(() => {
    if (!couponCode) return;
    navigator.clipboard
      .writeText(couponCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setError("Copy failed — please select and copy the code manually.");
      });
  }, [couponCode]);

  const deleteCoupon = useCallback((index: number) => {
    setSavedCoupons((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllCoupons = useCallback(() => {
    setSavedCoupons([]);
    setCouponCode("");
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                OfferEngine
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Generate professional discount codes instantly
              </p>
            </div>
            <div className="pt-1 flex-shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="px-8 py-6 space-y-5">
          <div>
            <label
              htmlFor="discount"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Discount Percentage
            </label>
            <div className="relative">
              <input
                id="discount"
                type="number"
                min={1}
                max={100}
                placeholder="e.g. 25"
                value={discount}
                onChange={(e) =>
                  setDiscount(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">
                %
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="customCode"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Custom Code
              <span className="font-normal text-gray-400 dark:text-gray-500 ml-1">
                (optional)
              </span>
            </label>
            <input
              id="customCode"
              type="text"
              placeholder="e.g. SUMMER2026"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
              maxLength={20}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 uppercase"
            />
          </div>

          <div>
            <label
              htmlFor="expirationDate"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Expiration Date
              <span className="font-normal text-gray-400 dark:text-gray-500 ml-1">
                (default: 30 days)
              </span>
            </label>
            <input
              id="expirationDate"
              type="date"
              value={expirationDate}
              min={todayStr}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
            />
          </div>

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            onClick={generateCouponCode}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
          >
            Generate Coupon
          </button>

          {/* ── Generated coupon result ── */}
          {couponCode && (
            <div className="mt-2 p-5 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2">
                Your Discount Code
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm inline-block tracking-wider">
                {couponCode}
              </p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  }`}
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Expires:{" "}
                {savedCoupons[0]?.expirationDate || "30 days from now"}
              </p>
              {isClient && (
                <div className="mt-4 flex justify-center">
                  {/* Keep QR code on white bg for scanner readability in any theme */}
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <QRCodeCanvas value={couponCode} size={128} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Saved coupons list ── */}
      {savedCoupons.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Saved Coupons
              <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">
                ({savedCoupons.length})
              </span>
            </h2>
            <button
              onClick={clearAllCoupons}
              className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
          <ul className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {savedCoupons.map((c, index) => (
              <li
                key={`${c.code}-${c.createdAt}-${index}`}
                className="px-8 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="min-w-0">
                  <span className="font-mono font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {c.code}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 mx-2">
                    ·
                  </span>
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {c.discount}% off
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 mx-2">
                    ·
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Exp: {c.expirationDate}
                  </span>
                </div>
                <button
                  onClick={() => deleteCoupon(index)}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-4 flex-shrink-0"
                  aria-label="Delete coupon"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
