import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function PayfastCancelPage() {
  return (
    <main>
      <SiteHeader />
      <section className="shell py-8">
        <div className="glass rounded-[2rem] p-6 md:p-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">PayFast sandbox</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--berry)] md:text-5xl">
            Payment was cancelled
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--mauve)]">
            No sandbox payment was completed. Your cart is still available so you can try PayFast again or
            switch back to EFT.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/checkout" className="button-primary">
              Return to checkout
            </Link>
            <Link href="/account" className="button-secondary">
              Go to my account
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
