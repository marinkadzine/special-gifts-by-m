"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const bannerHighlights = [
  "Stone slab sizes now price individually",
  "Vinyl stickers calculate live by size",
  "Gift wrap is chosen at checkout",
  "PUDO and Pick Up stay available",
  "Gallery showcases multiple photos per item",
];

const slides = [
  {
    eyebrow: "This Week's Specials",
    title: "Stone slabs, stickers, and gifting extras now update more clearly as customers build an order.",
    description:
      "Customers can see size-based stone slab pricing, live vinyl sticker estimates, and a cleaner path into checkout without extra option clutter.",
    ctaLabel: "Shop Personalized",
    ctaHref: "#store-personalized",
    accent: "from-[rgba(255,79,163,0.18)] via-[rgba(246,209,220,0.6)] to-[rgba(255,255,255,0.28)]",
    spotlight: ["Stone slab sizing now starts at R120 and steps up by size.", "Vinyl sticker pricing still updates live from the entered measurements."],
  },
  {
    eyebrow: "Gift-Ready Flow",
    title: "Customers can move from browsing into wrapping, delivery choice, and payment without leaving the app flow.",
    description:
      "The specials banner keeps the important points visible while customers decide whether they want PUDO, Pick Up, custom artwork, or wrapped gifts.",
    ctaLabel: "Go To Checkout",
    ctaHref: "/checkout",
    accent: "from-[rgba(255,255,255,0.72)] via-[rgba(239,191,208,0.44)] to-[rgba(185,135,162,0.26)]",
    spotlight: ["Gift wrapping is chosen later so customers can decide item by item.", "Delivery stays flexible with PUDO or Pick Up options."],
  },
  {
    eyebrow: "Showcase More",
    title: "Previous work can now tell a fuller story with multiple gallery images inside one gallery item.",
    description:
      "Admins can upload or paste more than one image for the same finished job, which gives customers a better look at real work before they order.",
    ctaLabel: "View Gallery",
    ctaHref: "/gallery",
    accent: "from-[rgba(255,239,245,0.85)] via-[rgba(246,209,220,0.52)] to-[rgba(201,154,178,0.24)]",
    spotlight: ["Gallery cards can switch between multiple photos.", "Featured work now feels closer to a real portfolio showcase."],
  },
];

export function SpecialsSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4600);

    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = slides[activeIndex];
  const loopingHighlights = [...bannerHighlights, ...bannerHighlights];

  return (
    <section className="shell">
      <div className="glass relative overflow-hidden rounded-[2rem]">
        <div className={`absolute inset-0 bg-gradient-to-br ${activeSlide.accent}`} />
        <div className="relative z-10 border-b border-white/35 bg-white/48 px-4 py-3 md:px-6">
          <div className="marquee-track">
            {loopingHighlights.map((highlight, index) => (
              <p key={`${highlight}-${index}`} className="marquee-copy text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--berry)]">
                {highlight}
              </p>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid gap-6 p-6 md:grid-cols-[1.15fr_0.85fr] md:items-end md:p-8">
          <div className="fade-up">
            <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[var(--mauve)]">{activeSlide.eyebrow}</p>
            <h2 className="mt-3 font-display text-4xl text-[var(--berry)] md:text-6xl">{activeSlide.title}</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--berry)]/85">{activeSlide.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={activeSlide.ctaHref} className="button-primary">
                {activeSlide.ctaLabel}
              </Link>
              <Link href="/download" className="button-secondary">
                Download the app
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white/78 p-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">Why this matters</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--berry)]">
              {activeSlide.spotlight.map((item) => (
                <li key={item}>{item}</li>
              ))}
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
