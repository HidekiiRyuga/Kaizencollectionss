
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { updateDeliverySettings } from "./actions";

export default async function DeliverySettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
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

  const { data: settings, error } = await supabase
    .from("delivery_settings")
    .select(
      "free_delivery_enabled, delivery_fee, promo_message"
    )
    .eq("id", 1)
    .single();

  if (error || !settings) {
    console.error("Failed to load delivery settings:", error);

    return (
      <main className="mx-auto max-w-[1000px] px-8 py-16">
        <p className="text-red-700">
          Failed to load delivery settings. Please refresh and try again.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-block text-sm font-medium text-[#302324] underline"
        >
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1000px] px-8 py-16 lg:px-12 lg:py-20">
      <Link
        href="/admin"
        className="text-sm font-medium text-[#7A6B6D] hover:text-[#302324]"
      >
        ← Back to dashboard
      </Link>

      <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
        Store settings
      </p>

      <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
        Delivery
      </h1>

      <p className="mt-4 max-w-2xl text-[#7A6B6D]">
        Manage your delivery fee and launch promotion. Changes apply to
        new orders only.
      </p>

      {saved === "1" && (
        <div
          role="status"
          className="mt-8 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800"
        >
          Delivery settings saved successfully.
        </div>
      )}

      <form
        action={updateDeliverySettings}
        className="mt-10 space-y-8 rounded-3xl border border-[#E7DDDD] p-6 sm:p-9"
      >
        <div>
          <h2 className="text-lg font-semibold text-[#302324]">
            Free delivery
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#7A6B6D]">
            When enabled, customers pay no delivery charge. The configured
            fee will still be shown crossed out beside FREE.
          </p>

          <div className="mt-4 flex flex-wrap gap-5">
            <label className="flex items-center gap-3 text-sm font-medium text-[#302324]">
              <input
                type="radio"
                name="free_delivery_enabled"
                value="true"
                defaultChecked={settings.free_delivery_enabled}
                className="h-4 w-4 accent-[#302324]"
              />
              Free delivery enabled
            </label>

            <label className="flex items-center gap-3 text-sm font-medium text-[#302324]">
              <input
                type="radio"
                name="free_delivery_enabled"
                value="false"
                defaultChecked={!settings.free_delivery_enabled}
                className="h-4 w-4 accent-[#302324]"
              />
              Charge delivery fee
            </label>
          </div>
        </div>

        <div>
          <label
            htmlFor="delivery_fee"
            className="text-sm font-semibold text-[#302324]"
          >
            Delivery fee (₹)
          </label>

          <p className="mt-2 text-sm text-[#7A6B6D]">
            This amount is charged when free delivery is disabled.
          </p>

          <input
            id="delivery_fee"
            name="delivery_fee"
            type="number"
            min="0"
            max="100000"
            step="1"
            required
            defaultValue={settings.delivery_fee}
            className="mt-3 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
          />
        </div>

        <div>
          <label
            htmlFor="promo_message"
            className="text-sm font-semibold text-[#302324]"
          >
            Promotional message
          </label>

          <p className="mt-2 text-sm text-[#7A6B6D]">
            Displayed to customers while free delivery is active.
          </p>

          <textarea
            id="promo_message"
            name="promo_message"
            rows={3}
            maxLength={500}
            defaultValue={settings.promo_message}
            className="mt-3 w-full resize-y rounded-xl border border-[#E7DDDD] bg-white px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
            placeholder="Launch offer — free delivery for a limited time!"
          />
        </div>

        <div className="rounded-2xl bg-[#FCF9F9] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
            Current configuration
          </p>

          <p className="mt-2 font-semibold text-[#302324]">
            {settings.free_delivery_enabled
              ? `Free delivery · ₹${settings.delivery_fee.toLocaleString("en-IN")} waived`
              : `Delivery charge · ₹${settings.delivery_fee.toLocaleString("en-IN")}`}
          </p>

          {settings.free_delivery_enabled &&
            settings.promo_message && (
              <p className="mt-2 text-sm text-[#7A6B6D]">
                {settings.promo_message}
              </p>
            )}
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-[#302324] px-6 py-4 text-sm font-semibold text-white hover:bg-[#211819] sm:w-auto"
        >
          Save delivery settings
        </button>
      </form>
    </main>
  );
}
