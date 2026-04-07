import {
  BUSINESS_CONTACT,
  DEVELOPER_CREDIT,
  EFT_DETAILS,
  PAYFAST_ENABLED,
  PAYFAST_STATUS_NOTE,
  PICKUP_DETAILS,
  SOCIAL_LINKS,
} from "@/lib/business-details";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/40 bg-white/50">
      <div className="shell grid gap-8 py-10 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl text-[var(--berry)]">{BUSINESS_CONTACT.businessName}</p>
          <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">
            Personalized gifts, apparel, drinkware, stickers, and branded event items.
          </p>
          <p className="signature-accent mt-4 text-3xl text-[var(--rose-deep)]">Made with love for every order</p>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
            Contact
          </p>
          <p className="mt-3 text-sm text-[var(--berry)]">
            <a href={`https://wa.me/${BUSINESS_CONTACT.phoneLink}`} target="_blank" rel="noreferrer">
              WhatsApp / Call: {BUSINESS_CONTACT.phoneDisplay}
            </a>
          </p>
          <p className="text-sm text-[var(--berry)]">
            <a href={`mailto:${BUSINESS_CONTACT.email}`}>Email: {BUSINESS_CONTACT.email}</a>
          </p>
          <p className="mt-3 text-sm text-[var(--berry)]">
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
          </p>
          <p className="text-sm text-[var(--berry)]">
            <a href={SOCIAL_LINKS.whatsappChannel} target="_blank" rel="noreferrer">
              WhatsApp Channel
            </a>
          </p>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
            Payments
          </p>
          <p className="mt-3 text-sm text-[var(--berry)]">
            EFT: {EFT_DETAILS.bank} | {EFT_DETAILS.accountNumber}
          </p>
          <p className="text-sm text-[var(--berry)]">SWIFT/BIC: {EFT_DETAILS.swift}</p>
          <p className="text-sm text-[var(--berry)]">Branch code: {EFT_DETAILS.branchCode}</p>
          <p className="mt-3 text-sm text-[var(--berry)]">
            {PAYFAST_ENABLED ? "PayFast is available at checkout." : PAYFAST_STATUS_NOTE}
          </p>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
            Pickup & build
          </p>
          <p className="mt-3 text-sm text-[var(--berry)]">{PICKUP_DETAILS.label}</p>
          <p className="text-sm leading-7 text-[var(--mauve)]">{PICKUP_DETAILS.address}</p>
          <p className="mt-3 text-sm font-bold text-[var(--berry)]">
            App Development by {DEVELOPER_CREDIT.name}
          </p>
          <p className="text-sm text-[var(--berry)]">
            <a href={`https://wa.me/${DEVELOPER_CREDIT.phoneLink}`} target="_blank" rel="noreferrer">
              Contact: {DEVELOPER_CREDIT.phoneDisplay}
            </a>
          </p>
          <p className="text-sm text-[var(--berry)]">
            <a href={`mailto:${DEVELOPER_CREDIT.email}`}>Email: {DEVELOPER_CREDIT.email}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
