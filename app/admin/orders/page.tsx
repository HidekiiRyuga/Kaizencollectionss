
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CopyOrderIdButton from "./CopyOrderIdButton";

import {
  confirmPayment,
  updateOrderStatus,
  rejectPayment,
  markRefundProcessed,
  updateOrderTracking,
} from "./actions";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: pageError } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    redirect("/");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
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
      cancellation_reason,
      refund_status,
      refund_amount,
      refunded_at,
      shipping_courier,
      tracking_number,
      order_items (
        quantity,
        price,
        products (
          name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load orders:", error);

    return (
      <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-12 lg:py-16">
        <p className="text-red-600">Failed to load orders.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-12 lg:py-16 xl:px-16">
      <div>
        <Link
          href="/admin"
          className="text-sm font-medium text-[#7A6B6D] hover:text-[#302324]"
        >
          ← Back to dashboard
        </Link>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
          Admin
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
          Orders
        </h1>

        <p className="mt-3 text-[#7A6B6D]">
          View and manage customer orders.
        </p>

        {pageError === "payment_required" && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
          >
            Please verify the payment first using the{" "}
            <strong>Verify Payment</strong> button before confirming,
            shipping, or delivering this order.
          </div>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-[#E7DDDD] px-6 py-12 text-center">
            <p className="text-[#7A6B6D]">No orders yet.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-[#E7DDDD] bg-white p-4 sm:p-5"
            >
              {/* Order ID */}
              <div className="mb-4 rounded-xl bg-[#FCF9F9] p-3 sm:p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                  Order ID
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <code className="break-all text-sm font-semibold text-[#302324]">
                    {order.id}
                  </code>

                  <CopyOrderIdButton orderId={order.id} />
                </div>
              </div>

              {/* Status and status actions */}
              <div className="flex flex-col gap-3 border-b border-[#E7DDDD] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                      order.status === "cancelled"
                        ? "bg-red-50 text-red-700"
                        : order.status === "delivered"
                          ? "bg-green-50 text-green-700"
                          : order.status === "shipped"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-[#FCF9F9] text-[#302324]"
                    }`}
                  >
                    {order.status}
                  </span>

                  {order.status === "cancelled" && (
                    <p className="text-sm text-red-700">
                      {order.cancellation_reason ||
                        "Order cancelled by customer."}
                    </p>
                  )}

                  {order.status === "delivered" && (
                    <span className="text-xs text-[#7A6B6D]">
                      No further action required
                    </span>
                  )}
                </div>

                {["pending", "confirmed", "shipped"].includes(
                  order.status
                ) && (
                  <form
                    action={updateOrderStatus}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input
                      type="hidden"
                      name="orderId"
                      value={order.id}
                    />

                    <select
                      name="status"
                      defaultValue={
                        order.status === "pending"
                          ? "confirmed"
                          : order.status === "confirmed"
                            ? "shipped"
                            : "delivered"
                      }
                      className="rounded-full border border-[#E7DDDD] bg-white px-3 py-2 text-xs font-semibold text-[#302324] outline-none focus:border-[#E1ACB0]"
                    >
                      {order.status === "pending" && (
                        <option value="confirmed">
                          Confirm order
                        </option>
                      )}

                      {order.status === "confirmed" && (
                        <option value="shipped">
                          Mark as shipped
                        </option>
                      )}

                      {order.status === "shipped" && (
                        <option value="delivered">
                          Mark as delivered
                        </option>
                      )}
                    </select>

                    <button
                      type="submit"
                      className="rounded-full bg-[#302324] px-4 py-2 text-xs font-semibold text-white hover:bg-[#211819]"
                    >
                      Update status
                    </button>
                  </form>
                )}
              </div>

              {/* Shipment tracking */}
              {["shipped", "delivered"].includes(order.status) && (
                <div className="mt-4 rounded-xl bg-[#FCF9F9] p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                        Shipment Tracking
                      </p>

                      {order.tracking_number ? (
                        <>
                          <p className="mt-2 text-xs text-[#7A6B6D]">
                            Courier:{" "}
                            <span className="font-medium text-[#302324]">
                              {order.shipping_courier || "Not specified"}
                            </span>
                          </p>

                          <p className="mt-1 break-all font-mono text-sm font-semibold text-[#302324]">
                            {order.tracking_number}
                          </p>

                          {order.shipping_courier === "delhivery" && (
                            <a
                              href="https://www.delhivery.com/tracking"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-sm font-medium text-[#302324] underline underline-offset-4 hover:text-[#7A6B6D]"
                            >
                              Open Delhivery tracking ↗
                            </a>
                          )}
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-[#7A6B6D]">
                          No tracking number saved yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <form
                    action={updateOrderTracking}
                    className="mt-4 flex flex-col gap-3 border-t border-[#E7DDDD] pt-4"
                  >
                    <input
                      type="hidden"
                      name="orderId"
                      value={order.id}
                    />

                    <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-4">
                      <label
                        htmlFor={`courier-${order.id}`}
                        className="text-sm font-medium text-[#302324]"
                      >
                        Courier
                      </label>

                      <select
                        id={`courier-${order.id}`}
                        name="shipping_courier"
                        defaultValue={
                          order.shipping_courier || "delhivery"
                        }
                        required
                        className="w-full rounded-xl border border-[#E7DDDD] bg-white px-3 py-2.5 text-sm text-[#302324] outline-none focus:border-[#E1ACB0] sm:max-w-xs"
                      >
                        <option value="delhivery">Delhivery</option>
                      </select>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-4">
                      <label
                        htmlFor={`tracking-${order.id}`}
                        className="text-sm font-medium text-[#302324]"
                      >
                        AWB / Tracking number
                      </label>

                      <input
                        id={`tracking-${order.id}`}
                        name="tracking_number"
                        type="text"
                        defaultValue={order.tracking_number || ""}
                        placeholder="Enter AWB number"
                        minLength={5}
                        maxLength={100}
                        pattern="[a-zA-Z0-9-]+"
                        title="Enter a tracking number using letters, numbers, or hyphens."
                        autoComplete="off"
                        required
                        className="w-full rounded-xl border border-[#E7DDDD] bg-white px-3 py-2.5 text-sm text-[#302324] outline-none placeholder:text-[#7A6B6D] focus:border-[#E1ACB0] sm:max-w-md"
                      />
                    </div>

                    <div className="sm:pl-[156px]">
                      <button
                        type="submit"
                        className="rounded-full bg-[#302324] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#211819]"
                      >
                        {order.tracking_number
                          ? "Update tracking details"
                          : "Save tracking details"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Payment */}
              <div className="mt-4 grid gap-4 border-t border-[#E7DDDD] pt-4 sm:grid-cols-3 sm:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                    Payment
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
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

                  {order.paid_at && (
                    <p className="mt-1 text-xs text-[#7A6B6D]">
                      Paid on{" "}
                      {new Date(order.paid_at).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                    Customer UTR
                  </p>

                  <p className="mt-2 inline-block max-w-full break-all rounded-lg border border-[#E7DDDD] bg-[#FCF9F9] px-3 py-2 font-mono text-sm text-[#302324]">
                    {order.payment_utr || "No UTR submitted"}
                  </p>
                </div>

                {/* Independent payment actions */}
                <div className="flex flex-wrap gap-2 sm:justify-start">
                  {order.payment_status === "pending" && (
                    <>
                      <form action={confirmPayment}>
                        <input
                          type="hidden"
                          name="orderId"
                          value={order.id}
                        />

                        <button
                          type="submit"
                          className="rounded-full bg-[#302324] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#211819]"
                        >
                          Verify Payment
                        </button>
                      </form>

                      <form action={rejectPayment}>
                        <input
                          type="hidden"
                          name="orderId"
                          value={order.id}
                        />

                        <button
                          type="submit"
                          className="rounded-full border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Reject Payment
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>

              {/* Refund */}
              {order.status === "cancelled" && (
                <div className="mt-4 rounded-xl border border-[#E7DDDD] bg-[#FCF9F9] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                    Refund
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#302324]">
                    <p>
                      Status:{" "}
                      <span className="font-semibold capitalize">
                        {(order.refund_status || "not_applicable").replace(
                          "_",
                          " "
                        )}
                      </span>
                    </p>

                    {order.refund_amount !== null && (
                      <p>
                        Amount:{" "}
                        <span className="font-semibold">
                          ₹{order.refund_amount.toLocaleString("en-IN")}
                        </span>
                      </p>
                    )}

                    {order.refunded_at && (
                      <p className="text-[#7A6B6D]">
                        Processed on:{" "}
                        {new Date(order.refunded_at).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>

                  {order.payment_status === "paid" &&
                    order.refund_status === "pending" && (
                      <form action={markRefundProcessed} className="mt-3">
                        <input
                          type="hidden"
                          name="orderId"
                          value={order.id}
                        />

                        <button
                          type="submit"
                          className="rounded-full bg-[#302324] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#211819]"
                        >
                          Mark Refund Processed
                        </button>

                        <p className="mt-2 text-xs leading-5 text-[#7A6B6D]">
                          Use this only after you have actually sent the refund.
                        </p>
                      </form>
                    )}
                </div>
              )}

              {/* Customer / Address / Total */}
              <div className="mt-4 grid gap-4 border-t border-[#E7DDDD] pt-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)_minmax(0,0.6fr)]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                    Customer
                  </p>

                  <p className="mt-1 font-medium text-[#302324]">
                    {order.customer_name}
                  </p>

                  <p className="mt-1 break-all text-sm text-[#7A6B6D]">
                    {order.phone}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                    Delivery Address
                  </p>

                  <p className="mt-1 text-sm leading-5 text-[#302324]">
                    {order.address}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                    Total
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#302324]">
                    ₹{order.total.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="mt-4 border-t border-[#E7DDDD] pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                  Items
                </p>

                <div className="mt-2 space-y-1.5">
                  {order.order_items.map((item, index) => (
                    <div
                      key={`${order.id}-${index}`}
                      className="flex items-start justify-between gap-4 text-sm"
                    >
                      <span className="text-[#302324]">
                        {item.products?.[0]?.name ?? "Product"} ×{" "}
                        {item.quantity}
                      </span>

                      <span className="shrink-0 font-medium text-[#302324]">
                        ₹
                        {(item.price * item.quantity).toLocaleString("en-IN")}
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
