import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LogoutButton from "./logout-button";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto max-w-[1500px] px-8 py-16 lg:px-12 lg:py-20 xl:px-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
            Admin
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
            Dashboard
          </h1>
        </div>

        <LogoutButton />
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
          KaizenCollectionss
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
          Admin
        </h1>

        <p className="mt-4 text-[#7A6B6D]">
          Welcome back, {user.email}.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <Link
        href="/admin/products"
        className="rounded-2xl border border-[#E7DDDD] p-6 hover:bg-[#FCF9F9]"
        >
        <p className="text-sm text-[#7A6B6D]">
            Products
        </p>

        <p className="mt-2 text-3xl font-bold text-[#302324]">
            Manage
        </p>

        <p className="mt-4 text-sm text-[#7A6B6D]">
            Add, edit, and manage store products →
        </p>
        </Link>

        <Link
          href="/admin/orders"
          className="rounded-2xl border border-[#E7DDDD] p-6 hover:bg-[#FCF9F9]"
        >
          <p className="text-sm text-[#7A6B6D]">Orders</p>

          <p className="mt-2 text-3xl font-bold text-[#302324]">
            View
          </p>

          <p className="mt-4 text-sm text-[#7A6B6D]">
            View and manage customer orders →
          </p>
        </Link>
      </div>
    </main>
  );
}