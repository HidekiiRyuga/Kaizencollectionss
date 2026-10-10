"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";


const VALID_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
] as const;

export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get("orderId");
  const status = formData.get("status");

  if (
    typeof orderId !== "string" ||
    !orderId ||
    typeof status !== "string"
  ) {
    throw new Error("Invalid order data.");
  }

  if (
    !VALID_STATUSES.includes(
      status as (typeof VALID_STATUSES)[number]
    ) ||
    status === "cancelled"
  ) {
    throw new Error("Invalid order status.");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    throw new Error("You are not authorized to update orders.");
  }

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("status, payment_status")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    console.error("Failed to load order:", fetchError);
    throw new Error("Order not found.");
  }

  const allowedTransitions: Record<string, string[]> = {
    pending: ["confirmed"],
    confirmed: ["shipped"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  if (!allowedTransitions[order.status]?.includes(status)) {
    throw new Error(
      `Cannot change order status from ${order.status} to ${status}.`
    );
  }

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
    .update({ status })
    .eq("id", orderId)
    .eq("status", order.status)
    .select("id, status")
    .maybeSingle();

  if (updateError || !updatedOrder) {
    console.error("Order status update failed:", updateError);
    throw new Error(
      "Failed to update order status. It may have changed already."
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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    throw new Error("You are not authorized to confirm payments.");
  }

  // Confirm payment through the database function.
  const { data: confirmed, error: confirmError } =
    await supabase.rpc("confirm_order_payment", {
      p_order_id: orderId,
    });

  if (confirmError) {
    console.error("Payment confirmation failed:", confirmError);
    throw new Error(
      "Payment confirmation failed. Please refresh and try again."
    );
  }

  if (confirmed !== true) {
    throw new Error(
      "The order cannot be confirmed. It may have been cancelled or already processed."
    );
  }

  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");

  redirect("/admin/orders");
}
