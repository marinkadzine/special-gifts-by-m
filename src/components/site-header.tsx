"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { SOCIAL_LINKS } from "@/lib/business-details";

export function SiteHeader() {
  const { items } = useCart();
  const { isAdmin, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = items.reduce((total, item) => total + item.quantity, 0);

  const menuLinks = [
    { href: "/#featured", label: "Featured" },
    { href: "/#gallery", label: "Gallery" },
    { href: "/#catalogue", label: "Catalogue" },
    { href: "/#callback", label: "Call Back" },
    { href: "/checkout", label: count ? `Cart (${count})` : "Cart" },
    { href: "/account", label: user ? "My Account" : "Login / Sign Up" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-xl">
      <div className="shell flex items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
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

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="button-secondary min-w-28 px-5 py-3 text-sm"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
          >
            Menu
          </button>

          {menuOpen ? (
            <div
              id="site-menu"
              className="absolute right-0 top-[calc(100%+0.75rem)] w-72 rounded-[1.8rem] border border-white/40 bg-white/92 p-4 shadow-[var(--shadow)]"
            >
              <nav className="space-y-2">
                {menuLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-[1rem] px-4 py-3 text-sm font-bold text-[var(--berry)] transition hover:bg-[var(--soft-rose)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="block rounded-[1rem] px-4 py-3 text-sm font-bold text-[var(--berry)] transition hover:bg-[var(--soft-rose)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin
                  </Link>
                ) : null}
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-[1rem] px-4 py-3 text-sm font-bold text-[var(--berry)] transition hover:bg-[var(--soft-rose)]"
                >
                  Facebook
                </a>
                <a
                  href={SOCIAL_LINKS.whatsappChannel}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-[1rem] px-4 py-3 text-sm font-bold text-[var(--berry)] transition hover:bg-[var(--soft-rose)]"
                >
                  WhatsApp Channel
                </a>
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
