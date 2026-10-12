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
    redirect(
      "/admin/orders?error=payment_required"
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

export async function rejectPayment(formData: FormData) {
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
    throw new Error("You are not authorized to reject payments.");
  }

  const { data: rejected, error } = await supabase.rpc(
    "reject_order_payment",
    { p_order_id: orderId }
  );

  if (error) {
    console.error("Payment rejection failed:", error);
    throw new Error("Failed to reject payment. Please try again.");
  }

  if (rejected !== true) {
    throw new Error(
      "This payment cannot be rejected. The order may already have been processed."
    );
  }

  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");

  redirect("/admin/orders");
}


export async function adminCancelPaidOrder(formData: FormData) {
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
    throw new Error("You are not authorized to cancel orders.");
  }

  const { data: cancelled, error } = await supabase.rpc(
    "admin_cancel_paid_order",
    { p_order_id: orderId }
  );

  if (error) {
    console.error("Order cancellation failed:", error);
    throw new Error("Failed to cancel order. Please try again.");
  }

  if (cancelled !== true) {
    throw new Error(
      "This order cannot be cancelled. Only paid, pending or confirmed orders are eligible."
    );
  }

  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");

  redirect("/admin/orders");
}


export async function markRefundProcessed(formData: FormData) {
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
    throw new Error("You are not authorized to process refunds.");
  }

  const { data: processed, error } = await supabase.rpc(
    "mark_order_refund_processed",
    { p_order_id: orderId }
  );

  if (error) {
    console.error("Refund update failed:", error);
    throw new Error("Failed to update refund status. Please try again.");
  }

  if (processed !== true) {
    throw new Error(
      "This refund cannot be marked as processed. Check its current status."
    );
  }

  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");

  redirect("/admin/orders");
}

