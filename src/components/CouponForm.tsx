import { useState, useEffect } from "react";

interface Coupon {
  discount: number;
  code: string;
  expirationDate: string;
}

export default function CouponForm() {
  const [discount, setDiscount] = useState("10");
  const [customCode, setCustomCode] = useState("");
  const [expiration, setExpiration] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [copied, setCopied] = useState(false);
  const [isClient, SetIsClient] = useState(false); // Preventative SSR 

  useEffect(() => {
    SetIsClient(true);
  }, []);

  const generateCoupon = () => {
    const discount = Math.floor(Math.random() * 50) + 10;  // Random discount between 10% and 60% //
    const code = customCode || Math.random().toString(36).substring(2, 8).toUpperCase(); // Random Code

    const expirationDate = new Date(); 
    expirationDate.setDate(expirationDate.getDate() + 30);
    const formattedExpirationDate = expirationDate.toISOString().split("T")[0]; // YYYY-MM-DD for date input
    setCoupon({ discount, code, expirationDate: formattedExpirationDate });
    setExpiration(formattedExpirationDate); // Update input field
    setCopied(false); // Reset copy status when a new coupon is generated
  };

  const copyToClipboard = () => {
    if (coupon) {
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Resets after 2 seconds
    }
  };

  if (!isClient) {
    return null; // Preventative SSR Rendering  
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg mt-10 flex flex-col gap-4 sm:max-w-lg sm:p-8">
      <h2 className="text-3xl text-gray-500 font-bold mb-4 text-center">
        Coupon Generator
      </h2>
      
      <label className="font-medium text-gray-700">Discount Percentage</label>
      <input
        type="number"
        value={discount}
        onChange={(e) => setDiscount((e.target.value))}
        placeholder="Enter Discount %"
        className="w-full p-2 border rounded-md"
        aria-label="Discount Percentage"
      />

      <label className="font-medium text-gray-700">Custom Code (Optional)</label>
      <input
        type="text"
        value={customCode}
        onChange={(e) => setCustomCode(e.target.value)}
        placeholder="Enter Custom Code"
        className="w-full p-2 border rounded-md"
        aria-label="Custom Code"
      />
      
      <label className="font-medium text-gray-700">Expiration Date</label>
      <input
        type="date"
        value={expiration}
        onChange={(e) => setExpiration(e.target.value)}
        className="w-full p-2 border rounded-md"
        aria-label="Expiration Date"
      />

      <button
        onClick={generateCoupon}
        className="w-full bg-green-500 text-white py-3 px-5 rounded hover:bg-green-600 transition-all-300"
      >
        Generate Coupon
      </button>

      {coupon && (
        <div className="mt-5 p-5 border rounded-lg bg-gray-50 flex flex-col items-center">
          <p className="text-xl text-gray-700 font-semibold">
            Discount: {coupon.discount}%
          </p>
          <p className="text-lg text-gray-900 font-semibold bg-gray-200 px-3 py-1 rounded-md mt-2">
            {coupon.code}
          </p>
          <button onClick={copyToClipboard} className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
            {copied ? "Copied!" : "Copy Code"}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Expires on: {coupon.expirationDate}
          </p>
        </div>
      )}
    </div>
  );
}
