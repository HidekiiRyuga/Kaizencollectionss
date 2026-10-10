import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 lg:px-12 lg:py-20">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
          Account
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
          My Account
        </h1>

        <p className="mt-4 text-[#7A6B6D]">
          Manage your account and keep track of your orders.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
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

      <div className="mt-8">
        <LogoutButton />
      </div>
    </main>
  );
}