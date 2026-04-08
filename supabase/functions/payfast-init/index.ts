import { createClient } from "npm:@supabase/supabase-js@2.56.0";
import md5 from "npm:blueimp-md5@2.19.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CartItem = {
  cartId: string;
  productId: string;
  slug: string;
  name: string;
  totalPrice: number;
  quantity: number;
};

type CheckoutPayload = {
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string;
  deliveryMethod: string;
  pudoSize?: string;
  lockerId?: string;
  address?: string;
  notes?: string;
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

function buildJsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function encodeValue(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

function createPayfastSignature(fields: Record<string, string>, passphrase?: string) {
  const payload = Object.entries(fields)
    .filter(([key, value]) => key !== "signature" && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${encodeValue(value)}`)
    .join("&");

  const signatureBase = passphrase ? `${payload}&passphrase=${encodeValue(passphrase)}` : payload;
  return md5(signatureBase);
}

function splitCustomerName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts.shift() ?? fullName.trim();
  const lastName = parts.join(" ");
  return { firstName, lastName };
}

function getPayfastProcessUrl(mode: string) {
  return mode === "live" ? "https://www.payfast.co.za/eng/process" : "https://sandbox.payfast.co.za/eng/process";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return buildJsonResponse(405, { error: "Method not allowed." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const merchantId = Deno.env.get("PAYFAST_MERCHANT_ID");
  const merchantKey = Deno.env.get("PAYFAST_MERCHANT_KEY");
  const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") ?? "";
  const payfastMode = Deno.env.get("PAYFAST_MODE") ?? "sandbox";
  const publicSiteUrl = Deno.env.get("PUBLIC_SITE_URL");

  if (!supabaseUrl || !supabaseServiceRoleKey || !merchantId || !merchantKey || !publicSiteUrl) {
    return buildJsonResponse(500, {
      error: "Supabase or PayFast secrets are missing. Add the required secrets in Supabase Edge Functions first.",
    });
  }

  let payload: CheckoutPayload;

  try {
    payload = (await request.json()) as CheckoutPayload;
  } catch {
    return buildJsonResponse(400, { error: "The PayFast checkout payload could not be read." });
  }

  if (payload.paymentMethod !== "payfast") {
    return buildJsonResponse(400, { error: "This function only supports PayFast orders." });
  }

  if (!payload.email?.trim()) {
    return buildJsonResponse(400, { error: "Email is required for PayFast sandbox checkout." });
  }

  if (!payload.customerName?.trim() || !payload.phone?.trim() || !payload.items?.length) {
    return buildJsonResponse(400, { error: "Customer details and at least one cart item are required." });
  }

  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  let verifiedCustomerId: string | null = null;

  const authorization = request.headers.get("Authorization");

  if (authorization && supabaseAnonKey) {
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authorization,
        },
      },
    });

    const {
      data: { user },
    } = await userClient.auth.getUser();

    verifiedCustomerId = user?.id ?? null;
  }

  const orderNumber = `SGM-${Date.now()}`;
  const { error: insertError } = await serviceClient.from("orders").insert({
    order_number: orderNumber,
    customer_id: verifiedCustomerId,
    customer_name: payload.customerName.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    delivery_method: payload.deliveryMethod,
    delivery_fee: payload.deliveryFee,
    payment_method: "payfast",
    pudo_size: payload.pudoSize || null,
    locker_id: payload.lockerId || null,
    address: payload.address || null,
    notes: payload.notes || null,
    subtotal: payload.subtotal,
    total: payload.total,
    status: "pending_payment",
    items: payload.items,
  } as never);

  if (insertError) {
    return buildJsonResponse(500, { error: insertError.message || "Could not create the PayFast order." });
  }

  const { firstName, lastName } = splitCustomerName(payload.customerName);
  const returnUrl = `${publicSiteUrl.replace(/\/$/, "")}/checkout/payfast-return?order=${encodeURIComponent(orderNumber)}`;
  const cancelUrl = `${publicSiteUrl.replace(/\/$/, "")}/checkout/payfast-cancel?order=${encodeURIComponent(orderNumber)}`;
  const notifyUrl = `${supabaseUrl}/functions/v1/payfast-itn`;

  const fields: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    name_first: firstName,
    email_address: payload.email.trim(),
    m_payment_id: orderNumber,
    amount: Number(payload.total).toFixed(2),
    item_name: `Special Gifts by M Order ${orderNumber}`,
    item_description: `Sandbox checkout for ${payload.items.length} Special Gifts by M item(s)`,
  };

  if (lastName) {
    fields.name_last = lastName;
  }

  fields.signature = createPayfastSignature(fields, passphrase);

  return buildJsonResponse(200, {
    orderNumber,
    paymentUrl: getPayfastProcessUrl(payfastMode),
    fields,
  });
});
