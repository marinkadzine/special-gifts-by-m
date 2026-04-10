"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AdminProductsManager } from "@/components/admin-products-manager";
import { useAuth } from "@/components/auth-provider";
import { formatCurrency } from "@/lib/pricing";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { CallbackRequest, GalleryItem, OrderRecord, Profile, Review } from "@/types/store";

const ORDER_STATUSES = [
  "pending",
  "pending_payment",
  "waiting_for_approval",
  "paid",
  "processing",
  "ready",
  "shipped",
  "completed",
  "cancelled",
  "failed",
] as const;
const CALLBACK_STATUSES = ["new", "contacted", "closed"] as const;
const REVIEW_STATUSES = ["pending", "approved", "hidden"] as const;

type GalleryFormState = {
  title: string;
  category: string;
  imageUrl: string;
  caption: string;
  featured: boolean;
};

const EMPTY_GALLERY_FORM: GalleryFormState = {
  title: "",
  category: "",
  imageUrl: "",
  caption: "",
  featured: false,
};

function createGalleryFormState(item?: GalleryItem): GalleryFormState {
  if (!item) {
    return EMPTY_GALLERY_FORM;
  }

  return {
    title: item.title,
    category: item.category ?? "",
    imageUrl: item.image_url,
    caption: item.caption ?? "",
    featured: item.featured,
  };
}

function sortGalleryItems(items: GalleryItem[]) {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
}

function formatOrderItemDelivery(orderItem: NonNullable<OrderRecord["items"]>[number]) {
  if (!orderItem.deliveryMethod) {
    return null;
  }

  const parts = [
    orderItem.deliveryGroup === "wrapped"
      ? "Wrapped items"
      : orderItem.deliveryGroup === "remaining"
        ? "Remaining items"
        : "Delivery",
    orderItem.deliveryMethod === "pudo" ? "PUDO" : "Pick Up",
    orderItem.deliveryPudoSize ? `Locker size ${orderItem.deliveryPudoSize}` : "",
    orderItem.deliveryLockerId ? `Locker ${orderItem.deliveryLockerId}` : "",
  ].filter(Boolean);

  return parts.join(" | ");
}

