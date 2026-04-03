"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export function SiteHeader() {
  const { items } = useCart();
  const count = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-xl">
      <div className="shell flex items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-full bg-white p-1 shadow-sm">
            <Image src="/branding/logo.png" alt="Special Gifts by M logo" width={44} height={44} />
          </div>
          <div>
            <p className="font-display text-2xl font-semibold leading-none text-[var(--berry)]">
              Special Gifts by M
            </p>
            <p className="text-sm text-[var(--mauve)]">Personalized gifts made beautifully</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-bold text-[var(--berry)] md:flex">
          <Link href="/#featured">Featured</Link>
          <Link href="/#catalogue">Catalogue</Link>
          <Link href="/#launch-guide">Launch Guide</Link>
          <Link href="/checkout" className="button-secondary px-4 py-2">
            Cart {count ? `(${count})` : ""}
          </Link>
        </nav>
      </div>
    </header>
  );
}
