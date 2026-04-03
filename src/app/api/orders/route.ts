import { NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase";
import { CheckoutInput } from "@/types/store";

export async function POST(request: Request) {
  const payload = (await request.json()) as CheckoutInput;

  if (!payload.customerName || !payload.phone || !payload.items?.length) {
    return NextResponse.json(
      { message: "Customer name, phone, and at least one cart item are required." },
      { status: 400 },
    );
  }

  const supabase = getServiceSupabaseClient();
  const orderId = `SGM-${Date.now()}`;

  if (!supabase) {
    return NextResponse.json({
      message: "Order captured in demo mode. Add Supabase env vars to persist orders.",
      orderId,
    });
  }

  const { error } = await supabase.from("orders").insert({
    order_number: orderId,
    customer_name: payload.customerName,
    phone: payload.phone,
    email: payload.email || null,
    delivery_method: payload.deliveryMethod,
    delivery_fee: payload.deliveryFee,
    payment_method: payload.paymentMethod,
    locker_id: payload.lockerId || null,
    address: payload.address || null,
    notes: payload.notes || null,
    subtotal: payload.subtotal,
    total: payload.total,
    status: "pending",
    items: payload.items,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Order saved successfully.",
    orderId,
  });
}
