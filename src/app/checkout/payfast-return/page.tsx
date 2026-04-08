"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function PayfastReturnPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main>
      <SiteHeader />
      <section className="shell py-8">
        <div className="glass rounded-[2rem] p-6 md:p-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">PayFast sandbox</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--berry)] md:text-5xl">
            Payment submitted for confirmation
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--mauve)]">
            Your PayFast sandbox payment has been sent back to Special Gifts by M. The order will update
            automatically once PayFast confirms it through the secure notification step.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/account" className="button-primary">
              View my account
            </Link>
            <Link href="/admin" className="button-secondary">
              Open admin dashboard
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
