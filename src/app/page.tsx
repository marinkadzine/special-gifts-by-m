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
                  Ready for launch in phases
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--mauve)]">
                  This project gives you a modern storefront, product customization, cart, checkout,
                  Supabase order capture, and a clean path to GitHub + Netlify deployment using free
                  tools.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/75 p-5">
                <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
                  Included now
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--berry)]">
                  <li>Catalogue and category structure from your PDF</li>
                  <li>Product detail pages with customization controls</li>
                  <li>Cart and checkout flow with EFT / WhatsApp fallback</li>
                  <li>Supabase schema and launch documentation</li>
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
                Organized by the real business categories
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
              Free-tool rollout with Supabase, GitHub, and Netlify
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] bg-white/75 p-5">
                <p className="font-display text-3xl text-[var(--berry)]">1. Supabase</p>
                <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">
                  Create the project, run the SQL schema in the SQL editor, and add the environment
                  keys to your local `.env.local`.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/75 p-5">
                <p className="font-display text-3xl text-[var(--berry)]">2. GitHub</p>
                <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">
                  Push this repo to GitHub from Git Bash so your code has version history and is easy
                  to deploy.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/75 p-5">
                <p className="font-display text-3xl text-[var(--berry)]">3. Netlify</p>
                <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">
                  Connect the GitHub repo, set the same env vars, and deploy your storefront with one
                  click.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
