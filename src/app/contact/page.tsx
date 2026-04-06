import { CallbackRequestForm } from "@/components/callback-request-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BUSINESS_CONTACT, SOCIAL_LINKS } from "@/lib/business-details";

export default function ContactPage() {
  return (
    <main>
      <SiteHeader />
      <div className="shell space-y-8 py-8">
        <section className="glass rounded-[2rem] p-6 md:p-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
            Contact Us / Stay In Touch
          </p>
          <h1 className="mt-2 font-display text-4xl text-[var(--berry)] md:text-5xl">
            Reach Special Gifts by M your way
          </h1>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-white/80 p-5">
              <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-[var(--mauve)]">
                Contact methods
              </p>
              <div className="mt-4 space-y-3 text-sm text-[var(--berry)]">
                <p>
                  <a href={`https://wa.me/${BUSINESS_CONTACT.phoneLink}`} target="_blank" rel="noreferrer">
                    WhatsApp / Call: {BUSINESS_CONTACT.phoneDisplay}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${BUSINESS_CONTACT.email}`}>Email: {BUSINESS_CONTACT.email}</a>
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-white/80 p-5">
              <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-[var(--mauve)]">
                Social media
              </p>
              <div className="mt-4 space-y-3 text-sm text-[var(--berry)]">
                <p>
                  <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                </p>
                <p>
                  <a href={SOCIAL_LINKS.whatsappChannel} target="_blank" rel="noreferrer">
                    WhatsApp Channel
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <CallbackRequestForm />
      </div>
      <SiteFooter />
    </main>
  );
}
