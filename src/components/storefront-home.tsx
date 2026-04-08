"use client";

import { CallbackRequestForm } from "@/components/callback-request-form";
import { CatalogueSection } from "@/components/catalogue-section";
import { CategoryPills } from "@/components/category-pills";
import { FeaturedProducts } from "@/components/featured-products";
import { GallerySection } from "@/components/gallery-section";
import { Hero } from "@/components/hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SpecialsSlider } from "@/components/specials-slider";
import { useStoreProducts } from "@/hooks/use-store-products";
import { DEVELOPER_CREDIT } from "@/lib/business-details";

export function StorefrontHome() {
  const { categories, error, featuredProducts, personalizedProducts, readyMadeProducts } = useStoreProducts();
  const personalizedCategories = categories.filter((category) =>
    personalizedProducts.some((product) => product.category === category),
  );
  const readyMadeCategories = categories.filter((category) =>
    readyMadeProducts.some((product) => product.category === category),
  );

  return (
    <main>
      <SiteHeader />
      <div className="space-y-16 pb-16 pt-8">
        <Hero />
        <SpecialsSlider />

        <section className="shell">
          <div className="glass rounded-[2rem] p-6 md:p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[var(--mauve)]">Store</p>
            <div className="mt-4 grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h2 className="font-display text-4xl text-[var(--berry)] md:text-5xl">
                  Personalized gifts and ready-made picks in one beautiful shopping flow
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--mauve)]">
                  Shop custom apparel, drinkware, decor, and branded items, then switch to ready-made
                  gift picks whenever you want something faster and easier to choose.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/75 p-5">
                <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
                  Customer features
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--berry)]">
                  <li>Sign up, log in, and track orders from a customer profile.</li>
                  <li>Upload artwork and choose delivery before payment.</li>
                  <li>Save products to a wishlist for later.</li>
                  <li>Request a call back when you need help.</li>
                  <li>Use the same store as a web app or Android app.</li>
                </ul>
              </div>
            </div>
            {error ? (
              <p className="mt-4 text-sm text-[var(--mauve)]">
                Live store updates are temporarily unavailable, so the launch catalog is being shown.
              </p>
            ) : null}
          </div>
        </section>

        <FeaturedProducts products={featuredProducts} />

        <section id="store-personalized" className="shell">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[var(--mauve)]">
                Personalized Items
              </p>
              <h2 className="font-display text-4xl text-[var(--berry)] md:text-5xl">
                Create custom gifts with your artwork and instructions
              </h2>
            </div>
            <CategoryPills categories={personalizedCategories} />
          </div>

          {personalizedCategories.map((category) => (
            <CatalogueSection
              key={category}
              title={category}
              products={personalizedProducts.filter((product) => product.category === category)}
            />
          ))}
        </section>

        <section id="store-ready-made" className="shell">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[var(--mauve)]">
                Ready-Made Items
              </p>
              <h2 className="font-display text-4xl text-[var(--berry)] md:text-5xl">
                Gift-ready picks for customers who want a faster choice
              </h2>
            </div>
            <CategoryPills categories={readyMadeCategories} />
          </div>

          {readyMadeCategories.map((category) => (
            <CatalogueSection
              key={category}
              title={category}
              products={readyMadeProducts.filter((product) => product.category === category)}
            />
          ))}
        </section>

        <GallerySection showViewAllLink />

        <section className="shell">
          <CallbackRequestForm />
        </section>

        <section className="shell">
          <div className="rounded-[2rem] border border-white/40 bg-white/58 px-6 py-5 text-center shadow-[var(--shadow)]">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
              App development credit
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--berry)]">
              App Development by {DEVELOPER_CREDIT.name}
            </p>
            <p className="text-sm leading-7 text-[var(--mauve)]">
              Contact: {DEVELOPER_CREDIT.phoneDisplay} | Email: {DEVELOPER_CREDIT.email}
            </p>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
