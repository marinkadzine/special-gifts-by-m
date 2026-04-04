import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Special Gifts by M",
    short_name: "Special Gifts",
    description: "Personalized gifts, custom printing, stickers, drinkware, and gifting products.",
    lang: "en-ZA",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fff8fb",
    theme_color: "#ff4dae",
    orientation: "portrait",
    icons: [
      {
        src: "/app-icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/app-icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/app-icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Browse Catalogue",
        short_name: "Catalogue",
        description: "Open the Special Gifts by M product catalogue.",
        url: "/#catalogue",
      },
      {
        name: "Open Cart",
        short_name: "Cart",
        description: "Jump straight to checkout and the shopping cart.",
        url: "/checkout",
      },
    ],
  };
}
