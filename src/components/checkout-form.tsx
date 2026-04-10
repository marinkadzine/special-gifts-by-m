"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import {
  BUSINESS_CONTACT,
  EFT_DETAILS,
  PAYFAST_ENABLED,
  PAYFAST_STATUS_NOTE,
  PICKUP_DETAILS,
} from "@/lib/business-details";
import {
  calculateCartSubtotal,
  calculateGiftWrapFee,
  estimatePudoLockerSize,
  formatCurrency,
  getDeliveryFee,
  GIFT_WRAP_FEE,
  PUDO_LOCKER_OPTIONS,
} from "@/lib/pricing";
import { getItemsMissingCustomization, serializeOrderItems } from "@/lib/order-items";
import { PudoLockerMapHelper } from "@/components/pudo-locker-map-helper";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { initiatePayfastCheckout, submitPayfastForm } from "@/lib/payfast";
import { CartItem, CheckoutInput, DeliveryMethod, DeliveryOption, PaymentMethod } from "@/types/store";

type GiftWrapMode = "none" | "all" | "selected";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; note: string }[] = [
  {
    value: "payfast",
    label: "PayFast",
    note: PAYFAST_STATUS_NOTE,
  },
  {
    value: "eft",
    label: "EFT",
    note: "Your order will move to Waiting for Approval until the admin confirms that payment reflects in the business account.",
  },
];

const DELIVERY_OPTIONS: { value: DeliveryOption; label: string }[] = [
  { value: "pudo", label: "PUDO" },
  { value: "collection", label: "Pick Up" },
];

