"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { itemHasCustomizationDetails } from "@/lib/order-items";
import { calculateCartSubtotal, formatCurrency } from "@/lib/pricing";

export function CartSummary() {
  const { items, removeItem, updateQuantity } = useCart();
  const subtotal = calculateCartSubtotal(items);

  return (
    <section className="glass rounded-[2rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">Cart</p>
          <h2 className="mt-2 font-display text-4xl text-[var(--berry)]">Your items</h2>
        </div>
        <span className="rounded-full bg-[var(--blush)] px-4 py-2 text-sm font-extrabold text-[var(--rose-deep)]">
          {items.length} lines
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.cartId} className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-display text-3xl text-[var(--berry)]">{item.name}</h3>
                  <p className="text-sm leading-7 text-[var(--mauve)]">
                    {[item.size, item.color, item.variant, item.printSize]
                      .filter(Boolean)
                      .join(" | ") || "Standard configuration"}
                  </p>
                  {item.giftNote ? (
                    <p className="mt-1 text-sm text-[var(--mauve)]">Gift note: {item.giftNote}</p>
                  ) : null}
                  {item.customizationNotes ? (
                    <p className="mt-1 text-sm text-[var(--mauve)]">
                      Print instructions: {item.customizationNotes}
                    </p>
                  ) : null}
                  {item.customVinyl ? (
                    <p className="mt-1 text-sm text-[var(--mauve)]">
                      Vinyl size: {item.customVinyl.widthCm} x {item.customVinyl.heightCm} cm
                    </p>
                  ) : null}
                  {item.referenceFiles?.length ? (
                    <div className="mt-2 text-sm text-[var(--mauve)]">
                      <p>Reference files:</p>
                      <ul className="mt-1 space-y-1">
                        {item.referenceFiles.map((file) => (
                          <li key={file.id}>
                            {file.url ? (
                              <a href={file.url} target="_blank" rel="noreferrer" className="font-bold text-[var(--rose-deep)]">
                                {file.name}
                              </a>
                            ) : (
                              file.name
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {!itemHasCustomizationDetails(item) ? (
                    <p className="mt-2 text-sm font-bold text-[var(--rose-deep)]">
                      This personalized item still needs at least one uploaded artwork or reference file before checkout.
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.cartId, Number(event.target.value))}
                    className="w-20 rounded-2xl border border-[var(--line)] bg-white px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.cartId)}
                    className="text-sm font-bold text-[var(--rose-deep)]"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="mt-3 text-right text-sm font-extrabold uppercase tracking-[0.2em] text-[var(--berry)]">
                {formatCurrency(item.totalPrice)} each
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white/60 p-6 text-center text-[var(--mauve)]">
            Your cart is empty. Start with the catalogue.
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-[1.5rem] bg-[var(--berry)] px-5 py-4 text-white md:flex-row md:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/70">Subtotal</p>
          <p className="font-display text-4xl">{formatCurrency(subtotal)}</p>
        </div>
        <Link href="/#catalogue" className="rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[var(--berry)]">
          Add more items
        </Link>
      </div>
    </section>
  );
}
