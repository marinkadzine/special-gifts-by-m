"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import { useStoreProducts } from "@/hooks/use-store-products";
import { DOWNLOAD_PAGE_URL } from "@/lib/app-distribution";
import { getCategoryAnchor, getStoreSectionAnchor, getStoreSectionLabel } from "@/lib/store-navigation";

export function SiteHeader() {
  const { items } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { isAdmin, profile, signOut, user } = useAuth();
  const { categories, personalizedProducts, readyMadeProducts } = useStoreProducts();
  const [menuOpen, setMenuOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const profileLabel = profile?.full_name || user?.user_metadata.full_name || user?.email || "Account";
  const initials = profileLabel
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase() || "")
    .join("");

  const personalizedCategories = categories.filter((category) =>
    personalizedProducts.some((product) => product.category === category),
  );
  const designedCategories = categories.filter((category) =>
    readyMadeProducts.some((product) => product.category === category),
  );

  const storeSections = [
    {
      section: "personalized" as const,
      href: `/#${getStoreSectionAnchor("personalized")}`,
      label: getStoreSectionLabel("personalized"),
      categories: personalizedCategories,
    },
    {
      section: "ready-made" as const,
      href: `/#${getStoreSectionAnchor("ready-made")}`,
      label: getStoreSectionLabel("ready-made"),
      categories: designedCategories,
    },
  ];
  const galleryLink = { href: "/gallery", label: "Gallery" };
  const reviewsLink = { href: "/reviews", label: "Reviews" };
  const downloadLink = { href: DOWNLOAD_PAGE_URL, label: "Download App", external: true };

  const menuLinks = [
    { href: "/about", label: "About Us" },
    { href: isAdmin ? "/admin" : "/account", label: isAdmin ? "Admin Profile" : "My Profile" },
    { href: "/contact", label: "Contact Us" },
    galleryLink,
    reviewsLink,
    downloadLink,
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
                      {storeSections.map((storeSection) => (
                        <div key={storeSection.section} className="rounded-[1.2rem] border border-[var(--line)] bg-white/75 p-3">
                          <Link
                            href={storeSection.href}
                            className="block rounded-[0.9rem] px-3 py-2 text-sm font-extrabold text-[var(--berry)] transition hover:bg-[var(--soft-rose)]"
                            onClick={() => setStoreOpen(false)}
                          >
                            {storeSection.label}
                          </Link>
                          <div className="mt-2 flex flex-wrap gap-2 px-1">
                            {storeSection.categories.map((category) => (
                              <Link
                                key={`${storeSection.section}-${category}`}
                                href={`/#${getCategoryAnchor(storeSection.section, category)}`}
                                className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-bold text-[var(--berry)] transition hover:border-[var(--rose)]"
                                onClick={() => setStoreOpen(false)}
                              >
                                {category}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                      {[galleryLink, reviewsLink].map((link) => (
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

              <a href={DOWNLOAD_PAGE_URL} className="button-secondary px-4 py-3 text-sm">
                Download App
              </a>
              <Link href="/account" className="button-primary text-sm">
                Sign Up / Login
              </Link>
            </>
          ) : (
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
                    className="absolute right-0 top-[calc(100%+0.75rem)] w-[22rem] rounded-[1.8rem] border border-white/40 bg-white/92 p-4 shadow-[var(--shadow)]"
                  >
                    <nav className="space-y-3">
                      {storeSections.map((storeSection) => (
                        <div key={storeSection.section} className="rounded-[1.2rem] border border-[var(--line)] bg-white/75 p-3">
                          <Link
                            href={storeSection.href}
                            className="block rounded-[0.9rem] px-3 py-2 text-sm font-extrabold text-[var(--berry)] transition hover:bg-[var(--soft-rose)]"
                            onClick={() => setStoreOpen(false)}
                          >
                            {storeSection.label}
                          </Link>
                          <div className="mt-2 flex flex-wrap gap-2 px-1">
                            {storeSection.categories.map((category) => (
                              <Link
                                key={`${storeSection.section}-${category}`}
                                href={`/#${getCategoryAnchor(storeSection.section, category)}`}
                                className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-bold text-[var(--berry)] transition hover:border-[var(--rose)]"
                                onClick={() => setStoreOpen(false)}
                              >
                                {category}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </nav>
                  </div>
                ) : null}
              </div>
              <Link href="/wishlist" className="button-secondary px-4 py-3 text-sm">
                Wishlist{wishlistCount ? ` (${wishlistCount})` : ""}
              </Link>
              <Link href="/checkout" className="button-secondary px-4 py-3 text-sm">
                Cart / Checkout{count ? ` (${count})` : ""}
              </Link>
              <Link href={isAdmin ? "/admin" : "/account"} className="flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-sm">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={profileLabel}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--soft-rose)] text-sm font-extrabold text-[var(--rose-deep)]">
                    {initials || "SG"}
                  </span>
                )}
                <span className="hidden max-w-32 truncate text-sm font-bold text-[var(--berry)] md:block">
                  {profileLabel}
                </span>
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
                      {menuLinks.map((link) =>
                        "external" in link && link.external ? (
                          <a
                            key={link.href}
                            href={link.href}
                            className="block rounded-[1rem] px-4 py-3 text-sm font-bold text-[var(--berry)] transition hover:bg-[var(--soft-rose)]"
                            onClick={() => setMenuOpen(false)}
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block rounded-[1rem] px-4 py-3 text-sm font-bold text-[var(--berry)] transition hover:bg-[var(--soft-rose)]"
                            onClick={() => setMenuOpen(false)}
                          >
                            {link.label}
                          </Link>
                        ),
                      )}
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
