import Link from "next/link";
import { Product } from "@/types/store";
import { formatCurrency } from "@/lib/pricing";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="glass card-hover rounded-[1.75rem] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
            {product.category}
          </p>
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
        <Link href={`/shop/${product.slug}`} className="button-secondary px-4 py-2 text-sm">
          Customize
        </Link>
      </div>
    </article>
  );
}
