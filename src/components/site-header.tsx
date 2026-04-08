"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";

export function SiteHeader() {
  const { items } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { isAdmin, signOut, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const storeLinks = [
    { href: "/#store-personalized", label: "Personalized Items" },
    { href: "/#store-ready-made", label: "Ready-Made Items" },
  ];
  const galleryLink = { href: "/gallery", label: "Gallery" };

  const menuLinks = [
    { href: "/about", label: "About Us" },
    { href: isAdmin ? "/admin" : "/account", label: isAdmin ? "Admin Profile" : "My Profile" },
    { href: "/contact", label: "Contact Us" },
    galleryLink,
    ...storeLinks,
  ];

  async function handleSignOut() {
    await signOut();
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-xl">
      <div className="shell flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => {
            setMenuOpen(false);
            setStoreOpen(false);
          }}
        >
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

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setStoreOpen((value) => !value);
                    setMenuOpen(false);
                  }}
                  className="button-secondary min-w-28 px-5 py-3 text-sm"
                  aria-expanded={storeOpen}
                  aria-controls="store-menu"
                >
                  Store
                </button>

                {storeOpen ? (
                  <div
                    id="store-menu"
                    className="absolute right-0 top-[calc(100%+0.75rem)] w-72 rounded-[1.8rem] border border-white/40 bg-white/92 p-4 shadow-[var(--shadow)]"
                  >
                    <nav className="space-y-2">
                      {[...storeLinks, galleryLink].map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block rounded-[1rem] px-4 py-3 text-sm font-bold text-[var(--berry)] transition hover:bg-[var(--soft-rose)]"
                          onClick={() => setStoreOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                  </div>
                ) : null}
              </div>

              <Link href="/account" className="button-primary text-sm">
                Sign Up / Login
              </Link>
            </>
          ) : (
            <>
              <Link href="/wishlist" className="button-secondary px-4 py-3 text-sm">
                Wishlist{wishlistCount ? ` (${wishlistCount})` : ""}
              </Link>
              <Link href="/checkout" className="button-secondary px-4 py-3 text-sm">
                Cart / Checkout{count ? ` (${count})` : ""}
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen((value) => !value);
                    setStoreOpen(false);
                  }}
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
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="block w-full rounded-[1rem] px-4 py-3 text-left text-sm font-bold text-[var(--rose-deep)] transition hover:bg-[var(--soft-rose)]"
                      >
                        Log Out
                      </button>
                    </nav>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
