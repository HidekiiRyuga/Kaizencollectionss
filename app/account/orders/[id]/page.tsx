import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cancelOrder } from "../actions";

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const { data: order, error } = await supabase
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
      created_at,
      cancellation_reason,
      refund_status,
      refund_amount,
      refunded_at,
      status,
      shipping_courier,
      tracking_number,
      payment_status,
      order_items (
        id,
        quantity,
        price,
        products (id, name, image)
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 lg:px-12 lg:py-20">
      <Link
        href="/account/orders"
        className="text-sm font-medium text-[#7A6B6D] hover:text-[#302324]"
      >
        ← Back to orders
      </Link>

      <div className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
          Order Details
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#302324] sm:text-4xl">
          Order #{order.id}
        </h1>

        <p className="mt-3 text-sm text-[#7A6B6D]">
          {new Date(order.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-[#E7DDDD] bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#302324]">
            Order Status
          </h2>

          <span className="rounded-full bg-[#E7DDDD] px-4 py-2 text-sm font-semibold capitalize text-[#302324]">
            {order.status}
          </span>
        </div>
      </div>
      
      {/* Shipment Tracking */}
      <div className="mt-6 rounded-2xl border border-[#E7DDDD] bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[#302324]">
            Shipment Tracking
          </h2>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              order.status === "delivered"
                ? "bg-green-50 text-green-700"
                : order.status === "shipped"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-[#FFF1F2] text-[#7A6B6D]"
            }`}
          >
            {order.status}
          </span>
        </div>

        {order.status === "shipped" || order.status === "delivered" ? (
          order.shipping_courier === "delhivery" &&
          order.tracking_number ? (
            <div className="mt-4">
              <p className="text-sm text-[#7A6B6D]">
                Your order is being handled by Delhivery.
              </p>

              <div className="mt-4 rounded-xl bg-[#FCF9F9] p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[#7A6B6D]">
                  Tracking / AWB Number
                </p>

                <p className="mt-2 break-all font-semibold text-[#302324]">
                  {order.tracking_number}
                </p>
              </div>

              <a
                href="https://www.delhivery.com/tracking"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#302324] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#493638]"
              >
                Track on Delhivery
                <span aria-hidden="true">↗</span>
              </a>

              <p className="mt-3 text-xs leading-5 text-[#7A6B6D]">
                Open Delhivery&apos;s website and enter the AWB number above
                to check your shipment&apos;s latest tracking updates.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#7A6B6D]">
              Your order has been marked as {order.status}, but tracking
              details are not available yet. Please check again later.
            </p>
          )
        ) : order.status === "cancelled" ? (
          <p className="mt-3 text-sm leading-6 text-[#7A6B6D]">
            This order was cancelled, so shipment tracking is not available.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-[#7A6B6D]">
            Your order hasn&apos;t shipped yet. Once it is shipped and the
            tracking details are added, you&apos;ll find your AWB number here.
          </p>
        )}
      </div>


      <div className="mt-6 rounded-2xl border border-[#E7DDDD] bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[#302324]">
            Payment Status
          </h2>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              order.payment_status === "paid"
                ? "bg-green-50 text-green-700"
                : order.payment_status === "rejected"
                  ? "bg-red-50 text-red-700"
                  : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {order.payment_status}
          </span>
        </div>
      </div>

      {/* Payment verification pending */}
      {order.payment_status === "pending" && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-semibold text-amber-900">
            Payment verification pending
          </h3>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            If you&apos;ve completed your UPI payment, please wait while we
            verify the transaction. Your order will be confirmed once
            we&apos;ve verified that the payment was received. You don&apos;t need
            to pay again while verification is pending.
          </p>
        </div>
      )}

      {/* Payment rejected */}
      {order.payment_status === "rejected" && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-semibold text-red-900">
            Payment could not be verified
          </h3>
          <p className="mt-2 text-sm leading-6 text-red-800">
            Your payment could not be verified, so your order has been
            cancelled. If you believe this is a mistake, please contact us.
          </p>
        </div>
      )}

      {/* Cancellation reason */}
      {order.status === "cancelled" && order.cancellation_reason && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="font-semibold text-gray-900">
            Cancellation details
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            {order.cancellation_reason}
          </p>
        </div>
      )}

      {/* Refund pending */}
      {order.refund_status === "pending" && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-semibold text-amber-900">
            Refund pending
          </h3>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Your order has been cancelled and your refund is awaiting
            processing. We&apos;ll update the status once the refund has been sent.
          </p>
          {order.refund_amount != null && (
            <p className="mt-2 text-sm font-medium text-amber-900">
              Refund amount: ₹{order.refund_amount}
            </p>
          )}
        </div>
      )}

      {/* Refund processed */}
      {order.refund_status === "processed" && (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-5">
          <h3 className="font-semibold text-green-900">
            Refund processed
          </h3>
          <p className="mt-2 text-sm leading-6 text-green-800">
            Your refund has been marked as processed. Please allow time
            for the amount to appear in your account.
          </p>
          {order.refund_amount != null && (
            <p className="mt-2 text-sm font-medium text-green-900">
              Refund amount: ₹{order.refund_amount}
            </p>
          )}
          {order.refunded_at && (
            <p className="mt-1 text-xs text-green-800">
              Processed on:{" "}
              {new Date(order.refunded_at).toLocaleDateString("en-IN")}
            </p>
          )}
        </div>
      )}
            {(order.status === "pending" || order.status === "confirmed") && (
        <div className="mt-6 rounded-2xl border border-[#E7DDDD] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#302324]">
            Cancel Order
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#7A6B6D]">
            You can cancel this order while it has not been shipped yet.
          </p>

          <form action={cancelOrder} className="mt-5">
            <input type="hidden" name="orderId" value={order.id} />

            <button
              type="submit"
              className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Cancel Order
            </button>
          </form>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-[#E7DDDD] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#302324]">
          Items
        </h2>

        <div className="mt-6 divide-y divide-[#E7DDDD]">
          {order.order_items.map((item) => {
            const product = Array.isArray(item.products)
              ? item.products[0]
              : item.products;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 py-5"
              >
                <div>
                  <p className="font-medium text-[#302324]">
                    {product?.name ?? "Product"}
                  </p>

                  <p className="mt-1 text-sm text-[#7A6B6D]">
                    ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                  </p>
                </div>

                <p className="font-semibold text-[#302324]">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#E7DDDD] pt-5">
          <p className="font-semibold text-[#302324]">
            Total
          </p>

          <p className="text-lg font-bold text-[#302324]">
            ₹{order.total.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#E7DDDD] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#302324]">
          Delivery Details
        </h2>

        <div className="mt-5 space-y-3 text-sm">
          <div>
            <p className="text-[#7A6B6D]">Name</p>
            <p className="mt-1 font-medium text-[#302324]">
              {order.customer_name}
            </p>
          </div>

          <div>
            <p className="text-[#7A6B6D]">Phone</p>
            <p className="mt-1 font-medium text-[#302324]">
              {order.phone}
            </p>
          </div>

          <div>
            <p className="text-[#7A6B6D]">Address</p>
            <p className="mt-1 whitespace-pre-line font-medium text-[#302324]">
              {order.address}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}