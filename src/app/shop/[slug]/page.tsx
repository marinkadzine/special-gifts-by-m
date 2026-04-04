import { notFound } from "next/navigation";
import { getProductBySlug, products } from "@/data/catalog";
import { ProductCustomizer } from "@/components/product-customizer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatCurrency } from "@/lib/pricing";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return (
    <main>
      <SiteHeader />
      <div className="shell grid gap-8 py-8 md:grid-cols-[1fr_0.92fr]">
        <section className="glass overflow-hidden rounded-[2rem]">
          <div
            className="min-h-[360px] bg-cover bg-center"
            style={{ backgroundImage: "url('/branding/story-bg-2.png')" }}
          />
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
      <SiteFooter />
    </main>
  );
}
