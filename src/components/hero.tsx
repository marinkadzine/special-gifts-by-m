import Link from "next/link";
import { InstallAppPrompt } from "@/components/install-app-prompt";
import { DOWNLOAD_PAGE_URL } from "@/lib/app-distribution";

export function Hero() {
  return (
    <section className="shell relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/58 px-6 py-10 shadow-[var(--shadow)] md:px-10 md:py-14">
      <div
        className="absolute inset-y-0 right-0 hidden w-[42%] bg-cover bg-center opacity-70 md:block"
        style={{ backgroundImage: "url('/branding/story-bg-3.png')" }}
      />
      <div className="relative z-10 max-w-2xl fade-up">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.34em] text-[var(--mauve)]">
          Special Gifts by M
        </p>
        <h1 className="font-display text-5xl leading-none text-[var(--berry)] md:text-7xl">
          Personalized gifts and designed items in one soft, elegant app.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--mauve)]">
          Browse featured items, save a wishlist, upload artwork for custom products, and place gift
          orders from the same web and mobile-ready shopping experience.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="#store-personalized" className="button-primary text-center">
            Shop Personalized
          </Link>
          <Link href="#store-designed" className="button-secondary text-center">
            Shop Designed
          </Link>
          <a href={DOWNLOAD_PAGE_URL} className="button-secondary text-center">
            Download App
          </a>
        </div>
        <InstallAppPrompt />
      </div>
    </section>
  );
}
