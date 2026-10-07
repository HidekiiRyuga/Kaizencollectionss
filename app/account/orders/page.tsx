import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MyOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, total, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch orders:", error);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 lg:px-12 lg:py-20">
      <Link
        href="/account"
        className="text-sm font-medium text-[#7A6B6D] hover:text-[#302324]"
      >
        ← Back to account
      </Link>

      <div className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
          Account
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
          My Orders
        </h1>

        <p className="mt-4 text-[#7A6B6D]">
          View and manage your orders.
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-[#E7DDDD] bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-[#302324]">
            No orders yet
          </h2>

          <p className="mt-2 text-sm text-[#7A6B6D]">
            Your orders will appear here after you place one.
          </p>

          <Link
            href="/shop"
            className="mt-6 inline-block rounded-full bg-[#302324] px-6 py-3 text-sm font-semibold text-white hover:bg-[#211819]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-2xl border border-[#E7DDDD] bg-white p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[#7A6B6D]">
                    Order
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-[#302324]">
                    #{order.id}
                  </p>

                  <p className="mt-2 text-sm text-[#7A6B6D]">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-6 sm:justify-end">
                  <div>
                    <p className="text-xs text-[#7A6B6D]">Total</p>
                    <p className="mt-1 font-semibold text-[#302324]">
                      ₹{order.total.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#7A6B6D]">Status</p>
                    <span className="mt-1 inline-block rounded-full bg-[#E7DDDD] px-3 py-1 text-xs font-semibold capitalize text-[#302324]">
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}