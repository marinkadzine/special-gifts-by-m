"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useHomePageBanners } from "@/hooks/use-home-page-banners";

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function SeasonalBanner() {
  const { banners } = useHomePageBanners();
  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = activeIndex < banners.length ? activeIndex : 0;
  const activeBanner = banners[safeActiveIndex] ?? banners[0];

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (!activeBanner) {
    return null;
  }

  const ctaHref = activeBanner.cta_href?.trim() || "/shop?slug=mothers-day-personalized-bundle";
  const ctaLabel = activeBanner.cta_label?.trim() || "Customize this bundle";

  return (
    <section className="shell">
      <div className="glass overflow-hidden rounded-[2rem]">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeBanner.image_url}
            alt={activeBanner.title}
            className="h-auto max-h-[620px] w-full object-cover object-center"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 md:p-6">
            <span className="rounded-full bg-white/88 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--rose-deep)] backdrop-blur">
              Home page special
            </span>
            {banners.length > 1 ? (
              <span className="rounded-full bg-[rgba(98,54,77,0.82)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.22em] text-white">
                {safeActiveIndex + 1} / {banners.length}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-5 px-5 py-5 md:flex-row md:items-end md:justify-between md:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
              Seasonal special
            </p>
            <h2 className="mt-2 font-display text-3xl text-[var(--berry)] md:text-4xl">
              {activeBanner.title}
            </h2>
            {activeBanner.caption ? (
              <p className="mt-2 text-sm leading-7 text-[var(--mauve)] md:text-base">
                {activeBanner.caption}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            {isExternalHref(ctaHref) ? (
              <a href={ctaHref} target="_blank" rel="noreferrer" className="button-primary text-center">
                {ctaLabel}
              </a>
            ) : (
              <Link href={ctaHref} className="button-primary text-center">
                {ctaLabel}
              </Link>
            )}
            <Link href="/#featured" className="button-secondary text-center">
              View featured items
            </Link>
          </div>
        </div>
        {banners.length > 1 ? (
          <div className="flex flex-wrap gap-3 px-5 pb-5 md:px-8">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] transition ${
                  index === safeActiveIndex
                    ? "bg-[var(--rose-deep)] text-white"
                    : "border border-[var(--line)] bg-white/80 text-[var(--berry)]"
                }`}
              >
                {banner.title}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
