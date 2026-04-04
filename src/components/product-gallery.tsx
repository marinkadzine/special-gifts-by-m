"use client";

import Image from "next/image";
import { useState } from "react";
import { Product } from "@/types/store";

function fallbackBackground(product: Product) {
  return (
    <div
      className="min-h-[360px] bg-cover bg-center"
      style={{ backgroundImage: "url('/branding/story-bg-2.png')" }}
    >
      <div className="flex min-h-[360px] items-end bg-gradient-to-t from-[rgba(100,53,95,0.34)] via-transparent to-transparent p-6">
        <div className="rounded-[1.3rem] bg-white/78 px-4 py-3 backdrop-blur">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--mauve)]">
            Product preview
          </p>
          <p className="mt-2 font-display text-3xl text-[var(--berry)]">{product.name}</p>
          <p className="mt-1 text-sm text-[var(--mauve)]">
            Store photo coming soon. Your current description and options are already live.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProductGallery({ product }: { product: Product }) {
  const gallery = product.galleryImages?.length
    ? product.galleryImages
    : product.image
      ? [product.image]
      : [];
  const [activeImage, setActiveImage] = useState(gallery[0] ?? "");

  if (!gallery.length || !activeImage) {
    return fallbackBackground(product);
  }

  return (
    <div className="space-y-4 p-4 md:p-5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
        <Image
          src={activeImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {gallery.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 md:grid-cols-5">
          {gallery.map((image, index) => {
            const active = image === activeImage;
            return (
              <button
                key={`${product.slug}-${index}`}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`relative aspect-square overflow-hidden rounded-[1rem] border ${
                  active ? "border-[var(--rose)] shadow-md" : "border-white/60"
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} preview ${index + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
