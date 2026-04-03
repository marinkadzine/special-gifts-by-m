export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/40 bg-white/50">
      <div className="shell grid gap-8 py-10 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl text-[var(--berry)]">Special Gifts by M</p>
          <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">
            Personalized gifts, apparel, drinkware, stickers, and branded event items.
          </p>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
            Contact
          </p>
          <p className="mt-3 text-sm text-[var(--berry)]">WhatsApp / Call: +27 82 464 3498</p>
          <p className="text-sm text-[var(--berry)]">Email: specialgiftsbym@gmail.com</p>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
            Payments
          </p>
          <p className="mt-3 text-sm text-[var(--berry)]">EFT accepted today</p>
          <p className="text-sm text-[var(--berry)]">PayFast can be added once merchant details are ready</p>
        </div>
      </div>
    </footer>
  );
}
