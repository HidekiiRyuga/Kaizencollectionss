
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "./checkout-form";

export default async function CheckoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  let initialProfile: {
    full_name: string | null;
    phone: string | null;
    address: string | null;
    pincode: string | null;
  } | null = null;

  if (user && !userError) {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, phone, address, pincode")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load checkout profile:", error);
    } else {
      initialProfile = data;
    }
  }

  return <CheckoutForm initialProfile={initialProfile} />;
}
