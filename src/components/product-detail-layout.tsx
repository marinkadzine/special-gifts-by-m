"use client";

import Link from "next/link";
import { ProductCustomizer } from "@/components/product-customizer";
import { ProductGallery } from "@/components/product-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useStoreProducts } from "@/hooks/use-store-products";
import { formatCurrency } from "@/lib/pricing";

export function ProductDetailLayout({ slug }: { slug?: string }) {
  const { loading, products } = useStoreProducts();
  const product = slug ? products.find((entry) => entry.slug === slug) : undefined;

  return (
    <main>
      <SiteHeader />
      {!slug ? (
        <section className="shell py-8">
          <div className="glass rounded-[2rem] p-6 md:p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">Store item</p>
            <h1 className="mt-2 font-display text-4xl text-[var(--berry)] md:text-5xl">
              Choose an item to view
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--mauve)]">
              Open a product from the store first, then this page will show its pricing, custom options,
              and upload tools.
            </p>
            <Link href="/#store-personalized" className="button-primary mt-6 inline-flex">
              Browse the store
            </Link>
          </div>
        </section>
      ) : loading && !product ? (
        <section className="shell py-8">
          <div className="glass rounded-[2rem] p-6 md:p-8">
            <p className="text-sm text-[var(--mauve)]">Loading this store item...</p>
          </div>
        </section>
      ) : !product ? (
        <section className="shell py-8">
          <div className="glass rounded-[2rem] p-6 md:p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">Store item</p>
            <h1 className="mt-2 font-display text-4xl text-[var(--berry)] md:text-5xl">
              This item could not be found
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--mauve)]">
              It may have been hidden from the storefront or the link may be outdated.
            </p>
            <Link href="/#store-personalized" className="button-primary mt-6 inline-flex">
              Return to the store
            </Link>
          </div>
        </section>
      ) : (
        <div className="shell grid gap-8 py-8 md:grid-cols-[1fr_0.92fr]">
          <section className="glass overflow-hidden rounded-[2rem]">
            <ProductGallery product={product} />
            <div className="p-6 md:p-8">
              <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
                {product.category}
              </p>
              <h1 className="mt-2 font-display text-5xl text-[var(--berry)]">{product.name}</h1>
              <p className="mt-4 text-base leading-8 text-[var(--mauve)]">{product.description}</p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.5rem] bg-white/75 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--mauve)]">Starts at</p>
                  <p className="mt-2 font-display text-4xl text-[var(--berry)]">
                    {formatCurrency(product.basePrice)}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-white/75 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--mauve)]">Lead time</p>
                  <p className="mt-2 text-lg font-bold text-[var(--berry)]">{product.leadTime}</p>
                </div>
                <div className="rounded-[1.5rem] bg-white/75 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--mauve)]">Good for</p>
                  <p className="mt-2 text-lg font-bold text-[var(--berry)]">Gifts, events, and branding</p>
                </div>
              </div>
            </div>
          </section>

          <ProductCustomizer product={product} />
        </div>
      )}
      <SiteFooter />
    </main>
  );
}
