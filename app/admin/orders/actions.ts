"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get("orderId");
  const status = formData.get("status");

  if (typeof orderId !== "string" || typeof status !== "string") {
    throw new Error("Invalid order data.");
  }

  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    throw new Error("Invalid order status.");
  }

  const supabase = await createClient();

  // Get the current payment status before changing the order status.
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("payment_status")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    console.error("Failed to load order:", fetchError);
    throw new Error("Order not found.");
  }

  // Payment must be confirmed before the order can move
  // to confirmed, shipped, or delivered.
  if (
    ["confirmed", "shipped", "delivered"].includes(status) &&
    order.payment_status !== "paid"
  ) {
    throw new Error(
      "Payment must be confirmed before this order can be confirmed, shipped, or delivered."
    );
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      status,
    })
    .eq("id", orderId)
    .select("id, status")
    .single();

  if (updateError || !updatedOrder) {
    console.error("Order status update failed:", updateError);
    throw new Error(
      "Failed to update order status. Please check your admin permissions."
    );
  }

  revalidatePath("/admin/orders", "page");
  revalidatePath("/account/orders", "page");

  redirect("/admin/orders");
}

export async function confirmPayment(formData: FormData) {
  const orderId = formData.get("orderId");

  if (typeof orderId !== "string" || !orderId) {
    throw new Error("Invalid order ID.");
  }

  const supabase = await createClient();

  // Check which user the server action is actually authenticated as.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("CONFIRM PAYMENT DEBUG");
  console.log("Order ID:", orderId);
  console.log("Authenticated user:", user?.id);
  console.log("Auth error:", userError);

  if (!user) {
    throw new Error("No authenticated user found.");
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
      status: "confirmed",
    })
    .eq("id", orderId)
    .eq("payment_status", "pending")
    .select("id, payment_status, paid_at, status")
    .single();

  console.log("Updated order:", updatedOrder);
  console.log("Update error:", updateError);

  if (updateError || !updatedOrder) {
    throw new Error(
      "Payment confirmation failed. Check the terminal debug output."
    );
  }

  revalidatePath("/admin/orders", "page");
  revalidatePath("/account/orders", "page");

  redirect("/admin/orders");
}