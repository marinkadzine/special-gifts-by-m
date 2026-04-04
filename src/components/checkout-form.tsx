"use client";

import { FormEvent, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { buildWhatsAppOrderMessage } from "@/lib/order-message";
import { calculateCartSubtotal, DELIVERY_FEES, formatCurrency } from "@/lib/pricing";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { CheckoutInput, DeliveryMethod } from "@/types/store";

const WHATSAPP_NUMBER = "27824643498";

export function CheckoutForm() {
  const { items, clearCart } = useCart();
  const subtotal = calculateCartSubtotal(items);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pudo");
  const [status, setStatus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = DELIVERY_FEES[deliveryMethod];
  const total = subtotal + deliveryFee;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) {
      setStatus("Add at least one item before checkout.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload: CheckoutInput = {
      customerName: String(formData.get("customerName") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      deliveryMethod,
      lockerId: String(formData.get("lockerId") || ""),
      address: String(formData.get("address") || ""),
      notes: String(formData.get("notes") || ""),
      paymentMethod: String(formData.get("paymentMethod") || "eft") as "eft" | "whatsapp",
      items,
      subtotal,
      deliveryFee,
      total,
    };

    setSubmitting(true);
    setStatus("Saving your order...");

    try {
      const orderId = `SGM-${Date.now()}`;
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        setStatus(`Order ${orderId} captured in demo mode. Connect Supabase to store live orders.`);
      } else {
        const { error } = await supabase.from("orders").insert({
          order_number: orderId,
          customer_name: payload.customerName,
          phone: payload.phone,
          email: payload.email || null,
          delivery_method: payload.deliveryMethod,
          delivery_fee: payload.deliveryFee,
          payment_method: payload.paymentMethod,
          locker_id: payload.lockerId || null,
          address: payload.address || null,
          notes: payload.notes || null,
          subtotal: payload.subtotal,
          total: payload.total,
          status: "pending",
          items: payload.items,
        });

        if (error) {
          throw new Error(error.message || "Could not submit order.");
        }

        setStatus(
          `Order ${orderId} saved. Next step: send final confirmation via WhatsApp or complete EFT follow-up.`,
        );
      }

      const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppOrderMessage(payload)}`;
      clearCart();
      window.open(whatsappLink, "_blank", "noopener,noreferrer");
      event.currentTarget.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="glass rounded-[2rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">Checkout</p>
          <h2 className="mt-2 font-display text-4xl text-[var(--berry)]">Customer details</h2>
        </div>
        <div className="text-right">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--mauve)]">Estimated total</p>
          <p className="font-display text-4xl text-[var(--berry)]">{formatCurrency(total)}</p>
        </div>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-[var(--berry)]">
            Full name
            <input required name="customerName" className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3" />
          </label>
          <label className="text-sm text-[var(--berry)]">
            Phone / WhatsApp
            <input required name="phone" className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3" />
          </label>
        </div>

        <label className="block text-sm text-[var(--berry)]">
          Email
          <input name="email" type="email" className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3" />
        </label>

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">
            Delivery method
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {(["pudo", "courier", "collection"] as DeliveryMethod[]).map((option) => {
              const active = option === deliveryMethod;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDeliveryMethod(option)}
                  className={`rounded-[1.2rem] border px-4 py-3 text-left ${
                    active ? "border-[var(--rose)] bg-[var(--blush)]" : "border-[var(--line)] bg-white/80"
                  }`}
                >
                  <span className="block font-bold capitalize text-[var(--berry)]">{option}</span>
                  <span className="text-sm text-[var(--mauve)]">{formatCurrency(DELIVERY_FEES[option])}</span>
                </button>
              );
            })}
          </div>
        </div>

        {deliveryMethod === "pudo" ? (
          <label className="block text-sm text-[var(--berry)]">
            PUDO locker ID
            <input
              name="lockerId"
              placeholder="Enter locker ID or preferred locker area"
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
        ) : deliveryMethod === "courier" ? (
          <label className="block text-sm text-[var(--berry)]">
            Delivery address
            <textarea
              name="address"
              className="mt-2 min-h-28 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
        ) : null}

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">
            Payment method
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="rounded-[1.2rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-sm text-[var(--berry)]">
              <input className="mr-2" type="radio" name="paymentMethod" value="eft" defaultChecked />
              EFT now
            </label>
            <label className="rounded-[1.2rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-sm text-[var(--berry)]">
              <input className="mr-2" type="radio" name="paymentMethod" value="whatsapp" />
              WhatsApp confirmation
            </label>
          </div>
        </div>

        <label className="block text-sm text-[var(--berry)]">
          Order notes
          <textarea
            name="notes"
            className="mt-2 min-h-28 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
            placeholder="Anything special we should know?"
          />
        </label>

        <div className="rounded-[1.5rem] bg-[var(--berry)] px-5 py-4 text-white">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span>Delivery</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-3 font-bold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <button disabled={submitting} className="button-primary w-full" type="submit">
          {submitting ? "Submitting order..." : "Place order"}
        </button>

        {status ? <p className="text-sm text-[var(--mauve)]">{status}</p> : null}
      </form>
    </section>
  );
}
