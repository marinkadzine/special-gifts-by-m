"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { GalleryItem } from "@/types/store";

export function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    async function loadGallery() {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        return;
      }

      const { data } = await supabase
        .from("gallery_items")
        .select("id, title, category, image_url, caption, featured, created_at")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);

      setItems((data as GalleryItem[] | null) ?? []);
    }

    loadGallery();
  }, []);

  return (
    <section id="gallery" className="shell">
      <div className="mb-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[var(--mauve)]">Gallery</p>
        <h2 className="font-display text-4xl text-[var(--berry)] md:text-5xl">
          Recent gifting and branding inspiration
        </h2>
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
            Gallery items will appear here as soon as the admin team adds them.
          </div>
        )}
      </div>
    </section>
  );
}
