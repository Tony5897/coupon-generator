'use client'

import CouponForm from "@/components/CouponForm";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b-white-100 px-4 py-10 sm:px-6 lg:px-8">
      {/* <h1 className="text-3xl font-bold text-black-800">Tony's Digital Coupon Generator</h1> */}
        <CouponForm />
    </div>
  );
}