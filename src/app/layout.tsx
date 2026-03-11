import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OfferEngine — Digital Coupon Generator",
  description:
    "Generate professional digital discount codes with QR codes. Built with Next.js, Tailwind CSS, and TypeScript.",
};

/**
 * Runs synchronously before React hydration to apply the stored theme class
 * to <html>, preventing a flash of the wrong colour scheme on first load.
 */
const themeInitScript = `(function(){
  try{
    var k='coupon-generator-theme';
    var s=localStorage.getItem(k);
    var v=['light','dark','system'];
    var t=v.indexOf(s)!==-1?s:'system';
    var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
    if(d){document.documentElement.classList.add('dark');}
    document.documentElement.setAttribute('data-theme',d?'dark':'light');
  }catch(e){}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning prevents React from warning about the `dark`
    // class and `data-theme` attribute that the inline script may have added
    // before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
