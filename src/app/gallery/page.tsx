import { GallerySection } from "@/components/gallery-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function GalleryPage() {
  return (
    <main>
      <SiteHeader />
      <div className="space-y-10 py-8">
        <section className="shell">
          <div className="glass rounded-[2rem] p-6 md:p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
              Previous work
            </p>
            <h1 className="mt-2 font-display text-4xl text-[var(--berry)] md:text-5xl">
              Showcasing finished gifting, branding, and print work
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--mauve)]">
              Browse real work completed for customers, events, gifting moments, and branded product orders.
            </p>
          </div>
        </section>

        <GallerySection
          limit={undefined}
          sectionId="gallery-archive"
          eyebrow="Gallery archive"
          heading="A fuller look at recent Special Gifts by M work"
          emptyMessage="Previous work will appear here as soon as new gallery items are added by the admin team."
        />
      </div>
      <SiteFooter />
    </main>
  );
}