function buildDeliverySummaryLine(
  label: string,
  method: DeliveryOption,
  lockerSize?: string,
  lockerId?: string,
) {
  if (method === "collection") {
    return `${label}: Pick Up from ${PICKUP_DETAILS.address}`;
  }

  return [
    `${label}: PUDO`,
    lockerSize ? `Locker size ${lockerSize}` : "",
    lockerId ? `Locker ${lockerId}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { user, profile } = useAuth();
  const subtotal = calculateCartSubtotal(items);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYFAST_ENABLED ? "payfast" : "eft");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [giftWrapMode, setGiftWrapMode] = useState<GiftWrapMode>("none");
  const [wrappedCartIds, setWrappedCartIds] = useState<string[]>([]);
  const [wrapNote, setWrapNote] = useState("");
  const [wrappedDeliveryMethod, setWrappedDeliveryMethod] = useState<DeliveryOption>("pudo");
  const [wrappedLockerId, setWrappedLockerId] = useState("");
  const [remainingDeliveryMethod, setRemainingDeliveryMethod] = useState<DeliveryOption>("pudo");
  const [remainingLockerId, setRemainingLockerId] = useState("");

  useEffect(() => {
    const suggestedName =
      profile?.full_name || String(user?.user_metadata.full_name || user?.email || "").split("@")[0];

    if (!customerName && suggestedName) {
      setCustomerName(suggestedName);
    }

    if (!phone && profile?.phone) {
      setPhone(profile.phone);
    }

    if (!email && user?.email) {
      setEmail(user.email);
    }
  }, [customerName, email, phone, profile?.full_name, profile?.phone, user?.email, user?.user_metadata.full_name]);

  const selectedWrappedIds = useMemo(() => {
    if (giftWrapMode === "all") {
      return items.map((item) => item.cartId);
    }

    if (giftWrapMode === "selected") {
      return wrappedCartIds.filter((cartId) => items.some((item) => item.cartId === cartId));
    }

    return [];
  }, [giftWrapMode, items, wrappedCartIds]);

  const wrappedItems = useMemo(
    () => items.filter((item) => selectedWrappedIds.includes(item.cartId)),
    [items, selectedWrappedIds],
  );
  const remainingItems = useMemo(
    () =>
      giftWrapMode === "none"
        ? items
        : items.filter((item) => !selectedWrappedIds.includes(item.cartId)),
    [giftWrapMode, items, selectedWrappedIds],
  );

  const wrappedPudoSize = wrappedItems.length ? estimatePudoLockerSize(wrappedItems) : undefined;
  const remainingPudoSize = remainingItems.length ? estimatePudoLockerSize(remainingItems) : undefined;
  const giftWrapFee = giftWrapMode === "none" ? 0 : calculateGiftWrapFee(wrappedItems);
  const wrappedDeliveryFee = wrappedItems.length ? getDeliveryFee(wrappedDeliveryMethod, wrappedItems) : 0;
  const remainingDeliveryFee = remainingItems.length ? getDeliveryFee(remainingDeliveryMethod, remainingItems) : 0;
  const deliveryFee =
    giftWrapMode === "none" ? getDeliveryFee(remainingDeliveryMethod, items) : wrappedDeliveryFee + remainingDeliveryFee;
  const total = subtotal + giftWrapFee + deliveryFee;

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

  function toggleWrappedItem(cartId: string) {
    setWrappedCartIds((current) =>
      current.includes(cartId) ? current.filter((entry) => entry !== cartId) : [...current, cartId],
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

    if (giftWrapMode === "selected" && !wrappedItems.length) {
      setStatus("Select at least one cart item for gift wrapping, or choose Entire cart / No gift wrap.");
      return;
    }

    if (!customerName.trim()) {
      setStatus("Please add the customer name before checkout.");
      return;
    }

    if (!phone.trim()) {
      setStatus("Please add the contact phone or WhatsApp number before checkout.");
      return;
    }

    if (giftWrapMode !== "none" && wrappedDeliveryMethod === "pudo" && !wrappedLockerId.trim()) {
      setStatus("Please enter the preferred PUDO locker or area for the wrapped items.");
      return;
    }

    if (remainingItems.length && remainingDeliveryMethod === "pudo" && !remainingLockerId.trim()) {
      setStatus(
        giftWrapMode === "none"
          ? "Please enter the preferred PUDO locker or area before checkout."
          : "Please enter the preferred PUDO locker or area for the remaining items.",
      );
      return;
    }

    if (paymentMethod === "eft" && !user) {
      setStatus("Please sign in before using EFT so your order can move into the Waiting for Approval section.");
      return;
    }

    const formData = new FormData(form);

    if (formData.get("termsAccepted") !== "on") {
      setStatus("Please accept the order terms and delivery note before placing your order.");
      return;
    }

    const wrapSet = new Set(selectedWrappedIds);
    const serializedItems = serializeOrderItems(items).map((item) => {
      const wrapped = wrapSet.has(item.cartId);
      const deliveryGroup: CartItem["deliveryGroup"] =
        giftWrapMode === "none" ? undefined : wrapped ? "wrapped" : "remaining";
      const itemDeliveryMethod =
        giftWrapMode !== "none" && wrapped ? wrappedDeliveryMethod : remainingDeliveryMethod;
      const itemLockerId =
        itemDeliveryMethod === "pudo"
          ? giftWrapMode !== "none" && wrapped
            ? wrappedLockerId.trim() || undefined
            : remainingLockerId.trim() || undefined
          : undefined;
      const itemPudoSize =
        itemDeliveryMethod === "pudo"
          ? giftWrapMode !== "none" && wrapped
            ? wrappedPudoSize
            : remainingPudoSize
          : undefined;

      return {
        ...item,
        giftWrap: wrapped,
        wrappingInstructions: wrapped && wrapNote.trim() ? wrapNote.trim() : undefined,
        deliveryGroup,
        deliveryMethod: itemDeliveryMethod,
        deliveryLockerId: itemLockerId,
        deliveryPudoSize: itemPudoSize,
      };
    });

    const deliverySummaryLines =
      giftWrapMode === "none"
        ? [
            buildDeliverySummaryLine(
              "All items",
              remainingDeliveryMethod,
              remainingDeliveryMethod === "pudo" ? remainingPudoSize : undefined,
              remainingDeliveryMethod === "pudo" ? remainingLockerId.trim() : undefined,
            ),
          ]
        : [
            `Gift wrapping: ${
              giftWrapMode === "all"
                ? "Entire cart"
                : `Selected items - ${wrappedItems.map((item) => item.name).join(", ")}`
            }`,
            wrapNote.trim() ? `Wrapping instructions: ${wrapNote.trim()}` : "",
            wrappedItems.length
              ? buildDeliverySummaryLine(
                  "Wrapped items",
                  wrappedDeliveryMethod,
                  wrappedDeliveryMethod === "pudo" ? wrappedPudoSize : undefined,
                  wrappedDeliveryMethod === "pudo" ? wrappedLockerId.trim() : undefined,
                )
              : "",
            remainingItems.length
              ? buildDeliverySummaryLine(
                  "Remaining items",
                  remainingDeliveryMethod,
                  remainingDeliveryMethod === "pudo" ? remainingPudoSize : undefined,
                  remainingDeliveryMethod === "pudo" ? remainingLockerId.trim() : undefined,
                )
              : "",
          ].filter(Boolean);

    const compiledNotes = [
      String(formData.get("notes") || "").trim(),
      ...deliverySummaryLines,
    ]
      .filter(Boolean)
      .join("\n");

    const orderDeliveryMethod: DeliveryMethod =
      giftWrapMode !== "none" && wrappedItems.length && remainingItems.length
        ? "split"
        : giftWrapMode === "all"
          ? wrappedDeliveryMethod
          : remainingDeliveryMethod;

    const payload: CheckoutInput = {
      customerId: user?.id,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      deliveryMethod: orderDeliveryMethod,
      pudoSize:
        orderDeliveryMethod === "pudo"
          ? giftWrapMode === "all"
            ? wrappedPudoSize
            : remainingPudoSize
          : undefined,
      lockerId:
        orderDeliveryMethod === "pudo"
          ? giftWrapMode === "all"
            ? wrappedLockerId.trim() || undefined
            : remainingLockerId.trim() || undefined
          : undefined,
      address: orderDeliveryMethod === "collection" ? PICKUP_DETAILS.address : undefined,
      notes: compiledNotes,
      paymentMethod,
      items: serializedItems,
      subtotal: subtotal + giftWrapFee,
      deliveryFee,
      total,
    };

    setSubmitting(true);
    setStatus(paymentMethod === "payfast" ? "Preparing PayFast checkout..." : "Moving your order to Waiting for Approval...");

    try {
      if (paymentMethod === "payfast") {
        if (!payload.email) {
          throw new Error("Email is required for PayFast checkout.");
        }

        const payfastCheckout = await initiatePayfastCheckout(payload);
        setStatus(`Redirecting you to PayFast for order ${payfastCheckout.orderNumber}...`);
        submitPayfastForm(payfastCheckout.paymentUrl, payfastCheckout.fields);
        return;
      }

      const orderId = `SGM-${Date.now()}`;
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        throw new Error("Supabase is not connected yet, so EFT approval orders cannot be saved.");
      }

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
        status: "waiting_for_approval",
        items: serializedItems,
      } as never);

      if (error) {
        throw new Error(error.message || "Could not submit order.");
      }

      clearCart();
      form.reset();
      setWrappedCartIds([]);
      setGiftWrapMode("none");
      setWrapNote("");
      setWrappedDeliveryMethod("pudo");
      setWrappedLockerId("");
      setRemainingDeliveryMethod("pudo");
      setRemainingLockerId("");
      setCustomerName(profile?.full_name || "");
      setPhone(profile?.phone || "");
      setEmail(user?.email || "");
      router.push("/account");
      return;
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
          Signed in as <strong>{user.email}</strong>. EFT orders can move straight into your Waiting for Approval section.
        </div>
      ) : (
        <div className="mt-5 rounded-[1.5rem] bg-white/80 p-4 text-sm leading-7 text-[var(--berry)]">
          Guests can still use PayFast, but EFT orders require login so they can be tracked in Waiting for Approval.
        </div>
      )}

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-[1.5rem] bg-white/80 p-4 text-sm leading-7 text-[var(--berry)]">
          Personalized items still require at least one uploaded artwork or reference file. Customers can remove cart items in the cart panel before final checkout.
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
            <input
              required
              name="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
            />
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

        <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/75 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">Gift wrapping</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              { value: "none", label: "No gift wrap" },
              { value: "all", label: "Wrap entire cart" },
              { value: "selected", label: "Wrap selected items" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGiftWrapMode(option.value as GiftWrapMode)}
                className={`rounded-[1.2rem] border px-4 py-3 text-left ${
                  giftWrapMode === option.value
                    ? "border-[var(--rose)] bg-[var(--soft-rose)]"
                    : "border-[var(--line)] bg-white/80"
                }`}
              >
                <span className="block font-bold text-[var(--berry)]">{option.label}</span>
              </button>
            ))}
          </div>

          {giftWrapMode === "selected" ? (
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <label key={item.cartId} className="flex items-start gap-3 rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--berry)]">
                  <input
                    type="checkbox"
                    checked={selectedWrappedIds.includes(item.cartId)}
                    onChange={() => toggleWrappedItem(item.cartId)}
                    className="mt-1"
                  />
                  <span>
                    <strong>
                      {item.quantity} x {item.name}
                    </strong>
                    <span className="mt-1 block text-[var(--mauve)]">
                      {[item.size, item.color, item.variant, item.printSize].filter(Boolean).join(" | ") || "Standard configuration"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          ) : null}

          {giftWrapMode !== "none" ? (
            <>
              <label className="mt-4 block text-sm text-[var(--berry)]">
                Wrapping note or instructions
                <textarea
                  value={wrapNote}
                  onChange={(event) => setWrapNote(event.target.value)}
                  className="mt-2 min-h-28 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
                  placeholder="Optional: add a note about wrapping style, colours, or a card message."
                />
              </label>
              <p className="mt-3 text-sm text-[var(--mauve)]">
                Gift wrapping is charged at {formatCurrency(GIFT_WRAP_FEE)} per wrapped cart line.
              </p>
            </>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/75 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">Delivery planning</p>

          {giftWrapMode !== "none" && wrappedItems.length ? (
            <div className="mt-4 rounded-[1.2rem] border border-[var(--line)] bg-white p-4">
              <p className="font-bold text-[var(--berry)]">Wrapped items delivery</p>
              <p className="mt-2 text-sm text-[var(--mauve)]">
                {wrappedItems.length} wrapped cart line{wrappedItems.length === 1 ? "" : "s"} | {formatCurrency(wrappedDeliveryFee)}
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {DELIVERY_OPTIONS.map((option) => (
                  <button
                    key={`wrapped-${option.value}`}
                    type="button"
                    onClick={() => setWrappedDeliveryMethod(option.value)}
                    className={`rounded-[1.2rem] border px-4 py-3 text-left ${
                      wrappedDeliveryMethod === option.value
                        ? "border-[var(--rose)] bg-[var(--soft-rose)]"
                        : "border-[var(--line)] bg-white/80"
                    }`}
                  >
                    <span className="block font-bold text-[var(--berry)]">{option.label}</span>
                  </button>
                ))}
              </div>
              {wrappedDeliveryMethod === "pudo" ? (
                <div className="mt-4 rounded-[1rem] bg-[var(--light-grey)] p-4">
                  <p className="text-sm text-[var(--berry)]">
                    Estimated wrapped-items locker: <strong>{wrappedPudoSize ? PUDO_LOCKER_OPTIONS[wrappedPudoSize].label : "N/A"}</strong>
                    {wrappedPudoSize ? ` (${wrappedPudoSize})` : ""}
                  </p>
                  <PudoLockerMapHelper />
                  <label className="mt-4 block text-sm text-[var(--berry)]">
                    Wrapped items PUDO locker or area
                    <input
                      value={wrappedLockerId}
                      onChange={(event) => setWrappedLockerId(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-4 rounded-[1rem] bg-[var(--light-grey)] p-4 text-sm leading-7 text-[var(--berry)]">
                  <p className="font-bold">{PICKUP_DETAILS.label}</p>
                  <p className="mt-2 text-[var(--mauve)]">{PICKUP_DETAILS.address}</p>
                </div>
              )}
            </div>
          ) : null}

          {remainingItems.length ? (
            <div className="mt-4 rounded-[1.2rem] border border-[var(--line)] bg-white p-4">
              <p className="font-bold text-[var(--berry)]">
                {giftWrapMode === "none" ? "All items delivery" : "Remaining items delivery"}
              </p>
              <p className="mt-2 text-sm text-[var(--mauve)]">
                {remainingItems.length} cart line{remainingItems.length === 1 ? "" : "s"} | {formatCurrency(giftWrapMode === "none" ? deliveryFee : remainingDeliveryFee)}
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {DELIVERY_OPTIONS.map((option) => (
                  <button
                    key={`remaining-${option.value}`}
                    type="button"
                    onClick={() => setRemainingDeliveryMethod(option.value)}
                    className={`rounded-[1.2rem] border px-4 py-3 text-left ${
                      remainingDeliveryMethod === option.value
                        ? "border-[var(--rose)] bg-[var(--soft-rose)]"
                        : "border-[var(--line)] bg-white/80"
                    }`}
                  >
                    <span className="block font-bold text-[var(--berry)]">{option.label}</span>
                  </button>
                ))}
              </div>
              {remainingDeliveryMethod === "pudo" ? (
                <div className="mt-4 rounded-[1rem] bg-[var(--light-grey)] p-4">
                  <p className="text-sm text-[var(--berry)]">
                    Estimated locker: <strong>{remainingPudoSize ? PUDO_LOCKER_OPTIONS[remainingPudoSize].label : "N/A"}</strong>
                    {remainingPudoSize ? ` (${remainingPudoSize})` : ""}
                  </p>
                  <PudoLockerMapHelper />
                  <label className="mt-4 block text-sm text-[var(--berry)]">
                    {giftWrapMode === "none" ? "Preferred PUDO locker or area" : "Remaining items PUDO locker or area"}
                    <input
                      value={remainingLockerId}
                      onChange={(event) => setRemainingLockerId(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-4 rounded-[1rem] bg-[var(--light-grey)] p-4 text-sm leading-7 text-[var(--berry)]">
                  <p className="font-bold">{PICKUP_DETAILS.label}</p>
                  <p className="mt-2 text-[var(--mauve)]">{PICKUP_DETAILS.address}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/75 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">Payment method</p>
          <div className="mt-4 grid gap-3">
            {PAYMENT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`rounded-[1.2rem] border px-4 py-3 text-sm ${
                  paymentMethod === option.value
                    ? "border-[var(--rose)] bg-[var(--soft-rose)]"
                    : "border-[var(--line)] bg-white/80"
                }`}
              >
                <input
                  className="mr-2"
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={() => setPaymentMethod(option.value)}
                />
                <span className="font-bold text-[var(--berry)]">{option.label}</span>
                <span className="mt-2 block text-[var(--mauve)]">{option.note}</span>
              </label>
            ))}
          </div>

          {paymentMethod === "eft" ? (
            <div className="mt-4 rounded-[1rem] bg-[var(--light-grey)] p-4 text-sm leading-7 text-[var(--berry)]">
              <p className="font-bold">{EFT_DETAILS.accountName}</p>
              <p>{EFT_DETAILS.bank}</p>
              <p>Account Number: {EFT_DETAILS.accountNumber}</p>
              <p>SWIFT/BIC: {EFT_DETAILS.swift}</p>
              <p>Branch Code: {EFT_DETAILS.branchCode}</p>
              <p className="mt-3 text-[var(--mauve)]">
                Once this EFT order is submitted, your cart moves to Waiting for Approval while the admin checks the bank account.
              </p>
            </div>
          ) : null}
        </div>

        <label className="block text-sm text-[var(--berry)]">
          Additional order notes
          <textarea
            name="notes"
            className="mt-2 min-h-28 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
            placeholder="Anything else the team should know?"
          />
        </label>

        <label className="flex items-start gap-3 rounded-[1.5rem] bg-white/80 p-4 text-sm leading-7 text-[var(--berry)]">
          <input type="checkbox" name="termsAccepted" className="mt-1" />
          <span>
            I understand that the typical lead time can be around 7 days, Special Gifts by M is not liable
            for delivery delays once an order has been handed over, and personalized orders can only move
            ahead once artwork, payment, and delivery details are confirmed.
          </span>
        </label>

        <div className="rounded-[1.5rem] bg-[var(--berry)] px-5 py-4 text-white">
          <div className="flex items-center justify-between text-sm">
            <span>Cart subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span>Gift wrapping</span>
            <span>{formatCurrency(giftWrapFee)}</span>
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
          {submitting
            ? "Submitting order..."
            : paymentMethod === "payfast"
              ? "Continue to PayFast"
              : "Move order to Waiting for Approval"}
        </button>

        {paymentMethod === "eft" ? (
          <p className="text-sm leading-7 text-[var(--mauve)]">
            Need help with EFT? Banking details are also available on the Contact Us page, or you can reach the team on WhatsApp at {BUSINESS_CONTACT.phoneDisplay}.
          </p>
        ) : null}

        {status ? <p className="text-sm text-[var(--mauve)]">{status}</p> : null}
      </form>
    </section>
  );
}
