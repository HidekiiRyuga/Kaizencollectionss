
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";
import { saveProfile } from "./actions";

interface AccountPageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AccountPage({
  searchParams,
}: AccountPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const { data: isAdmin, error: adminError } =
  await supabase.rpc("is_admin");

  if (adminError) {
    console.error("Failed to check admin role:", adminError);
  }

  const isAdminUser = !adminError && isAdmin === true;

  const params = await searchParams;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, phone, address, pincode")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to load profile:", profileError);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 lg:px-12 lg:py-20">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
          Account
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
            My Account
          </h1>

          {isAdminUser && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#E7DDDD] bg-[#FCF9F9] px-3 py-1.5 text-xs font-semibold text-[#302324]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3 19 6v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6l7-3Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 12 2 2 4-4"
                />
              </svg>
              Admin
            </span>
          )}
        </div>

        <p className="mt-4 text-[#7A6B6D]">
          Manage your account and keep track of your orders.
        </p>
      </div>

      {params.saved === "true" && (
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Your account details have been saved successfully.
        </div>
      )}

      {params.error === "missing_details" && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Please fill in all account details.
        </div>
      )}

      {params.error === "invalid_pincode" && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Please enter a valid 6-digit PIN code.
        </div>
      )}

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
      {isAdminUser ? (
        <Link
          href="/admin"
          className="group rounded-2xl border border-[#E7DDDD] bg-white p-7 transition-colors hover:border-[#D7B6B9] hover:bg-[#FCF9F9]"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-[#302324]">
              Admin Dashboard
            </h2>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5E9EA] text-[#302324]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-[#7A6B6D]">
            Manage products, orders, payments, and store operations.
          </p>

          <p className="mt-6 text-sm font-semibold text-[#302324]">
            Open Dashboard →
          </p>
        </Link>
      ) : (
        <Link
          href="/account/orders"
          className="rounded-2xl border border-[#E7DDDD] bg-white p-7"
        >
          <h2 className="text-xl font-semibold text-[#302324]">
            My Orders
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#7A6B6D]">
            View your previous orders, order details, and current status.
          </p>

          <p className="mt-6 text-sm font-semibold text-[#302324]">
            View Orders →
          </p>
        </Link>
      )}

        <div className="rounded-2xl border border-[#E7DDDD] bg-white p-7">
          <h2 className="text-xl font-semibold text-[#302324]">
            Account Details
          </h2>

          <p className="mt-2 text-sm text-[#7A6B6D]">
            Email
          </p>

          <p className="mt-1 break-all text-sm font-medium text-[#302324]">
            {user.email}
          </p>
        </div>
      </div>
      {!isAdminUser && (
        <section className="mt-8 rounded-2xl border border-[#E7DDDD] bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-[#302324]">
            Delivery Information
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#7A6B6D]">
            Save your details once to make future checkouts faster.
          </p>

          <form action={saveProfile} className="mt-7 space-y-6">
            <div>
              <label htmlFor="full_name" className="text-sm font-medium text-[#302324]">
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                defaultValue={profile?.full_name ?? ""}
                autoComplete="name"
                required
                className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="text-sm font-medium text-[#302324]">
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile?.phone ?? ""}
                autoComplete="tel"
                required
                className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
                placeholder="Your phone number"
              />
            </div>

            <div>
              <label htmlFor="address" className="text-sm font-medium text-[#302324]">
                Delivery address
              </label>
              <textarea
                id="address"
                name="address"
                defaultValue={profile?.address ?? ""}
                autoComplete="street-address"
                required
                rows={4}
                className="mt-2 w-full resize-y rounded-xl border border-[#E7DDDD] bg-white px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
                placeholder="House number, street, locality, city and state"
              />
            </div>

            <div>
              <label htmlFor="pincode" className="text-sm font-medium text-[#302324]">
                PIN code
              </label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                defaultValue={profile?.pincode ?? ""}
                autoComplete="postal-code"
                required
                className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
                placeholder="6-digit PIN code"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#302324] px-6 py-4 text-sm font-semibold text-white hover:bg-[#211819] sm:w-auto"
            >
              Save Account Details
            </button>
          </form>
        </section>
      )}

      <div className="mt-8">
        <LogoutButton />
      </div>
    </main>
  );
}
