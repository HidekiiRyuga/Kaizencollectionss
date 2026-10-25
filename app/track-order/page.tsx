"use client";

import { FormEvent, useState } from "react";

type TrackedOrder = {
  order_id: string;
  status: string;
  created_at: string | null;
  shipping_courier: string | null;
  tracking_number: string | null;
};

const DELHIVERY_TRACKING_URL = "https://www.delhivery.com/tracking";

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(date: string | null) {
  if (!date) return "Unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setOrder(null);
    setLoading(true);

    try {
      const response = await fetch("/api/track-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId.trim(),
          phone: phone.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Unable to find your order. Please try again."
        );
        return;
      }

      setOrder(result.order);
    } catch {
      setError("Unable to connect. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  const hasShipped =
    order?.status === "shipped" || order?.status === "delivered";

  return (
    <main className="min-h-screen bg-[#FFF8F8] px-4 py-12 text-[#302324] sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#C46C83]">
            KaizenCollectionss
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Track your order
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756467] sm:text-base">
            Your anime goodies are special to us. Enter your order details
            below to check their journey.
          </p>
        </div>

        <section className="rounded-3xl border border-[#F1DDE1] bg-white p-5 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="orderId"
                className="mb-2 block text-sm font-medium"
              >
                Order ID
              </label>

              <input
                id="orderId"
                name="orderId"
                type="text"
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                placeholder="Enter your order ID"
                required
                maxLength={36}
                autoComplete="off"
                className="w-full rounded-xl border border-[#E8D8DC] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C46C83] focus:ring-2 focus:ring-[#F8E2E8]"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium"
              >
                Phone number used for the order
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter your phone number"
                required
                maxLength={20}
                autoComplete="tel"
                className="w-full rounded-xl border border-[#E8D8DC] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C46C83] focus:ring-2 focus:ring-[#F8E2E8]"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#302324] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#493437] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking your order..." : "Track order"}
            </button>
          </form>
        </section>

        {order && (
          <section
            aria-live="polite"
            className="mt-6 rounded-3xl border border-[#F1DDE1] bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[#756467]">Order ID</p>
                <p className="mt-1 break-all text-sm font-semibold">
                  {order.order_id}
                </p>
              </div>

              <span className="rounded-full bg-[#FFF0F3] px-3 py-1.5 text-xs font-semibold text-[#A64E68]">
                {formatStatus(order.status)}
              </span>
            </div>

            <div className="mt-6 border-t border-[#F1E5E7] pt-5">
              <p className="text-sm text-[#756467]">Order placed</p>
              <p className="mt-1 text-sm font-medium">
                {formatDate(order.created_at)}
              </p>
            </div>

            {order.status === "pending" && (
              <p className="mt-5 rounded-xl bg-[#FFF8E9] p-4 text-sm leading-6 text-[#795C2B]">
                Your order is awaiting confirmation. Please check again later
                for updates.
              </p>
            )}

            {order.status === "confirmed" && (
              <p className="mt-5 rounded-xl bg-[#F7F2FF] p-4 text-sm leading-6 text-[#655080]">
                Your order is confirmed and is being prepared. Tracking details
                will appear here once it has been shipped.
              </p>
            )}

            {order.status === "cancelled" && (
              <p className="mt-5 rounded-xl bg-[#FFF0F0] p-4 text-sm leading-6 text-[#9B3D3D]">
                This order has been cancelled. Please contact us if you need
                help.
              </p>
            )}

            {hasShipped && (
              <div className="mt-6 rounded-2xl bg-[#FFF8F8] p-5">
                <h2 className="text-lg font-semibold">
                  {order.status === "delivered"
                    ? "Your order has been delivered"
                    : "Your order is on its way"}
                </h2>

                {order.shipping_courier && order.tracking_number ? (
                  <>
                    <div className="mt-4">
                      <p className="text-sm text-[#756467]">Courier</p>
                      <p className="mt-1 text-sm font-medium">
                        {order.shipping_courier === "delhivery"
                          ? "Delhivery"
                          : order.shipping_courier}
                      </p>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-[#756467]">Tracking number</p>
                      <p className="mt-1 break-all text-sm font-semibold">
                        {order.tracking_number}
                      </p>
                    </div>

                    {order.shipping_courier === "delhivery" && (
                      <a
                        href={DELHIVERY_TRACKING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#302324] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#493437]"
                      >
                        Track on Delhivery
                        <span className="ml-2" aria-hidden="true">
                          ↗
                        </span>
                      </a>
                    )}
                  </>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-[#756467]">
                    {order.status === "delivered"
                      ? "Your order is marked as delivered."
                      : "Your order has shipped. Tracking details will appear here once they have been added."}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        <p className="mt-6 text-center text-xs leading-5 text-[#8B777B]">
          Keep your order ID handy. If you need help, contact the KaizenCollectionss
          team.
        </p>
      </div>
    </main>
  );
}
