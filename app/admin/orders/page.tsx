import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import {
  confirmPayment,
  updateOrderStatus,
} from "./actions";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        customer_name,
        phone,
        address,
        total,
        status,
        payment_status,
        payment_utr,
        paid_at,
        created_at,
        order_items (
          quantity,
          price,
          products (
            name
          )
        )
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load orders:", error);

    return (
      <main className="mx-auto max-w-[1500px] px-8 py-16 lg:px-12 xl:px-16">
        <p className="text-red-600">Failed to load orders.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1500px] px-8 py-16 lg:px-12 lg:py-20 xl:px-16">
      <div>
        <Link
          href="/admin"
          className="text-sm font-medium text-[#7A6B6D] hover:text-[#302324]"
        >
          ← Back to dashboard
        </Link>

        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
          Admin
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
          Orders
        </h1>

        <p className="mt-4 text-[#7A6B6D]">
          View and manage customer orders.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-[#E7DDDD] px-6 py-16 text-center">
            <p className="text-[#7A6B6D]">No orders yet.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-[#E7DDDD] p-6"
            >
              {/* Header */}
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                    Order
                  </p>

                  <p className="mt-1 break-all font-mono text-sm text-[#302324]">
                    {order.id}
                  </p>

                  <p className="mt-3 text-sm text-[#7A6B6D]">
                    {new Date(order.created_at).toLocaleString("en-IN")}
                  </p>
                </div>

                <form action={updateOrderStatus}>
                  <input
                    type="hidden"
                    name="orderId"
                    value={order.id}
                  />

                  <select
                    name="status"
                    defaultValue={order.status}
                    className="rounded-full border border-[#E7DDDD] bg-white px-4 py-2 text-xs font-semibold capitalize text-[#302324] outline-none focus:border-[#E1ACB0]"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    type="submit"
                    className="ml-2 text-xs font-semibold text-[#302324] hover:underline"
                  >
                    Update
                  </button>
                </form>
              </div>

              {/* Payment */}
              <div className="mt-6 rounded-2xl bg-[#FCF9F9] p-5">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                      Payment
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          order.payment_status === "paid"
                            ? "bg-green-500"
                            : order.payment_status === "rejected"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        }`}
                      />

                      <span className="text-sm font-semibold capitalize text-[#302324]">
                        {order.payment_status}
                      </span>
                    </div>
                  </div>

                  {order.payment_status === "pending" && (
                    <form action={confirmPayment}>
                      <input
                        type="hidden"
                        name="orderId"
                        value={order.id}
                      />

                      <button
                        type="submit"
                        className="rounded-full bg-[#302324] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#211819]"
                      >
                        Confirm Payment
                      </button>
                    </form>
                  )}
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                      UPI Transaction ID / UTR
                    </p>

                    <p className="mt-2 break-all font-mono text-sm text-[#302324]">
                      {order.payment_utr || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                      Payment Confirmed
                    </p>

                    <p className="mt-2 text-sm text-[#302324]">
                      {order.paid_at
                        ? new Date(order.paid_at).toLocaleString("en-IN")
                        : "Not confirmed yet"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer / Address / Total */}
              <div className="mt-6 grid gap-6 border-t border-[#E7DDDD] pt-6 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                    Customer
                  </p>

                  <p className="mt-2 font-medium text-[#302324]">
                    {order.customer_name}
                  </p>

                  <p className="mt-1 text-sm text-[#7A6B6D]">
                    {order.phone}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                    Delivery Address
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#302324]">
                    {order.address}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                    Total
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#302324]">
                    ₹{order.total.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="mt-6 border-t border-[#E7DDDD] pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                  Items
                </p>

                <div className="mt-3 space-y-2">
                  {order.order_items.map((item, index) => (
                    <div
                      key={`${order.id}-${index}`}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <span className="text-[#302324]">
                        {item.products?.[0]?.name ?? "Product"} ×{" "}
                        {item.quantity}
                      </span>

                      <span className="font-medium text-[#302324]">
                        ₹
                        {(item.price * item.quantity).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}