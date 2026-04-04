"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/store";
import { calculateLineItemTotal, calculateVinylPrice, formatCurrency, GIFT_WRAP_FEE } from "@/lib/pricing";
import { useCart } from "@/components/cart-provider";

export function ProductCustomizer({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [giftWrap, setGiftWrap] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [printSize, setPrintSize] = useState(product.printSizes?.[0]?.label ?? "");
  const [vinylWidth, setVinylWidth] = useState(10);
  const [vinylHeight, setVinylHeight] = useState(10);

  const selectedPrint = product.printSizes?.find((option) => option.label === printSize);
  const vinylPrice = product.supportsCustomVinyl ? calculateVinylPrice(vinylWidth, vinylHeight) : 0;
  const lineTotal = calculateLineItemTotal(product, selectedPrint?.price ?? 0, giftWrap, vinylPrice);

  function toggleOption(label: string, value: string) {
    setSelectedOptions((current) => ({ ...current, [label]: value }));
  }

  function handleAddToCart() {
    const cartId = `${product.id}-${JSON.stringify(selectedOptions)}-${printSize}-${giftWrap}-${vinylWidth}-${vinylHeight}-${giftNote}`;
    addItem({
      cartId,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      basePrice: product.basePrice,
      totalPrice: lineTotal,
      quantity,
      size: selectedOptions.Size,
      color: selectedOptions.Colour,
      variant: selectedOptions.Fit || selectedOptions.Style || selectedOptions.Type || selectedOptions.Finish || selectedOptions.Quantity || selectedOptions.Sides,
      printSize: selectedPrint?.label,
      customVinyl: product.supportsCustomVinyl
        ? { widthCm: vinylWidth, heightCm: vinylHeight, price: vinylPrice }
        : undefined,
      isGift,
      giftWrap,
      giftNote: giftNote || undefined,
    });

    router.push("/checkout");
  }

  return (
    <div className="glass rounded-[2rem] p-6 md:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
            Customize your order
          </p>
          <h2 className="mt-2 font-display text-4xl text-[var(--berry)]">Build this item</h2>
        </div>
        <span className="rounded-full bg-[var(--blush)] px-4 py-2 text-sm font-extrabold text-[var(--rose-deep)]">
          {formatCurrency(lineTotal)}
        </span>
      </div>

      <div className="mt-6 space-y-6">
        {product.variantOptions?.map((group) => (
          <div key={group.label}>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.values.map((value) => {
                const active = selectedOptions[group.label] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleOption(group.label, value)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      active
                        ? "bg-[var(--rose)] text-white"
                        : "border border-[var(--line)] bg-white/80 text-[var(--berry)]"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {product.printSizes?.length ? (
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">
              Print size
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {product.printSizes.map((option) => {
                const active = printSize === option.label;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setPrintSize(option.label)}
                    className={`rounded-[1.2rem] border px-4 py-3 text-left ${
                      active
                        ? "border-[var(--rose)] bg-[var(--blush)]"
                        : "border-[var(--line)] bg-white/80"
                    }`}
                  >
                    <span className="block font-bold text-[var(--berry)]">{option.label}</span>
                    <span className="text-sm text-[var(--mauve)]">
                      {option.price ? `+ ${formatCurrency(option.price)}` : "Included"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {product.supportsCustomVinyl ? (
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/75 p-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">
              Vinyl dimensions
            </p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-[var(--berry)]">
                Width (cm)
                <input
                  type="number"
                  min={5}
                  value={vinylWidth}
                  onChange={(event) => setVinylWidth(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                />
              </label>
              <label className="text-sm text-[var(--berry)]">
                Height (cm)
                <input
                  type="number"
                  min={5}
                  value={vinylHeight}
                  onChange={(event) => setVinylHeight(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                />
              </label>
            </div>
            <p className="mt-3 text-sm text-[var(--mauve)]">
              Live estimate: {formatCurrency(vinylPrice)} based on the current width x height x R3
              pricing rule.
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-[var(--berry)]">
            Quantity
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/75 p-4">
            <label className="flex items-center justify-between gap-3 text-sm font-bold text-[var(--berry)]">
              Gift order
              <input type="checkbox" checked={isGift} onChange={() => setIsGift((value) => !value)} />
            </label>
            <label className="mt-3 flex items-center justify-between gap-3 text-sm font-bold text-[var(--berry)]">
              Gift wrap (+{formatCurrency(GIFT_WRAP_FEE)})
              <input type="checkbox" checked={giftWrap} onChange={() => setGiftWrap((value) => !value)} />
            </label>
          </div>
        </div>

        {isGift ? (
          <label className="block text-sm text-[var(--berry)]">
            Gift note
            <textarea
              maxLength={180}
              value={giftNote}
              onChange={(event) => setGiftNote(event.target.value)}
              className="mt-2 min-h-28 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
              placeholder="Add a short note for the recipient"
            />
            <span className="mt-2 block text-xs text-[var(--mauve)]">{giftNote.length}/180</span>
          </label>
        ) : null}
      </div>

      <button type="button" onClick={handleAddToCart} className="button-primary mt-8 w-full text-center">
        Add to cart and continue
      </button>
    </div>
  );
}
