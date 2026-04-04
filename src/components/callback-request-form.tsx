"use client";

import { FormEvent, useState } from "react";
import { BUSINESS_CONTACT } from "@/lib/business-details";
import { getBrowserSupabaseClient } from "@/lib/supabase";

export function CallbackRequestForm() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      full_name: String(formData.get("fullName") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      preferred_time: String(formData.get("preferredTime") || ""),
      message: String(formData.get("message") || ""),
    };

    setSubmitting(true);
    setStatus("Saving your callback request...");

    try {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        setStatus(
          `Callback request captured in demo mode. Contact ${BUSINESS_CONTACT.phoneDisplay} directly while Supabase is being connected.`,
        );
        return;
      }

      const { error } = await supabase.from("callback_requests").insert({
        full_name: payload.full_name,
        phone: payload.phone,
        email: payload.email || null,
        preferred_time: payload.preferred_time || null,
        message: payload.message || null,
      } as never);

      if (error) {
        throw new Error(error.message || "Could not save your callback request.");
      }

      form.reset();
      setStatus("Thank you. Special Gifts by M will use your callback details to follow up.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="callback" className="glass rounded-[2rem] p-6 md:p-8">
      <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[var(--mauve)]">Call me back</p>
      <h2 className="mt-2 font-display text-4xl text-[var(--berry)] md:text-5xl">
        Need help placing an order?
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--mauve)]">
        Leave your details and Special Gifts by M can call or WhatsApp you back to help with gifting,
        printing, delivery, or order questions.
      </p>

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="text-sm text-[var(--berry)]">
          Full name
          <input required name="fullName" className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3" />
        </label>
        <label className="text-sm text-[var(--berry)]">
          Phone / WhatsApp
          <input required name="phone" className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3" />
        </label>
        <label className="text-sm text-[var(--berry)]">
          Email
          <input name="email" type="email" className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3" />
        </label>
        <label className="text-sm text-[var(--berry)]">
          Best time to contact you
          <input
            name="preferredTime"
            placeholder="Morning, afternoon, or a preferred time"
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
          />
        </label>
        <label className="text-sm text-[var(--berry)] md:col-span-2">
          What do you need help with?
          <textarea
            name="message"
            className="mt-2 min-h-32 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
            placeholder="Tell us what you want to order or what you need help with."
          />
        </label>

        <div className="md:col-span-2">
          <button type="submit" disabled={submitting} className="button-primary">
            {submitting ? "Saving request..." : "Request a call back"}
          </button>
          {status ? <p className="mt-3 text-sm text-[var(--mauve)]">{status}</p> : null}
        </div>
      </form>
    </section>
  );
}
