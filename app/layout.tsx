import type { Metadata, Viewport } from "next";
import { Fraunces, Caveat, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthModal } from "@/components/auth/AuthModal";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Together Booth — Virtual Photobooth for Couples & Friends",
  description:
    "The real-time virtual photobooth designed for long-distance couples, friends, and squads. Synchronized live captures, vintage filters, cute stickers, and printable 2x6″ photo strips.",
  keywords: [
    "virtual photobooth",
    "long distance couple photobooth",
    "online photobooth",
    "webrtc photobooth",
    "photo strip generator",
    "vintage photo filters",
  ],
  authors: [{ name: "Together Booth Team" }],
  openGraph: {
    title: "Together Booth — Virtual Photobooth",
    description: "Capture photobooth memories together in real-time across any distance.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f0e0d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark scroll-smooth ${fraunces.variable} ${caveat.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-[#11100F] text-[#F4EFEA] font-sans selection:bg-[#FF6F61] selection:text-white antialiased">
        {children}
        <AuthModal />
      </body>
    </html>
  );
}
