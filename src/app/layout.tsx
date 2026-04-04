import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Nunito } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { PwaRegister } from "@/components/pwa-register";

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Special Gifts by M",
  description: "A personalized gifting storefront built for Special Gifts by M.",
  applicationName: "Special Gifts by M",
  manifest: "/manifest.webmanifest",
  category: "shopping",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Special Gifts by M",
  },
  icons: {
    icon: [
      { url: "/app-icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/app-icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/app-icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#ff4dae",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} h-full`}>
      <body className="min-h-full">
        <CartProvider>
          <PwaRegister />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
