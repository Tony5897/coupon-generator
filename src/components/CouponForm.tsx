import { useState } from 'react';

interface Coupon {
    discount: number;
    code: string;
    expirationDate: string;
}

export default function CouponForm() {
    const [coupon, setCoupon] = useState<Coupon | null>(null);

    const generateCoupon = () => {
        const discount = Math.floor(Math.random() * 50) + 10;  // Random discount between 10% and 60%
        const code = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random Code
        const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(); // Expires in 7 days 

        setCoupon({ discount, code, expirationDate});
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg mt-10 flex flex-col gap-4 sm:m-w-lg sm:p-8">
            <h2 className="text-3xl text-gray-500 font-bold mb-4 text-center">Coupon Generator</h2>
            <button
                onClick={generateCoupon}
                className="w-full bg-green-500 text-white py-3 px-5 rounded hover:bg-green-600 transition-all-300">

             Generate Coupon  
            </button>

            {coupon && (
                <div className="mt-5 p-5 border rounded-lg bg-gray-50 flex flex-col items-center">
                    <p className="text-xl text-gray-700 font-semibold">Discount: {coupon.discount}%</p>
                    <p className="text-lg text-gray-900 font-semibold bg-gray-200 px-3 py-1 rounded-md mt-2">{coupon.code}</p>
                    <p className="text-sm text-gray-500 mt-2">Expires on: {coupon.expirationDate}</p>
                </div>
            )}
        </div>
    );

}