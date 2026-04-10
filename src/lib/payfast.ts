import { getBrowserSupabaseClient } from "@/lib/supabase";
import { CheckoutInput } from "@/types/store";

export type PayfastInitResponse = {
  orderNumber: string;
  paymentUrl: string;
  fields: Record<string, string>;
};

function getPayfastInitUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("Supabase URL is missing, so PayFast cannot be prepared yet.");
  }

  return `${supabaseUrl}/functions/v1/payfast-init`;
}

export async function initiatePayfastCheckout(payload: CheckoutInput) {
  const supabase = getBrowserSupabaseClient();
  const sessionResult = supabase ? await supabase.auth.getSession() : null;
  const accessToken = sessionResult?.data.session?.access_token;
  let response: Response;

  try {
    response = await fetch(getPayfastInitUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "PayFast could not be reached. In Supabase, deploy the payfast-init and payfast-itn Edge Functions, add the PAYFAST_* secrets and PUBLIC_SITE_URL, then redeploy Cloudflare Pages.",
    );
  }

  const text = await response.text();
  let data: (PayfastInitResponse & { error?: string }) | null = null;

  if (text) {
    try {
      data = JSON.parse(text) as PayfastInitResponse & { error?: string };
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || text || "Could not start the PayFast checkout.");
  }

  if (!data) {
    throw new Error("PayFast returned an invalid response. Please redeploy the Supabase function and try again.");
  }

  return data;
}

export function submitPayfastForm(paymentUrl: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = paymentUrl;
  form.style.display = "none";

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
