"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  sendOrderStatusEmail,
  type OrderEmailStatus,
} from "@/lib/email/order-emails";


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

  // Fetch details needed for the customer notification.
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select(
      "customer_email, customer_name, total, shipping_courier, tracking_number"
    )
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    console.error("Failed to load order:", fetchError);
    throw new Error("Order not found.");
  }

  // Perform the status transition through the database function.
  const { data: updated, error: updateError } =
    await supabase.rpc("admin_update_order_status", {
      p_order_id: orderId,
      p_status: status,
    });

  if (updateError || updated !== true) {
    console.error("Order status update failed:", updateError);
    throw new Error(
      "Failed to update order status. It may have changed already."
    );
  }

  // Send notification after successful database update.
  if (order.customer_email) {
    await sendOrderStatusEmail(status as OrderEmailStatus, {
      orderId,
      customerEmail: order.customer_email,
      customerName: order.customer_name ?? "there",
      total: order.total,
      courier: order.shipping_courier,
      trackingNumber: order.tracking_number,
    });
  } else {
    console.warn(
      "Status email skipped: order has no customer email.",
      orderId
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

  // Fetch the order after the database confirms payment and status.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, status, customer_email, customer_name, total, shipping_courier, tracking_number"
    )
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    console.error("Payment confirmed, but order details could not be loaded:", orderError);
  } else if (order.status === "confirmed" && order.customer_email) {
    await sendOrderStatusEmail("confirmed", {
      orderId: order.id,
      customerEmail: order.customer_email,
      customerName: order.customer_name ?? "there",
      total: order.total,
      courier: order.shipping_courier,
      trackingNumber: order.tracking_number,
    });
  } else {
    console.warn(
      "Confirmation email skipped: order is not confirmed or has no customer email.",
      orderId
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

export async function updateOrderTracking(formData: FormData) {
  const orderId = formData.get("orderId");
  const courier = formData.get("shipping_courier");
  const trackingNumber = formData.get("tracking_number");

  if (
    typeof orderId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId) ||
    typeof courier !== "string" ||
    typeof trackingNumber !== "string"
  ) {
    throw new Error("Invalid shipment details.");
  }

  const normalizedCourier = courier.trim().toLowerCase();
  const normalizedTrackingNumber = trackingNumber.trim();

  const allowedCouriers = ["delhivery"];

  if (!allowedCouriers.includes(normalizedCourier)) {
    throw new Error("Please select a supported courier.");
  }

  if (
    normalizedTrackingNumber.length < 5 ||
    normalizedTrackingNumber.length > 100 ||
    !/^[a-zA-Z0-9-]+$/.test(normalizedTrackingNumber)
  ) {
    throw new Error("Please enter a valid tracking number.");
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
    throw new Error(
      "You are not authorized to update shipment tracking."
    );
  }

  // Update tracking through the database function.
  const { data: updated, error: updateError } =
    await supabase.rpc("admin_update_order_tracking", {
      p_order_id: orderId,
      p_shipping_courier: normalizedCourier,
      p_tracking_number: normalizedTrackingNumber,
    });

  if (updateError || updated !== true) {
    console.error("Shipment tracking update failed:", updateError);
    throw new Error(
      "Failed to save tracking details. Please try again."
    );
  }

  revalidatePath("/admin/orders");
  revalidatePath("/track-order");
  revalidatePath("/account/orders");

  redirect("/admin/orders");
}