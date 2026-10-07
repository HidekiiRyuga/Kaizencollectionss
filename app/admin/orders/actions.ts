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

  const { error } = await supabase
    .from("orders")
    .update({
      status,
    })
    .eq("id", orderId);

  if (error) {
    console.error("Order status update failed:", error);
    throw new Error("Failed to update order status.");
  }

  revalidatePath("/admin/orders", "page");

  redirect("/admin/orders");
}