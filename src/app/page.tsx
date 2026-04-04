import { categories, featuredProducts, products } from "@/data/catalog";
import { CatalogueSection } from "@/components/catalogue-section";
import { CategoryPills } from "@/components/category-pills";
import { FeaturedProducts } from "@/components/featured-products";
import { Hero } from "@/components/hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <div className="space-y-16 pb-16 pt-8">
        <Hero />

        <section className="shell">
          <div className="glass rounded-[2rem] p-6 md:p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[var(--mauve)]">
              Store structure
            </p>
            <div className="mt-4 grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h2 className="font-display text-4xl text-[var(--berry)] md:text-5xl">
                  Personalized gifts, apparel, drinkware, and custom print items
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--mauve)]">
                  Special Gifts by M is now isolated as its own ecommerce storefront with category
                  browsing, product customization, cart, checkout, and Supabase-ready order capture.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/75 p-5">
                <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
                  Included now
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--berry)]">
                  <li>Catalogue and category structure from your pricing list</li>
                  <li>Product detail pages with customization controls</li>
                  <li>Cart and checkout flow with EFT and WhatsApp handoff</li>
                  <li>Supabase schema and launch documentation for this business only</li>
                  <li>Prepared path for web app, Android APK, and future iPhone packaging</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <FeaturedProducts products={featuredProducts} />

        <section id="catalogue" className="shell">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[var(--mauve)]">
                Catalogue
              </p>
              <h2 className="font-display text-4xl text-[var(--berry)] md:text-5xl">
                Organized around Special Gifts by M categories
              </h2>
            </div>
            <CategoryPills categories={categories} />
          </div>

          {categories.map((category) => (
            <CatalogueSection
              key={category}
              title={category}
              products={products.filter((product) => product.category === category)}
            />
          ))}
        </section>

        <section id="launch-guide" className="shell">
          <div className="glass rounded-[2rem] p-6 md:p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[var(--mauve)]">
              Launch path
            </p>
            <h2 className="mt-2 font-display text-4xl text-[var(--berry)] md:text-5xl">
              Supabase, GitHub, and Netlify for this store only
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] bg-white/75 p-5">
                <p className="font-display text-3xl text-[var(--berry)]">1. Supabase</p>
                <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">
                  Use the ecommerce-only SQL files and connect order capture to one clean project.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/75 p-5">
                <p className="font-display text-3xl text-[var(--berry)]">2. GitHub</p>
                <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">
                  Keep this Special Gifts codebase separate so it stays focused and easy to deploy.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/75 p-5">
                <p className="font-display text-3xl text-[var(--berry)]">3. Netlify</p>
                <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">
                  Deploy the storefront independently without mixing in other businesses or dashboards.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-[1.5rem] bg-[var(--blush)] p-5">
              <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--rose-deep)]">
                Client choice
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--berry)]">
                Special Gifts by M is now planned as a web app first, with a clean Android APK and
                iPhone packaging path from the same codebase so clients can choose how they want to use it.
              </p>
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
