import type { Metadata, Viewport } from "next";
import { Allura, Cormorant_Garamond, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart-provider";
import { PwaRegister } from "@/components/pwa-register";
import { WishlistProvider } from "@/components/wishlist-provider";

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const signatureFont = Allura({
  variable: "--font-signature",
  subsets: ["latin"],
  weight: ["400"],
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
  themeColor: "#FF4FA3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} ${signatureFont.variable} h-full`}>
      <body className="min-h-full">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <PwaRegister />
              {children}
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
