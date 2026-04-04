"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { CallbackRequest, GalleryItem, OrderRecord, Profile } from "@/types/store";
import { formatCurrency } from "@/lib/pricing";

const ORDER_STATUSES = ["pending", "paid", "processing", "ready", "shipped", "completed"] as const;

export function AdminDashboard() {
  const { isAdmin, loading, user } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [status, setStatus] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      const supabase = getBrowserSupabaseClient();

      if (!supabase || !isAdmin) {
        return;
      }

      setLoadingData(true);

      const [{ data: ordersData }, { data: callbackData }, { data: profileData }, { data: galleryData }] =
        await Promise.all([
          supabase
            .from("orders")
            .select("id, order_number, customer_name, phone, email, delivery_method, delivery_fee, payment_method, locker_id, pudo_size, address, notes, subtotal, total, status, items, created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("callback_requests")
            .select("id, full_name, phone, email, preferred_time, message, status, created_at")
            .order("created_at", { ascending: false }),
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase
            .from("gallery_items")
            .select("id, title, category, image_url, caption, featured, created_at")
            .order("created_at", { ascending: false }),
        ]);

      setOrders((ordersData as OrderRecord[] | null) ?? []);
      setCallbacks((callbackData as CallbackRequest[] | null) ?? []);
      setProfiles((profileData as Profile[] | null) ?? []);
      setGalleryItems((galleryData as GalleryItem[] | null) ?? []);
      setLoadingData(false);
    }

    loadDashboard();
  }, [isAdmin]);

  async function updateOrderStatus(orderId: string, nextStatus: string) {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      return;
    }

    const { error } = await supabase.from("orders").update({ status: nextStatus } as never).eq("id", orderId);

    if (error) {
      setStatus(error.message);
      return;
    }

    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)));
    setStatus("Order status updated.");
  }

  async function updateCallbackStatus(requestId: string, nextStatus: string) {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      return;
    }

    const { error } = await supabase
      .from("callback_requests")
      .update({ status: nextStatus } as never)
      .eq("id", requestId);

    if (error) {
      setStatus(error.message);
      return;
    }

    setCallbacks((current) =>
      current.map((request) => (request.id === requestId ? { ...request, status: nextStatus } : request)),
    );
    setStatus("Callback request updated.");
  }

  async function handleGallerySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setStatus("Supabase is not connected yet, so gallery updates cannot be saved.");
      return;
    }

    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title") || ""),
      category: String(formData.get("category") || ""),
      image_url: String(formData.get("imageUrl") || ""),
      caption: String(formData.get("caption") || ""),
      featured: formData.get("featured") === "on",
    };

    const { error, data } = await supabase
      .from("gallery_items")
      .insert({
        title: payload.title,
        category: payload.category || null,
        image_url: payload.image_url,
        caption: payload.caption || null,
        featured: payload.featured,
        created_by: user?.id ?? null,
      } as never)
      .select("id, title, category, image_url, caption, featured, created_at")
      .single();

    if (error) {
      setStatus(error.message);
      return;
    }

    setGalleryItems((current) => [data as GalleryItem, ...current]);
    form.reset();
    setStatus("Gallery item added.");
  }

  if (loading || loadingData) {
    return (
      <section className="glass rounded-[2rem] p-6 md:p-8">
        <p className="text-sm text-[var(--mauve)]">Loading admin workspace...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="glass rounded-[2rem] p-6 md:p-8">
        <p className="text-sm text-[var(--mauve)]">
          Please sign in through the account page first. Admin access is only available to the approved business users.
        </p>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="glass rounded-[2rem] p-6 md:p-8">
        <p className="text-sm text-[var(--mauve)]">
          Your account is not on the approved admin list for Special Gifts by M.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="glass rounded-[2rem] p-6 md:p-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">Admin workspace</p>
        <h2 className="mt-2 font-display text-4xl text-[var(--berry)] md:text-5xl">
          Orders, callbacks, accounts, and gallery updates
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--mauve)]">
          This dashboard is restricted to the approved admin email list from the business brief.
        </p>
        {status ? <p className="mt-4 text-sm text-[var(--mauve)]">{status}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="glass rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-3xl text-[var(--berry)]">Orders</h3>
            <span className="rounded-full bg-[var(--blush)] px-4 py-2 text-sm font-bold text-[var(--rose-deep)]">
              {orders.length} total
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-bold text-[var(--berry)]">{order.order_number}</p>
                    <p className="text-sm text-[var(--mauve)]">
                      {order.customer_name} | {order.phone} | {order.payment_method.replaceAll("_", " ")}
                    </p>
                    <p className="text-sm text-[var(--mauve)]">
                      {order.delivery_method}
                      {order.pudo_size ? ` | PUDO ${order.pudo_size}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--berry)]">{formatCurrency(Number(order.total))}</p>
                    <select
                      value={order.status}
                      onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                      className="mt-2 rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--berry)]"
                    >
                      {ORDER_STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {order.notes ? <p className="mt-3 text-sm text-[var(--mauve)]">Notes: {order.notes}</p> : null}
                {order.items?.length ? (
                  <div className="mt-4 space-y-3 rounded-[1rem] bg-[var(--light-grey)] p-3">
                    {order.items.map((item) => (
                      <div key={item.cartId} className="rounded-[1rem] bg-white px-3 py-3">
                        <p className="font-bold text-[var(--berry)]">
                          {item.quantity} x {item.name}
                        </p>
                        {item.customizationNotes ? (
                          <p className="mt-1 text-sm text-[var(--mauve)]">
                            Print instructions: {item.customizationNotes}
                          </p>
                        ) : null}
                        {item.referenceFiles?.length ? (
                          <div className="mt-2 text-sm text-[var(--mauve)]">
                            <p>Uploaded references:</p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {item.referenceFiles.map((file) => (
                                <div key={file.id} className="overflow-hidden rounded-[1rem] border border-[var(--line)] bg-white">
                                  {file.type.startsWith("image/") && file.url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={file.url} alt={file.name} className="h-28 w-28 object-cover" />
                                  ) : null}
                                  <a
                                    href={file.url || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block px-3 py-2 font-bold text-[var(--rose-deep)]"
                                  >
                                    {file.name}
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="glass rounded-[2rem] p-6">
            <h3 className="font-display text-3xl text-[var(--berry)]">Call back requests</h3>
            <div className="mt-5 space-y-3">
              {callbacks.length ? (
                callbacks.map((request) => (
                  <div key={request.id} className="rounded-[1.2rem] border border-[var(--line)] bg-white/80 p-4">
                    <p className="font-bold text-[var(--berry)]">{request.full_name}</p>
                    <p className="text-sm text-[var(--mauve)]">{request.phone}</p>
                    {request.preferred_time ? (
                      <p className="text-sm text-[var(--mauve)]">Preferred time: {request.preferred_time}</p>
                    ) : null}
                    {request.message ? <p className="mt-2 text-sm text-[var(--mauve)]">{request.message}</p> : null}
                    <button
                      type="button"
                      className="button-secondary mt-3 px-4 py-2 text-sm"
                      onClick={() => updateCallbackStatus(request.id, "contacted")}
                    >
                      Mark as contacted
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--mauve)]">No callback requests yet.</p>
              )}
            </div>
          </section>

          <section className="glass rounded-[2rem] p-6">
            <h3 className="font-display text-3xl text-[var(--berry)]">Admin-approved users</h3>
            <div className="mt-5 space-y-3">
              {profiles.map((profile) => (
                <div key={profile.id} className="rounded-[1.2rem] border border-[var(--line)] bg-white/80 p-4">
                  <p className="font-bold text-[var(--berry)]">{profile.full_name || profile.email}</p>
                  <p className="text-sm text-[var(--mauve)]">
                    {profile.email} | {profile.role}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="glass rounded-[2rem] p-6">
          <h3 className="font-display text-3xl text-[var(--berry)]">Add a gallery item</h3>
          <form className="mt-5 space-y-4" onSubmit={handleGallerySubmit}>
            <label className="text-sm text-[var(--berry)]">
              Title
              <input required name="title" className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3" />
            </label>
            <label className="text-sm text-[var(--berry)]">
              Category
              <input name="category" className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3" />
            </label>
            <label className="text-sm text-[var(--berry)]">
              Image URL
              <input
                required
                name="imageUrl"
                placeholder="/store-products/your-image.png or https://..."
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <label className="text-sm text-[var(--berry)]">
              Caption
              <textarea
                name="caption"
                className="mt-2 min-h-24 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <label className="flex items-center gap-3 text-sm font-bold text-[var(--berry)]">
              <input type="checkbox" name="featured" />
              Feature this gallery item
            </label>
            <button type="submit" className="button-primary">
              Add gallery item
            </button>
          </form>
        </section>

        <section className="glass rounded-[2rem] p-6">
          <h3 className="font-display text-3xl text-[var(--berry)]">Current gallery items</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {galleryItems.length ? (
              galleryItems.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white/80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url} alt={item.title} className="h-44 w-full object-cover" />
                  <div className="p-4">
                    <p className="font-bold text-[var(--berry)]">{item.title}</p>
                    {item.category ? <p className="text-sm text-[var(--mauve)]">{item.category}</p> : null}
                    {item.caption ? <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">{item.caption}</p> : null}
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-[var(--mauve)]">No gallery items added yet.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
