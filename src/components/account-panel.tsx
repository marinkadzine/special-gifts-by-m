"use client";

import { FormEvent, useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { OrderRecord } from "@/types/store";
import { useAuth } from "@/components/auth-provider";
import { formatCurrency } from "@/lib/pricing";

export function AccountPanel() {
  const { user, profile, loading, signOut } = useAuth();
  const [loginStatus, setLoginStatus] = useState("");
  const [signupStatus, setSignupStatus] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        setOrders([]);
        return;
      }

      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        return;
      }

      setLoadingOrders(true);
      const { data } = await supabase
        .from("orders")
        .select(
          "id, order_number, customer_name, phone, email, delivery_method, delivery_fee, payment_method, locker_id, pudo_size, address, notes, subtotal, total, status, items, created_at",
        )
        .order("created_at", { ascending: false });

      setOrders((data as OrderRecord[] | null) ?? []);
      setLoadingOrders(false);
    }

    loadOrders();
  }, [user]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setLoginStatus("Supabase is not connected yet, so account login is not available.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    setLoginSubmitting(true);
    setLoginStatus("Signing you in...");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setLoginStatus("You are now signed in.");
    } catch (error) {
      setLoginStatus(error instanceof Error ? error.message : "Could not log in.");
    } finally {
      setLoginSubmitting(false);
    }
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setSignupStatus("Supabase is not connected yet, so sign up is not available.");
      return;
    }

    const formData = new FormData(form);
    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    setSignupSubmitting(true);
    setSignupStatus("Creating your account...");

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      setSignupStatus("Your account was created. Check your email if confirmation is enabled, then log in.");
      form.reset();
    } catch (error) {
      setSignupStatus(error instanceof Error ? error.message : "Could not create your account.");
    } finally {
      setSignupSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="glass rounded-[2rem] p-6 md:p-8">
        <p className="text-sm text-[var(--mauve)]">Loading account information...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="glass rounded-[2rem] p-6 md:p-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">Customer account</p>
        <h2 className="mt-2 font-display text-4xl text-[var(--berry)] md:text-5xl">
          Log in or create your account
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--mauve)]">
          Customers can sign up here, keep their login details, and use the same account for future orders.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.8rem] border border-[var(--line)] bg-white/80 p-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-[var(--mauve)]">Log In</p>
            <h3 className="mt-2 font-display text-3xl text-[var(--berry)]">Welcome back</h3>
            <form className="mt-5 space-y-4" onSubmit={handleLogin}>
              <label className="block text-sm text-[var(--berry)]">
                Email
                <input
                  required
                  name="email"
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                />
              </label>
              <label className="block text-sm text-[var(--berry)]">
                Password
                <input
                  required
                  name="password"
                  type="password"
                  minLength={6}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                />
              </label>
              <button disabled={loginSubmitting} type="submit" className="button-primary">
                {loginSubmitting ? "Please wait..." : "Log in"}
              </button>
              {loginStatus ? <p className="text-sm text-[var(--mauve)]">{loginStatus}</p> : null}
            </form>
          </div>

          <div className="rounded-[1.8rem] border border-[var(--line)] bg-white/80 p-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-[var(--mauve)]">Sign Up</p>
            <h3 className="mt-2 font-display text-3xl text-[var(--berry)]">Create a new account</h3>
            <form className="mt-5 space-y-4" onSubmit={handleSignup}>
              <label className="block text-sm text-[var(--berry)]">
                Full name
                <input
                  required
                  name="fullName"
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                />
              </label>
              <label className="block text-sm text-[var(--berry)]">
                Email
                <input
                  required
                  name="email"
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                />
              </label>
              <label className="block text-sm text-[var(--berry)]">
                Password
                <input
                  required
                  name="password"
                  type="password"
                  minLength={6}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                />
              </label>
              <button disabled={signupSubmitting} type="submit" className="button-primary">
                {signupSubmitting ? "Creating..." : "Sign up"}
              </button>
              {signupStatus ? <p className="text-sm text-[var(--mauve)]">{signupStatus}</p> : null}
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="glass rounded-[2rem] p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">My account</p>
          <h2 className="mt-2 font-display text-4xl text-[var(--berry)]">
            {profile?.full_name || user.user_metadata.full_name || user.email}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">{user.email}</p>
        </div>
        <button type="button" className="button-secondary" onClick={() => signOut()}>
          Sign out
        </button>
      </div>

      <div className="mt-8 rounded-[1.5rem] bg-white/75 p-5">
        <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
          Saved order history
        </p>
        <div className="mt-4 space-y-3">
          {loadingOrders ? (
            <p className="text-sm text-[var(--mauve)]">Loading your orders...</p>
          ) : orders.length ? (
            orders.map((order) => (
              <div key={order.id} className="rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-bold text-[var(--berry)]">{order.order_number}</p>
                    <p className="text-sm text-[var(--mauve)]">
                      {new Date(order.created_at).toLocaleDateString("en-ZA")} | {order.status}
                    </p>
                  </div>
                  <p className="font-bold text-[var(--berry)]">{formatCurrency(Number(order.total))}</p>
                </div>
                {order.items?.length ? (
                  <div className="mt-3 space-y-3 rounded-[1rem] bg-[var(--light-grey)] p-3">
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
                                <a
                                  key={file.id}
                                  href={file.url || "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full bg-[var(--soft-rose)] px-3 py-1 font-bold text-[var(--rose-deep)]"
                                >
                                  {file.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--mauve)]">
              No account-linked orders yet. Once you order while signed in, your order history will appear here.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
