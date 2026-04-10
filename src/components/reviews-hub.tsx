"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { Review } from "@/types/store";

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ReviewsHub() {
  const { profile, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        if (active) {
          setReviews([]);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("reviews")
        .select("id, customer_id, customer_name, rating, title, message, status, featured, created_at")
        .eq("status", "approved")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (!active) {
        return;
      }

      setReviews((data as Review[] | null) ?? []);
      setLoading(false);
    }

    void loadReviews();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setStatus("Please log in first so your review can be linked to your customer profile.");
      return;
    }

    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setStatus("Supabase is not connected yet, so reviews cannot be submitted.");
      return;
    }

    if (!message.trim()) {
      setStatus("Please add your review message before submitting.");
      return;
    }

    const customerName =
      profile?.full_name?.trim() ||
      String(user.user_metadata.full_name || user.email || "Special Gifts by M customer")
        .replace(/@.*/, "")
        .trim();

    setSubmitting(true);
    setStatus("Sending your review to the admin team for approval...");

    const { error } = await supabase.from("reviews").insert({
      customer_id: user.id,
      customer_name: customerName,
      rating,
      title: title.trim() || null,
      message: message.trim(),
      status: "pending",
      featured: false,
    } as never);

    if (error) {
      setSubmitting(false);
      setStatus(error.message || "Could not submit your review.");
      return;
    }

    setTitle("");
    setMessage("");
    setRating(5);
    setSubmitting(false);
    setStatus("Thank you. Your review has been sent for approval before it appears publicly.");
  }

  return (
    <div className="space-y-8">
      <section className="glass rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
              Customer reviews
            </p>
            <h2 className="mt-2 font-display text-4xl text-[var(--berry)] md:text-5xl">
              What customers are saying
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--mauve)]">
              Future customers can browse approved reviews here, and signed-in customers can leave a
              review for the admin team to approve.
            </p>
          </div>
          <span className="rounded-full bg-[var(--blush)] px-4 py-2 text-sm font-bold text-[var(--rose-deep)]">
            {loading ? "Loading..." : `${reviews.length} approved review${reviews.length === 1 ? "" : "s"}`}
          </span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass rounded-[2rem] p-6">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
            Leave a review
          </p>
          <h3 className="mt-2 font-display text-3xl text-[var(--berry)]">Share your experience</h3>
          {user ? (
            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm text-[var(--berry)]">
                Rating
                <select
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value}/5
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-[var(--berry)]">
                Short title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                  placeholder="Optional summary"
                />
              </label>
              <label className="block text-sm text-[var(--berry)]">
                Review
                <textarea
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="mt-2 min-h-32 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
                  placeholder="Tell future customers what the ordering experience was like."
                />
              </label>
              <button type="submit" disabled={submitting} className="button-primary">
                {submitting ? "Sending review..." : "Submit review"}
              </button>
              {status ? <p className="text-sm text-[var(--mauve)]">{status}</p> : null}
            </form>
          ) : (
            <div className="mt-5 rounded-[1.5rem] bg-white/80 p-5">
              <p className="text-sm leading-7 text-[var(--mauve)]">
                Please sign in first so your review can be linked to your account and sent to the admin
                team for approval.
              </p>
              <Link href="/account" className="button-primary mt-4 inline-flex">
                Sign up / log in
              </Link>
            </div>
          )}
        </div>

        <div className="glass rounded-[2rem] p-6">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
            Approved reviews
          </p>
          <div className="mt-5 space-y-4">
            {loading ? (
              <p className="text-sm text-[var(--mauve)]">Loading reviews...</p>
            ) : reviews.length ? (
              reviews.map((review) => (
                <article key={review.id} className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-bold text-[var(--berry)]">{review.customer_name}</p>
                      <p className="text-sm text-[var(--mauve)]">
                        Rating {review.rating}/5
                        {review.title ? ` | ${review.title}` : ""}
                      </p>
                    </div>
                    <p className="text-sm text-[var(--mauve)]">{formatReviewDate(review.created_at)}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--mauve)]">{review.message}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white/60 p-6 text-sm leading-7 text-[var(--mauve)]">
                Approved customer reviews will appear here once the admin team publishes them.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
