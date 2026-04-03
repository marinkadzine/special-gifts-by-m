import { Product } from "@/types/store";
import { ProductCard } from "@/components/product-card";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section id="featured" className="shell mt-16">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[var(--mauve)]">
            Featured
          </p>
          <h2 className="font-display text-4xl text-[var(--berry)] md:text-5xl">
            Best first products to launch with
          </h2>
        </div>
        <p className="max-w-lg text-sm leading-7 text-[var(--mauve)]">
          These products give you a strong launch mix: apparel, stickers, and giftable drinkware.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
