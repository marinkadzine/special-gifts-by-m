"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const slides = [
  {
    eyebrow: "Specials",
    title: "Thoughtful gifts, custom printing, and gifting support in one store.",
    description:
      "Shop apparel, drinkware, decor, and branded essentials from one soft, gift-ready storefront.",
    ctaLabel: "Shop Personalized",
    ctaHref: "#store-personalized",
    accent: "from-[rgba(255,79,163,0.22)] to-[rgba(199,154,178,0.32)]",
  },
  {
    eyebrow: "Lead Time",
    title: "Made to order with care, with a typical lead time of around 7 days.",
    description:
      "Customers can request a callback, upload artwork, and agree to the lead-time terms before checkout.",
    ctaLabel: "Read Before Checkout",
    ctaHref: "/checkout",
    accent: "from-[rgba(246,209,220,0.58)] to-[rgba(233,175,194,0.36)]",
  },
  {
    eyebrow: "Gift-Ready",
    title: "Browse ready-made picks and personalized items in separate store sections.",
    description:
      "Featured products, gifting support, wishlist saving, and customer accounts all work together in one flow.",
    ctaLabel: "Shop Ready-Made",
    ctaHref: "#store-ready-made",
    accent: "from-[rgba(255,255,255,0.62)] to-[rgba(199,154,178,0.28)]",
  },
];

export function SpecialsSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4800);

    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = slides[activeIndex];

  return (
    <section className="shell">
      <div className={`glass relative overflow-hidden rounded-[2rem] p-6 md:p-8`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${activeSlide.accent}`} />
        <div className="relative z-10 grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-end">
          <div className="fade-up">
            <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[var(--mauve)]">
              {activeSlide.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl text-[var(--berry)] md:text-6xl">
              {activeSlide.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--berry)]/80">
              {activeSlide.description}
            </p>
            <Link href={activeSlide.ctaHref} className="button-primary mt-6 inline-flex">
              {activeSlide.ctaLabel}
            </Link>
          </div>

          <div className="rounded-[1.5rem] bg-white/78 p-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
              What customers can do
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--berry)]">
              <li>Sign up, log in, save a wishlist, and place orders.</li>
              <li>Upload logos or photos before checkout.</li>
              <li>Choose PUDO, courier, or collection at checkout.</li>
              <li>Use the callback form when help is needed.</li>
            </ul>
            <div className="mt-5 flex gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 flex-1 rounded-full transition ${
                    index === activeIndex ? "bg-[var(--rose)]" : "bg-[var(--soft-rose)]"
                  }`}
                  aria-label={`Show slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
