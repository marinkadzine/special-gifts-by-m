import { Product } from "@/types/store";
import { ProductCard } from "@/components/product-card";

export function CatalogueSection({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  return (
    <section id={`category-${title.toLowerCase().replace(/\s+/g, "-")}`} className="mt-12">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="font-display text-4xl text-[var(--berry)]">{title}</h3>
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--mauve)]">
          {products.length} items
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
