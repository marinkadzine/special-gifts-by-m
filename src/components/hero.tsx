import Link from "next/link";

export function Hero() {
  return (
    <section className="shell relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/58 px-6 py-10 shadow-[var(--shadow)] md:px-10 md:py-14">
      <div
        className="absolute inset-y-0 right-0 hidden w-[42%] bg-cover bg-center opacity-70 md:block"
        style={{ backgroundImage: "url('/branding/story-bg-3.png')" }}
      />
      <div className="relative z-10 max-w-2xl fade-up">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.34em] text-[var(--mauve)]">
          Full Ecommerce Foundation
        </p>
        <h1 className="font-display text-5xl leading-none text-[var(--berry)] md:text-7xl">
          Custom gifting, checkout, and order capture in one beautiful store.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--mauve)]">
          This storefront is built to launch as a web app first, while staying ready for Android APK
          and iPhone app packaging when clients prefer an installed mobile experience.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="#catalogue" className="button-primary text-center">
            Browse Catalogue
          </Link>
          <Link href="#launch-guide" className="button-secondary text-center">
            Setup Supabase + Netlify
          </Link>
        </div>
      </div>
    </section>
  );
}
