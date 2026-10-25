
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";

interface CheckoutDetails {
  customerName: string;
  phone: string;
  address: string;
}

interface SummaryItem {
  productId: string;
  name: string;
  mrp: number;
  price: number;
  quantity: number;
  originalLineTotal: number;
  lineTotal: number;
  productSavings: number;
  discountPercent: number;
}

interface CheckoutSummary {
  items: SummaryItem[];
  originalSubtotal: number;
  subtotal: number;
  productSavings: number;
  deliveryFee: number;
  deliveryFeeListPrice: number;
  deliverySavings: number;
  freeDeliveryApplied: boolean;
  deliveryMessage: string | null;
  totalSavings: number;
  total: number;
}

const formatPrice = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;

const inputClasses =
  "mt-2 w-full rounded-xl border border-[#D9CACA] bg-white px-4 py-3.5 text-base font-medium text-[#302324] outline-none transition-colors placeholder:font-normal placeholder:text-[#827477] hover:border-[#BBA9AB] focus:border-[#302324] focus:ring-2 focus:ring-[#302324]/10";

export default function PaymentPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const [details, setDetails] = useState<CheckoutDetails | null>(null);
  const [detailsChecked, setDetailsChecked] = useState(false);
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [paymentUtr, setPaymentUtr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedDetails = sessionStorage.getItem(
      "kaizen-checkout-details"
    );

    if (!savedDetails) {
      router.replace("/checkout");
      return;
    }

    try {
      setDetails(JSON.parse(savedDetails) as CheckoutDetails);
      setDetailsChecked(true);
    } catch {
      sessionStorage.removeItem("kaizen-checkout-details");
      router.replace("/checkout");
    }
  }, [router]);

  const loadSummary = useCallback(async () => {
    if (cart.length === 0) {
      setSummary(null);
      setSummaryError("");
      setSummaryLoading(false);
      return;
    }

    setSummaryLoading(true);
    setSummaryError("");
    setSummary(null);

    try {
      const response = await fetch("/api/checkout/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not load the order summary."
        );
      }

      setSummary(data as CheckoutSummary);
    } catch (error) {
      setSummaryError(
        error instanceof Error
          ? error.message
          : "Could not load the order summary."
      );
    } finally {
      setSummaryLoading(false);
    }
  }, [cart]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary, retryCount]);

  if (cart.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-[1500px] items-center justify-center px-6 py-20 sm:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
            Your cart is empty
          </h1>

          <p className="mt-4 font-medium leading-7 text-[#625456]">
            There&apos;s nothing to pay for just yet.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-[#302324] px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-[#211819]"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  if (!detailsChecked || !details) {
    return (
      <main className="mx-auto flex min-h-[60vh] items-center justify-center px-6 sm:px-8">
        <p className="text-sm font-semibold text-[#625456]">
          Loading payment details...
        </p>
      </main>
    );
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!summary || summaryLoading || summaryError) {
      setError("Please load your current order summary before continuing.");
      return;
    }

    if (paymentUtr.trim().length < 6) {
      setError("Please enter a valid transaction reference of at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: details.customerName,
          phone: details.phone,
          address: details.address,
          paymentUtr: paymentUtr.trim(),
          expectedTotal: summary.total,
          expectedSubtotal: summary.subtotal,
          expectedDeliveryFee: summary.deliveryFee,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      sessionStorage.removeItem("kaizen-checkout-details");
      clearCart();
      router.push(`/order-success?id=${data.orderId}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20 xl:px-16">
      <div className="mb-10 sm:mb-12">
        <Link
          href="/checkout"
          className="text-sm font-semibold text-[#625456] transition-colors hover:text-[#302324]"
        >
          ← Back to delivery details
        </Link>

        <p className="mt-9 text-sm font-bold uppercase tracking-[0.2em] text-[#B86F79]">
          Payment
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
          Complete your payment
        </h1>

        <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-[#625456]">
          Review your total, pay using UPI, and enter your transaction
          reference to submit your order.
        </p>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-20">
        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="rounded-3xl border border-[#E0D3D3] bg-[#FCF9F9] p-6 sm:p-8">
            <div className="text-center">
              <p className="text-sm font-bold text-[#625456]">
                Amount to pay
              </p>

              {summaryLoading ? (
                <p className="mt-3 text-sm font-medium text-[#625456]">
                  Calculating your total...
                </p>
              ) : summary ? (
                <p className="mt-2 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
                  {formatPrice(summary.total)}
                </p>
              ) : (
                <p className="mt-3 text-sm font-semibold text-red-800">
                  Amount unavailable
                </p>
              )}

              <p className="mt-3 text-sm font-medium text-[#625456]">
                Please pay the exact amount shown above.
              </p>
            </div>

            <div className="mx-auto mt-8 w-fit rounded-2xl border border-[#E7DDDD] bg-white p-3 sm:p-4">
              <Image
                src="/payment/upi-qr.jpg"
                alt="UPI payment QR code"
                width={280}
                height={280}
                className="h-auto w-[220px] sm:w-[280px]"
                priority
              />
            </div>

            <div className="mt-7 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#625456]">
                UPI ID
              </p>

              <p className="mt-2 break-all text-lg font-bold text-[#302324] sm:text-xl">
                jnishaera@okicici
              </p>

              <p className="mt-3 text-sm font-medium leading-6 text-[#625456]">
                Scan the QR code using your UPI app, or pay directly
                to the UPI ID above.
              </p>
            </div>
          </div>

          {summaryError && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium leading-6 text-red-800">
                {summaryError}
              </p>

              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-3 text-sm font-bold text-[#302324] underline underline-offset-4"
              >
                Retry loading summary
              </button>
            </div>
          )}

          <div className="mt-8">
            <label
              htmlFor="paymentUtr"
              className="text-sm font-bold text-[#302324]"
            >
              UPI Transaction ID / UTR
            </label>

            <input
              id="paymentUtr"
              type="text"
              value={paymentUtr}
              onChange={(event) => setPaymentUtr(event.target.value)}
              required
              minLength={6}
              maxLength={100}
              autoComplete="off"
              className={inputClasses}
              placeholder="Enter your transaction reference"
            />

            <p className="mt-2 text-sm font-medium leading-6 text-[#625456]">
              You can find this reference in the payment details of
              your UPI app after completing the transaction.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-800"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              summaryLoading ||
              !summary ||
              !!summaryError
            }
            className="mt-7 w-full rounded-full bg-[#302324] px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#211819] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#302324] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Submitting Order..."
              : "I've Paid — Place Order"}
          </button>

          <p className="mt-4 text-center text-sm font-medium leading-6 text-[#625456]">
            Your payment will be manually verified before your order
            is confirmed.
          </p>
        </form>

        <aside className="h-fit rounded-3xl border border-[#E0D3D3] bg-[#F1E8E8] p-6 sm:p-8 lg:sticky lg:top-8">
          <h2 className="text-xl font-bold text-[#302324]">
            Order Summary
          </h2>

          {summaryLoading && (
            <p className="mt-6 text-sm font-medium leading-6 text-[#625456]">
              Calculating current prices and delivery...
            </p>
          )}

          {summaryError && !summaryLoading && (
            <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium leading-6 text-red-800">
              {summaryError}
            </p>
          )}

          {summary && !summaryLoading && (
            <>
              <div className="mt-6 space-y-5">
                {summary.items.map((item) => (
                  <div
                    key={item.productId}
                    className="border-b border-[#302324]/15 pb-4"
                  >
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-5 text-[#302324]">
                          {item.name}
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#625456]">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-bold text-[#302324]">
                        {formatPrice(item.lineTotal)}
                      </p>
                    </div>

                    {item.mrp > item.price && (
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className="font-semibold text-[#625456]">
                          MRP
                        </span>

                        <span className="font-medium text-[#625456] line-through">
                          {formatPrice(item.mrp * item.quantity)}
                        </span>

                        <span className="font-bold text-green-900">
                          Save {formatPrice(item.productSavings)}
                        </span>

                        <span className="rounded-full bg-green-100 px-2 py-1 font-bold text-green-900">
                          {item.discountPercent}% off
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="my-6 h-px bg-[#302324]/20" />

              <div className="space-y-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="font-semibold text-[#625456]">
                    Original product total
                  </span>

                  <span className="shrink-0 font-medium text-[#625456] line-through">
                    {formatPrice(summary.originalSubtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="font-semibold text-[#625456]">
                    Product subtotal
                  </span>

                  <span className="shrink-0 font-bold text-[#302324]">
                    {formatPrice(summary.subtotal)}
                  </span>
                </div>

                {summary.productSavings > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold text-[#625456]">
                      Product discounts
                    </span>

                    <span className="shrink-0 font-bold text-green-900">
                      −{formatPrice(summary.productSavings)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-3">
                  <span className="font-semibold text-[#625456]">
                    Delivery
                  </span>

                  <div className="flex flex-wrap justify-end gap-x-2 gap-y-1">
                    {summary.freeDeliveryApplied && (
                      <span className="font-medium text-[#625456] line-through">
                        {formatPrice(summary.deliveryFeeListPrice)}
                      </span>
                    )}

                    <span
                      className={
                        summary.freeDeliveryApplied
                          ? "font-bold text-green-900"
                          : "font-bold text-[#302324]"
                      }
                    >
                      {summary.freeDeliveryApplied
                        ? "FREE"
                        : formatPrice(summary.deliveryFee)}
                    </span>
                  </div>
                </div>

                {summary.deliverySavings > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold text-[#625456]">
                      Delivery savings
                    </span>

                    <span className="shrink-0 font-bold text-green-900">
                      −{formatPrice(summary.deliverySavings)}
                    </span>
                  </div>
                )}
              </div>

              {summary.freeDeliveryApplied && summary.deliveryMessage && (
                <div className="mt-5 rounded-2xl border border-[#E7DDDD] bg-white/80 p-4">
                  <p className="text-sm font-semibold leading-6 text-[#87384F]">
                    {summary.deliveryMessage}
                  </p>
                </div>
              )}

              <div className="my-6 h-px bg-[#302324]/20" />

              <div className="flex justify-between gap-3">
                <span className="font-bold text-[#302324]">
                  Total savings
                </span>

                <span className="shrink-0 font-bold text-green-900">
                  {formatPrice(summary.totalSavings)}
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="font-bold text-[#302324]">
                  Amount to pay
                </span>

                <span className="shrink-0 text-xl font-bold text-[#302324]">
                  {formatPrice(summary.total)}
                </span>
              </div>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