export function AdminDashboard() {
  const { isAdmin, loading, user } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [galleryFormState, setGalleryFormState] = useState<GalleryFormState>(EMPTY_GALLERY_FORM);
  const [editingGalleryId, setEditingGalleryId] = useState("");
  const [status, setStatus] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);
  const galleryFormSectionRef = useRef<HTMLElement | null>(null);

  const sortedGalleryItems = sortGalleryItems(galleryItems);

  useEffect(() => {
    async function loadDashboard() {
      const supabase = getBrowserSupabaseClient();

      if (!supabase || !isAdmin) {
        return;
      }

      setLoadingData(true);

      const [
        { data: ordersData },
        { data: callbackData },
        { data: profileData },
        { data: galleryData },
        { data: reviewsData },
      ] =
        await Promise.all([
          supabase
            .from("orders")
            .select(
              "id, order_number, customer_name, phone, email, delivery_method, delivery_fee, payment_method, locker_id, pudo_size, address, notes, subtotal, total, status, items, created_at",
            )
            .order("created_at", { ascending: false }),
          supabase
            .from("callback_requests")
            .select("id, full_name, phone, email, preferred_time, message, status, created_at")
            .order("created_at", { ascending: false }),
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase
            .from("gallery_items")
            .select("id, title, category, image_url, caption, featured, created_at")
            .order("featured", { ascending: false })
            .order("created_at", { ascending: false }),
          supabase
            .from("reviews")
            .select("id, customer_id, customer_name, rating, title, message, status, featured, created_at")
            .order("featured", { ascending: false })
            .order("created_at", { ascending: false }),
        ]);

      setOrders((ordersData as OrderRecord[] | null) ?? []);
      setCallbacks((callbackData as CallbackRequest[] | null) ?? []);
      setProfiles((profileData as Profile[] | null) ?? []);
      setGalleryItems((galleryData as GalleryItem[] | null) ?? []);
      setReviews((reviewsData as Review[] | null) ?? []);
      setLoadingData(false);
    }

    void loadDashboard();
  }, [isAdmin]);

  function focusGalleryEditor() {
    galleryFormSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function updateGalleryField<Key extends keyof GalleryFormState>(key: Key, value: GalleryFormState[Key]) {
    setGalleryFormState((current) => ({ ...current, [key]: value }));
  }

  function startNewGalleryItem() {
    setEditingGalleryId("");
    setGalleryFormState(EMPTY_GALLERY_FORM);
    setStatus("Ready to add a new gallery item.");
    focusGalleryEditor();
  }

  function editGalleryItem(item: GalleryItem) {
    setEditingGalleryId(item.id);
    setGalleryFormState(createGalleryFormState(item));
    setStatus(`Editing gallery item ${item.title}.`);
    focusGalleryEditor();
  }

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

  async function deleteOrder(orderId: string) {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setStatus("Supabase is not connected yet, so orders cannot be removed.");
      return;
    }

    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      setStatus(error.message);
      return;
    }

    setOrders((current) => current.filter((order) => order.id !== orderId));
    setStatus("Order removed.");
  }

  async function clearOrders() {
    if (!orders.length || !window.confirm("Remove all current orders from the dashboard?")) {
      return;
    }

    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setStatus("Supabase is not connected yet, so orders cannot be removed.");
      return;
    }

    const { error } = await supabase.from("orders").delete().neq("id", "");

    if (error) {
      setStatus(error.message);
      return;
    }

    setOrders([]);
    setStatus("All current orders removed.");
  }

  async function updateCallbackStatus(requestId: string, nextStatus: string) {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setStatus("Supabase is not connected yet, so callback updates cannot be saved.");
      return;
    }

    setStatus("Updating callback request...");

    const { data, error } = await supabase
      .from("callback_requests")
      .update({ status: nextStatus } as never)
      .eq("id", requestId)
      .select("id, full_name, phone, email, preferred_time, message, status, created_at")
      .maybeSingle();

    if (error) {
      setStatus(error.message);
      return;
    }

    if (!data) {
      setStatus("Callback status did not save. Please re-run the latest Supabase schema, then try again.");
      return;
    }

    setCallbacks((current) =>
      current.map((request) => (request.id === requestId ? ((data as CallbackRequest) ?? request) : request)),
    );
    setStatus("Callback request updated.");
  }

  async function deleteCallback(requestId: string) {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setStatus("Supabase is not connected yet, so callback requests cannot be removed.");
      return;
    }

    const { error } = await supabase.from("callback_requests").delete().eq("id", requestId);

    if (error) {
      setStatus(error.message);
      return;
    }

    setCallbacks((current) => current.filter((request) => request.id !== requestId));
    setStatus("Callback request removed.");
  }

  async function clearCallbacks() {
    if (!callbacks.length || !window.confirm("Remove all current callback requests from the dashboard?")) {
      return;
    }

    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setStatus("Supabase is not connected yet, so callback requests cannot be removed.");
      return;
    }

    const { error } = await supabase.from("callback_requests").delete().neq("id", "");

    if (error) {
      setStatus(error.message);
      return;
    }

    setCallbacks([]);
    setStatus("All current callback requests removed.");
  }

  async function handleGallerySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setStatus("Supabase is not connected yet, so gallery updates cannot be saved.");
      return;
    }

    const basePayload = {
      title: galleryFormState.title.trim(),
      category: galleryFormState.category.trim() || null,
      image_url: galleryFormState.imageUrl.trim(),
      caption: galleryFormState.caption.trim() || null,
      featured: galleryFormState.featured,
    };

    if (!basePayload.title || !basePayload.image_url) {
      setStatus("Please add a title and image URL for the gallery item.");
      return;
    }

    setSavingGallery(true);

    const request = editingGalleryId
      ? supabase
          .from("gallery_items")
          .update(basePayload as never)
          .eq("id", editingGalleryId)
          .select("id, title, category, image_url, caption, featured, created_at")
          .single()
      : supabase
          .from("gallery_items")
          .insert({
            ...basePayload,
            created_by: user?.id ?? null,
          } as never)
          .select("id, title, category, image_url, caption, featured, created_at")
          .single();

    const { data, error } = await request;

    if (error) {
      setSavingGallery(false);
      setStatus(error.message);
      return;
    }

    const savedItem = data as GalleryItem;

    setGalleryItems((current) =>
      editingGalleryId ? current.map((item) => (item.id === savedItem.id ? savedItem : item)) : [savedItem, ...current],
    );
    setEditingGalleryId(savedItem.id);
    setGalleryFormState(createGalleryFormState(savedItem));
    setSavingGallery(false);
    setStatus(editingGalleryId ? "Gallery item updated." : "Gallery item added.");
  }

  async function deleteGalleryItem(itemId: string) {
    if (!window.confirm("Delete this gallery item from the showcase?")) {
      return;
    }

    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setStatus("Supabase is not connected yet, so gallery items cannot be removed.");
      return;
    }

    const { error } = await supabase.from("gallery_items").delete().eq("id", itemId);

    if (error) {
      setStatus(error.message);
      return;
    }

    if (editingGalleryId === itemId) {
      setEditingGalleryId("");
      setGalleryFormState(EMPTY_GALLERY_FORM);
    }

    setGalleryItems((current) => current.filter((item) => item.id !== itemId));
    setStatus("Gallery item removed.");
  }

  async function updateReview(reviewId: string, patch: Partial<Review>, successMessage: string) {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setStatus("Supabase is not connected yet, so review changes cannot be saved.");
      return;
    }

    const { data, error } = await supabase
      .from("reviews")
      .update(patch as never)
      .eq("id", reviewId)
      .select("id, customer_id, customer_name, rating, title, message, status, featured, created_at")
      .single();

    if (error) {
      setStatus(error.message);
      return;
    }

    setReviews((current) => current.map((review) => (review.id === reviewId ? (data as Review) : review)));
    setStatus(successMessage);
  }

  async function deleteReview(reviewId: string) {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setStatus("Supabase is not connected yet, so reviews cannot be removed.");
      return;
    }

    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

    if (error) {
      setStatus(error.message);
      return;
    }

    setReviews((current) => current.filter((review) => review.id !== reviewId));
    setStatus("Review removed.");
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
        <h2 className="mt-2 font-display text-4xl text-[var(--berry)] md:text-5xl">Admin dashboard</h2>
        {status ? <p className="mt-4 text-sm text-[var(--mauve)]">{status}</p> : null}
      </div>

      <AdminProductsManager />

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section id="gallery-editor" ref={galleryFormSectionRef} className="glass rounded-[2rem] p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">Gallery management</p>
              <h3 className="mt-2 font-display text-3xl text-[var(--berry)]">
                {editingGalleryId ? "Edit gallery item" : "Add a gallery item"}
              </h3>
            </div>
            <button type="button" className="button-secondary" onClick={startNewGalleryItem}>
              Add new gallery item
            </button>
          </div>

          {editingGalleryId ? (
            <div className="mt-4 rounded-[1.2rem] border border-[var(--line)] bg-white/75 px-4 py-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--mauve)]">Now editing</p>
              <p className="mt-2 font-bold text-[var(--berry)]">{galleryFormState.title}</p>
            </div>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={handleGallerySubmit}>
            <label className="text-sm text-[var(--berry)]">
              Title
              <input
                required
                value={galleryFormState.title}
                onChange={(event) => updateGalleryField("title", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <label className="text-sm text-[var(--berry)]">
              Category
              <input
                value={galleryFormState.category}
                onChange={(event) => updateGalleryField("category", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <label className="text-sm text-[var(--berry)]">
              Image URL
              <input
                required
                value={galleryFormState.imageUrl}
                onChange={(event) => updateGalleryField("imageUrl", event.target.value)}
                placeholder="/store-products/your-image.png or https://..."
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <label className="text-sm text-[var(--berry)]">
              Caption
              <textarea
                value={galleryFormState.caption}
                onChange={(event) => updateGalleryField("caption", event.target.value)}
                className="mt-2 min-h-24 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <label className="flex items-center gap-3 text-sm font-bold text-[var(--berry)]">
              <input
                type="checkbox"
                checked={galleryFormState.featured}
                onChange={(event) => updateGalleryField("featured", event.target.checked)}
              />
              Feature this gallery item
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="button-primary" disabled={savingGallery}>
                {savingGallery ? "Saving gallery item..." : editingGalleryId ? "Save gallery changes" : "Add gallery item"}
              </button>
              <button type="button" className="button-secondary" onClick={startNewGalleryItem}>
                Clear form
              </button>
            </div>
          </form>
        </section>

        <section className="glass rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">Current gallery items</p>
              <h3 className="mt-2 font-display text-3xl text-[var(--berry)]">Showcased previous work</h3>
            </div>
            <span className="rounded-full bg-[var(--blush)] px-4 py-2 text-sm font-bold text-[var(--rose-deep)]">
              {galleryItems.length} items
            </span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {sortedGalleryItems.length ? (
              sortedGalleryItems.map((item) => (
                <article
                  key={item.id}
                  className={`overflow-hidden rounded-[1.5rem] border bg-white/80 ${
                    editingGalleryId === item.id ? "border-[var(--rose)] shadow-sm" : "border-[var(--line)]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url} alt={item.title} className="h-44 w-full object-cover" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-[var(--berry)]">{item.title}</p>
                        {item.category ? <p className="text-sm text-[var(--mauve)]">{item.category}</p> : null}
                      </div>
                      {item.featured ? (
                        <span className="rounded-full bg-[var(--blush)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--rose-deep)]">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    {item.caption ? <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">{item.caption}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="button-secondary px-4 py-2 text-sm"
                        onClick={() => editGalleryItem(item)}
                      >
                        Edit item
                      </button>
                      <button
                        type="button"
                        className="button-secondary px-4 py-2 text-sm"
                        onClick={() => deleteGalleryItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-[var(--mauve)]">No gallery items added yet.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="glass rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-3xl text-[var(--berry)]">Orders</h3>
            {orders.length ? (
              <button type="button" className="button-secondary px-4 py-2 text-sm" onClick={clearOrders}>
                Clear all
              </button>
            ) : null}
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
                      {order.delivery_method.replaceAll("_", " ")}
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
                    <button
                      type="button"
                      className="button-secondary mt-2 w-full px-4 py-2 text-sm"
                      onClick={() => deleteOrder(order.id)}
                    >
                      Delete order
                    </button>
                  </div>
                </div>
                {order.notes ? (
                  <div className="mt-3 rounded-[1rem] bg-[var(--light-grey)] px-4 py-3 text-sm leading-7 text-[var(--berry)]">
                    {order.notes.split("\n").map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                ) : null}
                {order.items?.length ? (
                  <div className="mt-4 rounded-[1rem] bg-[var(--light-grey)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[var(--mauve)]">
                        Artwork & print instructions
                      </p>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--rose-deep)]">
                        {order.items.length} item{order.items.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {order.items.map((item) => (
                        <div key={item.cartId} className="rounded-[1rem] bg-white px-4 py-4">
                          <p className="font-bold text-[var(--berry)]">
                            {item.quantity} x {item.name}
                          </p>
                          <p className="mt-1 text-sm text-[var(--mauve)]">
                            {[item.size, item.color, item.variant, item.printSize].filter(Boolean).join(" | ") ||
                              "Standard configuration"}
                          </p>
                          {item.customizationNotes ? (
                            <div className="mt-3 rounded-[1rem] bg-[var(--light-grey)] px-3 py-3">
                              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--mauve)]">
                                Client instructions
                              </p>
                              <p className="mt-2 text-sm leading-7 text-[var(--berry)]">{item.customizationNotes}</p>
                            </div>
                          ) : null}
                          {item.giftWrap ? (
                            <p className="mt-3 text-sm font-bold text-[var(--berry)]">
                              Gift wrapping has been selected for this item.
                            </p>
                          ) : null}
                          {item.wrappingInstructions ? (
                            <p className="mt-2 text-sm text-[var(--mauve)]">
                              Wrapping instructions: {item.wrappingInstructions}
                            </p>
                          ) : null}
                          {formatOrderItemDelivery(item) ? (
                            <p className="mt-2 text-sm text-[var(--mauve)]">
                              Delivery: {formatOrderItemDelivery(item)}
                            </p>
                          ) : null}
                          {item.referenceFiles?.length ? (
                            <div className="mt-3 text-sm text-[var(--mauve)]">
                              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--mauve)]">
                                Uploaded references
                              </p>
                              <div className="mt-3 flex flex-wrap gap-3">
                                {item.referenceFiles.map((file) => (
                                  <div
                                    key={file.id}
                                    className="overflow-hidden rounded-[1rem] border border-[var(--line)] bg-white shadow-sm"
                                  >
                                    {file.type.startsWith("image/") && file.url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={file.url} alt={file.name} className="h-28 w-28 object-cover" />
                                    ) : null}
                                    <a
                                      href={file.url || "#"}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block max-w-28 px-3 py-2 text-sm font-bold text-[var(--rose-deep)]"
                                    >
                                      {file.name}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-[var(--mauve)]">No reference files were uploaded for this item.</p>
                          )}
                          {item.storeSection === "personalized" &&
                          !item.customizationNotes &&
                          !item.referenceFiles?.length ? (
                            <p className="mt-3 text-sm font-bold text-[var(--rose-deep)]">
                              This order line was saved without any uploaded artwork or reference file.
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="glass rounded-[2rem] p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-3xl text-[var(--berry)]">Call back requests</h3>
              {callbacks.length ? (
                <button type="button" className="button-secondary px-4 py-2 text-sm" onClick={clearCallbacks}>
                  Clear all
                </button>
              ) : null}
            </div>
            <div className="mt-5 space-y-3">
              {callbacks.length ? (
                callbacks.map((request) => (
                  <div key={request.id} className="rounded-[1.2rem] border border-[var(--line)] bg-white/80 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-[var(--berry)]">{request.full_name}</p>
                        <p className="text-sm text-[var(--mauve)]">{request.phone}</p>
                      </div>
                      <span className="rounded-full bg-[var(--blush)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--rose-deep)]">
                        {request.status}
                      </span>
                    </div>
                    {request.preferred_time ? (
                      <p className="text-sm text-[var(--mauve)]">Preferred time: {request.preferred_time}</p>
                    ) : null}
                    {request.message ? <p className="mt-2 text-sm text-[var(--mauve)]">{request.message}</p> : null}
                    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
                      <select
                        value={request.status}
                        onChange={(event) => updateCallbackStatus(request.id, event.target.value)}
                        className="rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--berry)]"
                      >
                        {CALLBACK_STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                      {request.status !== "contacted" ? (
                        <button
                          type="button"
                          className="button-secondary px-4 py-2 text-sm"
                          onClick={() => updateCallbackStatus(request.id, "contacted")}
                        >
                          Mark as contacted
                        </button>
                      ) : (
                        <p className="text-sm font-bold text-[var(--mauve)]">Already marked as contacted.</p>
                      )}
                      <button
                        type="button"
                        className="button-secondary px-4 py-2 text-sm"
                        onClick={() => deleteCallback(request.id)}
                      >
                        Delete
                      </button>
                    </div>
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

          <section className="glass rounded-[2rem] p-6">
            <h3 className="font-display text-3xl text-[var(--berry)]">Customer reviews</h3>
            <div className="mt-5 space-y-3">
              {reviews.length ? (
                reviews.map((review) => (
                  <article key={review.id} className="rounded-[1.2rem] border border-[var(--line)] bg-white/80 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-[var(--berry)]">{review.customer_name}</p>
                        <p className="text-sm text-[var(--mauve)]">
                          Rating {review.rating}/5
                          {review.title ? ` | ${review.title}` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--blush)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--rose-deep)]">
                        {review.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--mauve)]">{review.message}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <select
                        value={review.status}
                        onChange={(event) =>
                          updateReview(review.id, { status: event.target.value as Review["status"] }, "Review updated.")
                        }
                        className="rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--berry)]"
                      >
                        {REVIEW_STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--berry)]">
                        <input
                          type="checkbox"
                          checked={review.featured}
                          onChange={(event) =>
                            updateReview(review.id, { featured: event.target.checked }, "Review updated.")
                          }
                        />
                        Featured
                      </label>
                      <button
                        type="button"
                        className="button-secondary px-4 py-2 text-sm"
                        onClick={() => deleteReview(review.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-[var(--mauve)]">No customer reviews submitted yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
