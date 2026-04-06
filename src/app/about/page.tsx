import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />
      <div className="shell py-8">
        <section className="glass rounded-[2rem] p-6 md:p-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">About Us</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--berry)] md:text-5xl">
            Personalized gifting with heart
          </h1>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-white/80 p-5">
              <p className="text-sm leading-8 text-[var(--mauve)]">
                Special Gifts by M focuses on custom gifts, apparel, drinkware, decor, and branded event
                items created with a soft, premium look and a customer-first ordering process.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/80 p-5">
              <p className="text-sm leading-8 text-[var(--mauve)]">
                Customers can request a callback, save wishlist items, upload artwork for personalized
                orders, and choose the delivery method that works best for them.
              </p>
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
