import { createClient } from "npm:@supabase/supabase-js@2.56.0";
import md5 from "npm:blueimp-md5@2.19.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function encodeValue(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

function createPayfastSignature(fields: Record<string, string>, passphrase?: string) {
  const payload = Object.entries(fields)
    .filter(([key, value]) => key !== "signature" && value.trim() !== "")
    .map(([key, value]) => `${key}=${encodeValue(value.trim())}`)
    .join("&");

  const trimmedPassphrase = passphrase?.trim() ?? "";
  const signatureBase = trimmedPassphrase ? `${payload}&passphrase=${encodeValue(trimmedPassphrase)}` : payload;
  return md5(signatureBase);
}

function getPayfastValidationUrl(mode: string) {
  return mode === "live"
    ? "https://www.payfast.co.za/eng/query/validate"
    : "https://sandbox.payfast.co.za/eng/query/validate";
}

function buildTextResponse(status: number, message: string) {
  return new Response(message, {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return buildTextResponse(405, "Method not allowed.");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const merchantId = Deno.env.get("PAYFAST_MERCHANT_ID")?.trim();
  const passphrase = Deno.env.get("PAYFAST_PASSPHRASE")?.trim() ?? "";
  const payfastMode = Deno.env.get("PAYFAST_MODE")?.trim() || "sandbox";

  if (!supabaseUrl || !supabaseServiceRoleKey || !merchantId) {
    return buildTextResponse(500, "Supabase or PayFast secrets are missing.");
  }

  const rawBody = await request.text();
  const parsedBody = new URLSearchParams(rawBody);
  const data = Object.fromEntries(parsedBody.entries());

  if (!data.signature || !data.m_payment_id) {
    return buildTextResponse(400, "Missing PayFast ITN fields.");
  }

  if (data.merchant_id !== merchantId) {
    return buildTextResponse(400, "Merchant ID mismatch.");
  }

  const expectedSignature = createPayfastSignature(data, passphrase);

  if (expectedSignature !== data.signature) {
    return buildTextResponse(400, "Invalid PayFast signature.");
  }

  const validationResponse = await fetch(getPayfastValidationUrl(payfastMode), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: rawBody,
  });

  const validationText = (await validationResponse.text()).trim();

  if (validationText !== "VALID") {
    return buildTextResponse(400, "PayFast validation failed.");
  }

  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  const { data: order, error: orderError } = await serviceClient
    .from("orders")
    .select("id, order_number, total")
    .eq("order_number", data.m_payment_id)
    .maybeSingle();

  if (orderError || !order) {
    return buildTextResponse(404, "Order not found.");
  }

  const grossAmount = Number(data.amount_gross ?? 0);
  const expectedTotal = Number(order.total ?? 0);

  if (Number.isFinite(grossAmount) && Number.isFinite(expectedTotal)) {
    const difference = Math.abs(grossAmount - expectedTotal);

    if (difference > 0.01) {
      return buildTextResponse(400, "Amount mismatch.");
    }
  }

  const paymentStatus = String(data.payment_status || "").toUpperCase();
  let nextOrderStatus = "pending_payment";
  let confirmedAt: string | null = null;

  if (paymentStatus === "COMPLETE") {
    nextOrderStatus = "paid";
    confirmedAt = new Date().toISOString();
  } else if (paymentStatus === "FAILED") {
    nextOrderStatus = "failed";
  } else if (paymentStatus === "CANCELLED") {
    nextOrderStatus = "cancelled";
  }

  const { error: updateError } = await serviceClient
    .from("orders")
    .update({
      status: nextOrderStatus,
      payment_reference: data.pf_payment_id || null,
      payment_confirmed_at: confirmedAt,
    } as never)
    .eq("id", order.id);

  if (updateError) {
    return buildTextResponse(500, updateError.message || "Could not update the order.");
  }

  return buildTextResponse(200, "OK");
});
