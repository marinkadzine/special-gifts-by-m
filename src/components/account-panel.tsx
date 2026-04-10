"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { getBrowserSupabaseClient, uploadProfileImage } from "@/lib/supabase";
import { OrderRecord } from "@/types/store";
import { useAuth } from "@/components/auth-provider";
import { formatCurrency } from "@/lib/pricing";

function formatItemDelivery(orderItem: NonNullable<OrderRecord["items"]>[number]) {
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

export function AccountPanel() {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const [loginStatus, setLoginStatus] = useState("");
  const [signupStatus, setSignupStatus] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

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
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      setOrders((data as OrderRecord[] | null) ?? []);
      setLoadingOrders(false);
    }

    void loadOrders();
  }, [user]);

  useEffect(() => {
    setFullName(profile?.full_name || String(user?.user_metadata.full_name || "").trim());
    setPhone(profile?.phone || "");
    setAvatarUrl(profile?.avatar_url || "");
  }, [profile?.avatar_url, profile?.full_name, profile?.phone, user?.user_metadata.full_name]);

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
    const fullNameValue = String(formData.get("fullName") || "").trim();
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
            full_name: fullNameValue,
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

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setProfileStatus("Supabase is not connected yet, so profile updates are not available.");
      return;
    }

    setSavingProfile(true);
    setProfileStatus("Saving your profile...");

    try {
      const profilePayload = {
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        avatar_url: avatarUrl || null,
      };

      const { error: profileError } = await supabase.from("profiles").update(profilePayload as never).eq("id", user.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      const { error: userError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim() || null,
        },
      });

      if (userError) {
        throw new Error(userError.message);
      }

      await refreshProfile();
      setProfileStatus("Your profile details were updated.");
    } catch (error) {
      setProfileStatus(error instanceof Error ? error.message : "Could not update your profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !user) {
      return;
    }

    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setProfileStatus("Supabase is not connected yet, so profile photos cannot be uploaded.");
      return;
    }

    setUploadingAvatar(true);
    setProfileStatus("Uploading your profile photo...");

    try {
      const uploadedAvatarUrl = await uploadProfileImage(file, user.id);
      setAvatarUrl(uploadedAvatarUrl);
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: uploadedAvatarUrl } as never)
        .eq("id", user.id);

      if (error) {
        throw new Error(error.message);
      }

      await refreshProfile();
      setProfileStatus("Your profile photo was updated.");
      event.target.value = "";
    } catch (error) {
      setProfileStatus(error instanceof Error ? error.message : "Could not upload your profile photo.");
    } finally {
      setUploadingAvatar(false);
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
          Customers can sign up here, keep their login details, upload a profile photo, and track account-linked orders.
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

  const waitingOrders = orders.filter((order) => order.status === "waiting_for_approval");
  const orderHistory = orders.filter((order) => order.status !== "waiting_for_approval");
  const profileLabel = fullName || profile?.full_name || String(user.user_metadata.full_name || user.email || "").trim();

  return (
    <section className="space-y-6">
      <section className="glass rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={profileLabel} className="h-24 w-24 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--soft-rose)] text-2xl font-extrabold text-[var(--rose-deep)]">
                {(profileLabel || "SG")
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() || "")
                  .join("") || "SG"}
              </div>
            )}
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">My account</p>
              <h2 className="mt-2 font-display text-4xl text-[var(--berry)]">{profileLabel}</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">{user.email}</p>
            </div>
          </div>
          <button type="button" className="button-secondary" onClick={() => signOut()}>
            Sign out
          </button>
        </div>

        <form className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]" onSubmit={handleProfileSave}>
          <div className="rounded-[1.5rem] bg-white/80 p-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-[var(--mauve)]">
              Profile photo
            </p>
            <label className="mt-4 block text-sm text-[var(--berry)]">
              Upload a profile image
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <p className="mt-3 text-sm leading-7 text-[var(--mauve)]">
              {uploadingAvatar
                ? "Uploading profile photo..."
                : "Add a photo so your profile is easy to recognize in the header and account area."}
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white/80 p-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-[var(--mauve)]">
              Personal information
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-[var(--berry)]">
                Full name
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                />
              </label>
              <label className="block text-sm text-[var(--berry)]">
                Phone / WhatsApp
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                />
              </label>
            </div>
            <label className="mt-4 block text-sm text-[var(--berry)]">
              Email
              <input
                disabled
                value={user.email || ""}
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--light-grey)] px-4 py-3 text-[var(--mauve)]"
              />
            </label>
            <div className="mt-5 flex flex-wrap gap-3">
              <button disabled={savingProfile} type="submit" className="button-primary">
                {savingProfile ? "Saving..." : "Save profile"}
              </button>
            </div>
            {profileStatus ? <p className="mt-4 text-sm text-[var(--mauve)]">{profileStatus}</p> : null}
          </div>
        </form>
      </section>

      <section className="glass rounded-[2rem] p-6 md:p-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
          Waiting for approval
        </p>
        <h3 className="mt-2 font-display text-3xl text-[var(--berry)]">Manual-payment orders</h3>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--mauve)]">
          EFT orders stay here until the admin confirms that payment reflects in the business bank account.
        </p>
        <div className="mt-4 space-y-3">
          {loadingOrders ? (
            <p className="text-sm text-[var(--mauve)]">Loading your orders...</p>
          ) : waitingOrders.length ? (
            waitingOrders.map((order) => (
              <div key={order.id} className="rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-bold text-[var(--berry)]">{order.order_number}</p>
                    <p className="text-sm text-[var(--mauve)]">
                      {new Date(order.created_at).toLocaleDateString("en-ZA")} | Waiting for approval
                    </p>
                  </div>
                  <p className="font-bold text-[var(--berry)]">{formatCurrency(Number(order.total))}</p>
                </div>
                {order.notes ? (
                  <div className="mt-3 rounded-[1rem] bg-[var(--light-grey)] px-4 py-3 text-sm leading-7 text-[var(--berry)]">
                    {order.notes.split("\n").map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--mauve)]">
              No manual-payment orders are waiting for approval right now.
            </p>
          )}
        </div>
      </section>

      <section className="glass rounded-[2rem] p-6 md:p-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
          Saved order history
        </p>
        <div className="mt-4 space-y-3">
          {loadingOrders ? (
            <p className="text-sm text-[var(--mauve)]">Loading your orders...</p>
          ) : orderHistory.length ? (
            orderHistory.map((order) => (
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
                {order.notes ? (
                  <div className="mt-3 rounded-[1rem] bg-[var(--light-grey)] px-4 py-3 text-sm leading-7 text-[var(--berry)]">
                    {order.notes.split("\n").map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                ) : null}
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
                        {item.giftWrap ? (
                          <p className="mt-1 text-sm text-[var(--mauve)]">Gift wrapping selected for this item.</p>
                        ) : null}
                        {item.wrappingInstructions ? (
                          <p className="mt-1 text-sm text-[var(--mauve)]">
                            Wrapping instructions: {item.wrappingInstructions}
                          </p>
                        ) : null}
                        {formatItemDelivery(item) ? (
                          <p className="mt-1 text-sm text-[var(--mauve)]">Delivery: {formatItemDelivery(item)}</p>
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
      </section>
    </section>
  );
}
