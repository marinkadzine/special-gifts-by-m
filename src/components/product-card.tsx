"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/store";
import { formatCurrency } from "@/lib/pricing";
import { useWishlist } from "@/components/wishlist-provider";

export function ProductCard({ product }: { product: Product }) {
  const { hasItem, toggleItem } = useWishlist();
  const inWishlist = hasItem(product.slug);

  return (
    <article className="glass card-hover rounded-[1.75rem] p-5">
      <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/50 bg-[linear-gradient(160deg,rgba(255,242,248,1),rgba(244,229,240,1))]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div
            className="h-full w-full bg-cover bg-center opacity-80"
            style={{ backgroundImage: "url('/branding/story-bg-2.png')" }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(100,53,95,0.78)] to-transparent px-4 py-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-white/85">
            {product.category}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleItem(product.slug)}
          className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--rose-deep)] shadow-sm"
        >
          {inWishlist ? "Saved" : "Wishlist"}
        </button>
      </div>

      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="mt-2 font-display text-3xl leading-none text-[var(--berry)]">
            {product.name}
          </h3>
        </div>
        <span className="rounded-full bg-[var(--blush)] px-3 py-1 text-sm font-extrabold text-[var(--rose-deep)]">
          {formatCurrency(product.basePrice)}
        </span>
      </div>

      <p className="text-sm leading-7 text-[var(--mauve)]">{product.summary}</p>

      {product.badges?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {product.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1 text-xs font-bold text-[var(--berry)]"
            >
              {badge}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">
          Lead time: {product.leadTime}
        </p>
        <Link href={`/shop?slug=${encodeURIComponent(product.slug)}`} className="button-secondary px-4 py-2 text-sm">
          {product.storeSection === "personalized" ? "Customize" : "View Item"}
        </Link>
      </div>
    </article>
  );
}
