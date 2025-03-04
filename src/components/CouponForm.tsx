import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface Coupon {
  discount: number;
  code: string;
  expirationDate: string;
}

export default function CouponForm() {
  const [discount, setDiscount] = useState<string>("10");
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [customCode, setCustomCode] = useState<string>("");
  const [couponCode, setCouponCode] = useState<string>("");
  const [savedCoupons, setSavedCoupons] = useState<Coupon[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCoupons = localStorage.getItem("coupons");
      setSavedCoupons(storedCoupons ? JSON.parse(storedCoupons) : []);
    }
  }, []);

  useEffect(() => {
    if (savedCoupons.length > 0) {
      localStorage.setItem("coupons", JSON.stringify(savedCoupons));
    }
  }, [savedCoupons]);

  const generateCouponCode = () => {
    const discountValue = parseInt(discount, 10);
    if (isNaN(discountValue) || discountValue < 1 || discountValue > 100)
      return;

    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    const code = customCode || `SAVE${discountValue}-${randomString}`;
    const expiration =
      expirationDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    const newCoupon: Coupon = {
      discount: discountValue,
      code,
      expirationDate: expiration,
    };
    setCouponCode(code);
    setSavedCoupons((prev) => [newCoupon, ...prev]);
    setCopied(false); // Reset copy status when a new coupon is generated
  };

  const copyToClipboard = () => {
    if (couponCode) {
      navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Resets after 2 seconds
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-6">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
        <div className="p-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">
            OfferEngine
          </h2>
          <div className="space-y-4">
            <label
              htmlFor="discount"
              className="block text-gray-600 font-medium"
            >
              Discount Percentage
            </label>
            <input
              id="discount"
              type="number"
              placeholder="Discount Percentage (1-100%)"
              value={discount}
              onChange={(e) =>
                setDiscount(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))
              } // Restrict to numbers, max 3 digits
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 bg-white text-gray-900"
            />
            <label
              htmlFor="customCode"
              className="block text-gray-600 font-medium"
            >
              Custom Code (Optional)
            </label>
            <input
              id="customCode"
              type="text"
              placeholder="Custom Code (Optional)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 bg-white text-gray-900"
            />
            <label
              htmlFor="expirationDate"
              className="block text-gray-600 font-medium"
            >
              Expiration Date
            </label>
            <input
              id="expirationDate"
              type="date"
              placeholder="Expiration Date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 bg-white text-gray-900"
            />
            <button
              onClick={generateCouponCode}
              className="w-full bg-blue-600 text font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Generate *Auto Deploy Test*
            </button>
            {couponCode && (
              <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-xl text-center">
                <p className="text-lg font-semibold">Your Discount Code:</p>
                <p className="text-2xl font-bold bg-white p-2 rounded-md shadow-md"></p>
                <button
                  onClick={copyToClipboard}
                  className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>
                <p className="text-sm mt-2">
                  Expires on:{" "}
                  {savedCoupons[0]?.expirationDate || "Default (30 days)"}
                </p>
                {isClient && couponCode && (
                  <div className="mt-4 flex justify-center">
                    {typeof window !== "undefined" && (
                      <QRCodeCanvas
                        value={couponCode}
                        size={150}
                        className="border border-gray-300 shadow-md p-2 rounded-md"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {savedCoupons.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-gray-700">Saved Coupon</h2>
              {savedCoupons.map((c, index) => (
                <p
                  key={`${c.code}-${index}`}
                  className="text-sm text-gray-700 bg-gray-100 p-2 rounded-md shadow-sm mt-2"
                >
                  {c.code} - {c.discount}% off (Expires: {c.expirationDate})
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
