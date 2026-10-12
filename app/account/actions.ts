"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveProfile(formData: FormData) {
  const fullName = formData.get("full_name");
  const phone = formData.get("phone");
  const address = formData.get("address");
  const pincode = formData.get("pincode");

  if (
    typeof fullName !== "string" ||
    typeof phone !== "string" ||
    typeof address !== "string" ||
    typeof pincode !== "string"
  ) {
    throw new Error("Invalid profile details.");
  }

  const profile = {
    full_name: fullName.trim(),
    phone: phone.trim(),
    address: address.trim(),
    pincode: pincode.trim(),
  };

  if (
    !profile.full_name ||
    !profile.phone ||
    !profile.address ||
    !profile.pincode
  ) {
    redirect("/account?error=missing_details");
  }

  if (!/^\d{6}$/.test(profile.pincode)) {
    redirect("/account?error=invalid_pincode");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/account/login");
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (error) {
    console.error("Profile save failed:", error);
    throw new Error("Failed to save your account details.");
  }

  revalidatePath("/account");
  revalidatePath("/checkout");

  redirect("/account?saved=true");
}

export async function getProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, phone, address, pincode")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch checkout profile:", error);
    throw new Error("Could not load your saved account details.");
  }

  return data;
}

