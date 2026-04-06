"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { useWishlist } from "@/components/wishlist-provider";
import { products } from "@/data/catalog";

export function WishlistPanel() {
  const { items } = useWishlist();
  const wishlistProducts = products.filter((product) => items.includes(product.slug));

  return (
    <section className="glass rounded-[2rem] p-6 md:p-8">
      <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">Wishlist</p>
      <h1 className="mt-2 font-display text-4xl text-[var(--berry)] md:text-5xl">Saved gift ideas</h1>
      <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--mauve)]">
        Save products here while you decide what to order next.
      </p>

      {wishlistProducts.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white/70 p-6 text-center">
          <p className="text-base leading-8 text-[var(--mauve)]">
            Your wishlist is empty right now.
          </p>
          <Link href="/#store-personalized" className="button-primary mt-5 inline-flex">
            Browse the store
          </Link>
        </div>
      )}
    </section>
  );
}
