
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    redirect("/");
  }

  return supabase;
}

export async function updateDeliverySettings(formData: FormData) {
  const freeDeliveryValue = formData.get("free_delivery_enabled");
  const feeValue = formData.get("delivery_fee");
  const messageValue = formData.get("promo_message");

  if (
    (freeDeliveryValue !== "true" &&
      freeDeliveryValue !== "false") ||
    typeof feeValue !== "string" ||
    typeof messageValue !== "string"
  ) {
    throw new Error("Invalid delivery settings.");
  }

  const deliveryFee = Number(feeValue);
  const promoMessage = messageValue.trim();

  if (
    !Number.isSafeInteger(deliveryFee) ||
    deliveryFee < 0 ||
    deliveryFee > 100000
  ) {
    throw new Error("Delivery fee must be a valid amount between ₹0 and ₹100,000.");
  }

  if (promoMessage.length > 500) {
    throw new Error("The promotional message must be 500 characters or fewer.");
  }

  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("delivery_settings")
    .update({
      free_delivery_enabled: freeDeliveryValue === "true",
      delivery_fee: deliveryFee,
      promo_message: promoMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Delivery settings update failed:", error);
    throw new Error("Failed to save delivery settings.");
  }

  if (!data) {
    throw new Error("Delivery settings were not found.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/delivery");
  revalidatePath("/checkout");
  revalidatePath("/checkout/payment");
  revalidatePath("/shop");

  redirect("/admin/delivery?saved=1");
}
