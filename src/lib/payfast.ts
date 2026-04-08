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

  const response = await fetch(getPayfastInitUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as PayfastInitResponse & { error?: string }) : null;

  if (!response.ok || !data) {
    throw new Error(data?.error || "Could not start the PayFast checkout.");
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
