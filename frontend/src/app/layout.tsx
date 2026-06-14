import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AnnouncementBar from "@/components/layout/AnnouncementBar";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "AJS Customized Gifts — Turning Memories into Beautiful Gifts",
    template: "%s | AJS Customized Gifts",
  },
  description:
    "Premium customized gifts for every occasion. Personalized hampers, luxury gift boxes, engraved jewelry, and more. Shop female gifts, male gifts & customized hampers in India.",
  keywords: [
    "customized gifts",
    "personalized gifts india",
    "gift hampers",
    "luxury gifts",
    "AJS gifts",
    "birthday gifts",
    "anniversary gifts",
    "female gifts",
    "custom hampers hyderabad",
  ],
  authors: [{ name: "AJS Customized Gifts" }],
  creator: "AJS Customized Gifts",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ajscustomizedgifts.com",
    siteName: "AJS Customized Gifts",
    title: "AJS Customized Gifts — Turning Memories into Beautiful Gifts",
    description: "Premium customized gifts for every occasion in India.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AJS Customized Gifts",
    description: "Premium customized gifts for every occasion.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F4A7B9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${dancing.variable}`}>
      <body className="font-body bg-cream antialiased">
        {/* <AnnouncementBar /> */}
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(244,167,185,0.4)",
              borderRadius: "16px",
              color: "#2d1433",
              fontFamily: "var(--font-inter)",
              boxShadow: "0 8px 32px rgba(232,116,138,0.2)",
            },
            success: {
              iconTheme: { primary: "#E8748A", secondary: "white" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "white" },
            },
          }}
        />
      </body>
    </html>
  );
}
