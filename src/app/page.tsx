'use client'

import CouponForm from "@/components/CouponForm";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 px-4 py-10 sm:px-6 lg:px-8">
      <CouponForm />
      <footer className="mt-8 text-center text-xs text-gray-400">
        Built with Next.js, Tailwind CSS &amp; TypeScript
      </footer>
    </div>
  );
}
