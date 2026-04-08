"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { GalleryItem } from "@/types/store";

type GallerySectionProps = {
  limit?: number;
  sectionId?: string;
  eyebrow?: string;
  heading?: string;
  description?: string;
  emptyMessage?: string;
  showViewAllLink?: boolean;
};

export function GallerySection({
  limit = 6,
  sectionId = "gallery",
  eyebrow = "Gallery",
  heading = "Recent gifting and branding inspiration",
  description,
  emptyMessage = "Gallery items will appear here as soon as the admin team adds them.",
  showViewAllLink = false,
}: GallerySectionProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    async function loadGallery() {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        return;
      }

      let query = supabase
        .from("gallery_items")
        .select("id, title, category, image_url, caption, featured, created_at")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (typeof limit === "number") {
        query = query.limit(limit);
      }

      const { data } = await query;

      setItems((data as GalleryItem[] | null) ?? []);
    }

    loadGallery();
  }, [limit]);

  return (
    <section id={sectionId} className="shell">
      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[var(--mauve)]">{eyebrow}</p>
            <h2 className="font-display text-4xl text-[var(--berry)] md:text-5xl">{heading}</h2>
            {description ? <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--mauve)]">{description}</p> : null}
          </div>
          {showViewAllLink ? (
            <Link href="/gallery" className="button-secondary w-fit px-5 py-3 text-sm">
              View full gallery
            </Link>
          ) : null}
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className="glass overflow-hidden rounded-[2rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image_url} alt={item.title} className="h-64 w-full object-cover" />
              <div className="p-5">
                <p className="font-display text-3xl text-[var(--berry)]">{item.title}</p>
                {item.category ? <p className="mt-2 text-sm uppercase tracking-[0.2em] text-[var(--mauve)]">{item.category}</p> : null}
                {item.caption ? <p className="mt-3 text-sm leading-7 text-[var(--mauve)]">{item.caption}</p> : null}
              </div>
            </article>
          ))
        ) : (
          <div className="glass rounded-[2rem] p-6 text-sm leading-7 text-[var(--mauve)]">
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  );
}
