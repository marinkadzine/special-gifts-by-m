"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import {
  BUSINESS_CONTACT,
  EFT_DETAILS,
  PAYFAST_ENABLED,
  PAYFAST_STATUS_NOTE,
  PICKUP_DETAILS,
} from "@/lib/business-details";
import { buildWhatsAppOrderMessage } from "@/lib/order-message";
import {
  calculateCartSubtotal,
  estimatePudoLockerSize,
  formatCurrency,
  getDeliveryFee,
  PUDO_LOCKER_OPTIONS,
} from "@/lib/pricing";
import { getItemsMissingCustomization, serializeOrderItems } from "@/lib/order-items";
import { PudoLockerMapHelper } from "@/components/pudo-locker-map-helper";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { CheckoutInput, DeliveryMethod, PaymentMethod } from "@/types/store";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; note: string }[] = [
  {
    value: "eft",
    label: "EFT",
    note: `${EFT_DETAILS.bank} | Acc ${EFT_DETAILS.accountNumber}`,
  },
  ...(PAYFAST_ENABLED
    ? [
        {
          value: "payfast" as PaymentMethod,
          label: "PayFast",
          note: PAYFAST_STATUS_NOTE,
        },
      ]
    : []),
];

export function CheckoutForm() {
  const { items, clearCart } = useCart();
  const { user, profile } = useAuth();
  const subtotal = calculateCartSubtotal(items);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pudo");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("eft");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pudoSize = estimatePudoLockerSize(items);
  const deliveryFee = getDeliveryFee(deliveryMethod, items);
  const total = subtotal + deliveryFee;

  useEffect(() => {
    const suggestedName =
      profile?.full_name || String(user?.user_metadata.full_name || user?.email || "").split("@")[0];

    if (!customerName && suggestedName) {
      setCustomerName(suggestedName);
    }

    if (!email && user?.email) {
      setEmail(user.email);
    }
  }, [customerName, email, profile?.full_name, user?.email, user?.user_metadata.full_name]);

  if (!items.length) {
    return (
      <section className="glass rounded-[2rem] p-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">Checkout</p>
        <h2 className="mt-2 font-display text-4xl text-[var(--berry)]">Your cart is empty</h2>
        <p className="mt-4 text-base leading-8 text-[var(--mauve)]">
          Checkout is only available once you have added at least one item to your cart.
        </p>
        <Link href="/#catalogue" className="button-primary mt-6 inline-flex">
          Browse the catalogue
        </Link>
      </section>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!items.length) {
      setStatus("Add at least one item before checkout.");
      return;
    }

    const incompleteItems = getItemsMissingCustomization(items);

    if (incompleteItems.length) {
      setStatus(
        `Please remove and re-add these personalized item(s) with at least one uploaded artwork/reference file first: ${incompleteItems
          .map((item) => item.name)
          .join(", ")}.`,
      );
      return;
    }

    const formData = new FormData(form);

    if (formData.get("termsAccepted") !== "on") {
      setStatus("Please accept the order terms and delivery note before placing your order.");
      return;
    }

    const serializedItems = serializeOrderItems(items);
    const payload: CheckoutInput = {
      customerId: user?.id,
      customerName: customerName.trim(),
      phone: String(formData.get("phone") || ""),
      email: email.trim(),
      deliveryMethod,
      pudoSize: deliveryMethod === "pudo" ? pudoSize : undefined,
      lockerId: String(formData.get("lockerId") || ""),
      address:
        deliveryMethod === "collection"
          ? PICKUP_DETAILS.address
          : String(formData.get("address") || ""),
      notes: String(formData.get("notes") || ""),
      paymentMethod,
      items: serializedItems,
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
          customer_id: payload.customerId ?? null,
          customer_name: payload.customerName,
          phone: payload.phone,
          email: payload.email || null,
          delivery_method: payload.deliveryMethod,
          delivery_fee: payload.deliveryFee,
          payment_method: payload.paymentMethod,
          pudo_size: payload.pudoSize || null,
          locker_id: payload.lockerId || null,
          address: payload.address || null,
          notes: payload.notes || null,
          subtotal: payload.subtotal,
          total: payload.total,
          status: "pending",
          items: serializedItems,
        } as never);

        if (error) {
          throw new Error(error.message || "Could not submit order.");
        }

        setStatus(`Order ${orderId} saved. The team can now follow up with your chosen payment method.`);
      }

      const whatsappLink = `https://wa.me/${BUSINESS_CONTACT.phoneLink}?text=${buildWhatsAppOrderMessage(payload)}`;
      clearCart();
      window.open(whatsappLink, "_blank", "noopener,noreferrer");
      form.reset();
      setCustomerName(profile?.full_name || "");
      setEmail(user?.email || "");
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

      {user ? (
        <div className="mt-5 rounded-[1.5rem] bg-white/80 p-4 text-sm leading-7 text-[var(--berry)]">
          Signed in as <strong>{user.email}</strong>. This order will be linked to your customer account.
        </div>
      ) : (
        <div className="mt-5 rounded-[1.5rem] bg-white/80 p-4 text-sm leading-7 text-[var(--berry)]">
          Guests can still order, but customers who sign up can keep login details and view account-linked orders later.
        </div>
      )}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="rounded-[1.5rem] bg-white/80 p-4 text-sm leading-7 text-[var(--berry)]">
          Every personalized product must include at least one uploaded artwork or reference file before
          checkout. Written instructions are optional, but still recommended.
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-[var(--berry)]">
            Full name
            <input
              required
              name="customerName"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <label className="text-sm text-[var(--berry)]">
            Phone / WhatsApp
            <input required name="phone" className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3" />
          </label>
        </div>

        <label className="block text-sm text-[var(--berry)]">
          Email
          <input
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
          />
        </label>

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">
            Delivery method
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {(["pudo", "courier", "collection"] as DeliveryMethod[]).map((option) => {
              const active = option === deliveryMethod;
              const optionFee = getDeliveryFee(option, items);

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDeliveryMethod(option)}
                  className={`rounded-[1.2rem] border px-4 py-3 text-left ${
                    active ? "border-[var(--rose)] bg-[var(--soft-rose)]" : "border-[var(--line)] bg-white/80"
                  }`}
                >
                  <span className="block font-bold capitalize text-[var(--berry)]">{option}</span>
                  <span className="text-sm text-[var(--mauve)]">{formatCurrency(optionFee)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {deliveryMethod === "pudo" ? (
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/75 p-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">
              PUDO locker estimate
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--berry)]">
              Cart-based estimate: <strong>{PUDO_LOCKER_OPTIONS[pudoSize].label}</strong> ({pudoSize}) |{" "}
              {PUDO_LOCKER_OPTIONS[pudoSize].dimensions} | {formatCurrency(PUDO_LOCKER_OPTIONS[pudoSize].fee)}
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">
              The brief asked for locker sizing to be worked out automatically from the cart before payment.
              This estimate uses item count so the delivery charge is included up front.
            </p>
            <PudoLockerMapHelper />
            <label className="mt-4 block text-sm text-[var(--berry)]">
              Preferred PUDO locker ID or area
              <input
                name="lockerId"
                placeholder="Enter locker ID or preferred locker area"
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
          </div>
        ) : null}

        {deliveryMethod === "courier" ? (
          <label className="block text-sm text-[var(--berry)]">
            Delivery address
            <textarea
              name="address"
              className="mt-2 min-h-28 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
        ) : null}

        {deliveryMethod === "collection" ? (
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/75 p-4 text-sm leading-7 text-[var(--berry)]">
            <p className="font-bold">{PICKUP_DETAILS.label}</p>
            <p className="mt-2 text-[var(--mauve)]">{PICKUP_DETAILS.address}</p>
            <p className="mt-2 text-[var(--mauve)]">{PICKUP_DETAILS.note}</p>
          </div>
        ) : null}

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">
            Payment method
          </p>
          {!PAYFAST_ENABLED ? (
            <div className="mb-3 rounded-[1.5rem] bg-white/80 p-4 text-sm leading-7 text-[var(--berry)]">
              {PAYFAST_STATUS_NOTE}
            </div>
          ) : null}
          <div className="grid gap-3">
            {PAYMENT_OPTIONS.map((option) => {
              const active = paymentMethod === option.value;

              return (
                <label
                  key={option.value}
                  className={`rounded-[1.2rem] border px-4 py-3 text-sm ${
                    active ? "border-[var(--rose)] bg-[var(--soft-rose)]" : "border-[var(--line)] bg-white/80"
                  }`}
                >
                  <input
                    className="mr-2"
                    type="radio"
                    name="paymentMethod"
                    value={option.value}
                    checked={active}
                    onChange={() => setPaymentMethod(option.value)}
                  />
                  <span className="font-bold text-[var(--berry)]">{option.label}</span>
                  <span className="mt-2 block text-[var(--mauve)]">{option.note}</span>
                </label>
              );
            })}
          </div>

          {paymentMethod === "eft" ? (
            <div className="mt-3 rounded-[1.5rem] bg-white/80 p-4 text-sm leading-7 text-[var(--berry)]">
              <p className="font-bold">{EFT_DETAILS.accountName}</p>
              <p>{EFT_DETAILS.bank}</p>
              <p>Account Number: {EFT_DETAILS.accountNumber}</p>
              <p>SWIFT/BIC: {EFT_DETAILS.swift}</p>
              <p>Branch Code: {EFT_DETAILS.branchCode}</p>
            </div>
          ) : null}
        </div>

        <label className="block text-sm text-[var(--berry)]">
          Order notes
          <textarea
            name="notes"
            className="mt-2 min-h-28 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
            placeholder="Anything special we should know?"
          />
        </label>

        <label className="flex items-start gap-3 rounded-[1.5rem] bg-white/80 p-4 text-sm leading-7 text-[var(--berry)]">
          <input type="checkbox" name="termsAccepted" className="mt-1" />
          <span>
            I understand that the typical lead time can be around 7 days, Special Gifts by M is not liable
            for courier or delivery delays once an order has been handed over, and personalized orders can
            only move ahead once artwork, payment, and delivery details are confirmed.
          </span>
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
