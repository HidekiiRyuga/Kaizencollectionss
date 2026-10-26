"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";

type CheckoutProfile = {
  full_name: string | null;
  phone: string | null;
  address: string | null;
  pincode: string | null;
};

type CheckoutFormProps = {
  initialProfile: CheckoutProfile | null;
  initialEmail: string;
};

type SummaryItem = {
  productId: string;
  name: string;
  mrp: number;
  price: number;
  quantity: number;
  originalLineTotal: number;
  lineTotal: number;
  productSavings: number;
  discountPercent: number;
};

type CheckoutSummary = {
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
};

const formatPrice = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;

const inputClasses =
  "mt-2 w-full rounded-xl border border-[#D9CACA] bg-white px-4 py-3.5 text-base font-medium text-[#302324] outline-none transition-colors placeholder:font-normal placeholder:text-[#827477] hover:border-[#BBA9AB] focus:border-[#302324] focus:ring-2 focus:ring-[#302324]/10";

const labelClasses = "text-sm font-bold text-[#302324]";

export default function CheckoutForm({
  initialProfile,
  initialEmail,
}: CheckoutFormProps) {
  const router = useRouter();
  const { cart } = useCart();

  const [customerName, setCustomerName] = useState(
    initialProfile?.full_name ?? ""
  );
  const [phone, setPhone] = useState(initialProfile?.phone ?? "");
  const [address, setAddress] = useState(initialProfile?.address ?? "");
  const [pincode, setPincode] = useState(initialProfile?.pincode ?? "");

  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
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

        if (active) {
          setSummary(data as CheckoutSummary);
        }
      } catch (error) {
        if (active) {
          setSummaryError(
            error instanceof Error
              ? error.message
              : "Could not load the order summary."
          );
        }
      } finally {
        if (active) {
          setSummaryLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      active = false;
    };
  }, [cart, retryCount]);

  if (cart.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-[1500px] items-center justify-center px-6 py-20 sm:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
            Your cart is empty
          </h1>

          <p className="mt-4 font-medium leading-7 text-[#625456]">
            Add something to your cart before checking out.
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

  const handleProceedToPay = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!summary || summaryLoading || summaryError) {
      return;
    }

    const deliveryAddress =
      `${address.trim()}, PIN code: ${pincode.trim()}`;

    sessionStorage.setItem(
      "kaizen-checkout-details",
      JSON.stringify({
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: deliveryAddress,
        pincode: pincode.trim(),
        email: email.trim(),
      })
    );

    router.push("/checkout/payment");
  };

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20 xl:px-16">
      <div className="mb-10 sm:mb-12">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#B86F79]">
          Checkout
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
          Delivery details
        </h1>

        <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-[#625456]">
          Enter your delivery information before proceeding to payment.
        </p>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-20">
        <form
          onSubmit={handleProceedToPay}
          className="max-w-2xl space-y-6 sm:space-y-7"
        >
          <div>
            <label htmlFor="name" className={labelClasses}>
              Full name
            </label>

            <input
              id="name"
              type="text"
              autoComplete="name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              required
              maxLength={100}
              className={inputClasses}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClasses}>
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={254}
              className={inputClasses}
              placeholder="Enter your email address"
            />

            <p className="mt-2 text-sm font-medium leading-5 text-[#625456]">
              We'll send your order confirmation and delivery updates here.
            </p>
          </div>

          <div>
            <label htmlFor="phone" className={labelClasses}>
              Phone number
            </label>

            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              maxLength={15}
              className={inputClasses}
              placeholder="Enter your contact number"
            />

            <p className="mt-2 text-sm font-medium leading-5 text-[#625456]">
              We&apos;ll use this number for delivery-related updates.
            </p>
          </div>

          <div>
            <label htmlFor="address" className={labelClasses}>
              Delivery address
            </label>

            <textarea
              id="address"
              autoComplete="street-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              required
              rows={4}
              maxLength={500}
              className={`${inputClasses} resize-y`}
              placeholder="House number, street, locality, city and state"
            />
          </div>

          <div>
            <label htmlFor="pincode" className={labelClasses}>
              PIN code
            </label>

            <input
              id="pincode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={pincode}
              onChange={(event) =>
                setPincode(
                  event.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              required
              className={inputClasses}
              placeholder="Enter your 6-digit PIN code"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!summary || summaryLoading || !!summaryError}
              className="w-full rounded-full bg-[#302324] px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#211819] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#302324] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {summaryLoading
                ? "Calculating order..."
                : summaryError
                  ? "Order summary unavailable"
                  : "Proceed to Pay"}
            </button>

            <p className="mt-3 text-center text-sm font-medium text-[#625456]">
              You&apos;ll review the payment instructions on the next page.
            </p>
          </div>
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

          {summaryError && (
            <div className="mt-6 rounded-xl bg-red-50 p-4">
              <p className="text-sm font-medium leading-6 text-red-800">
                {summaryError}
              </p>

              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-3 text-sm font-bold text-[#302324] underline underline-offset-4"
              >
                Try again
              </button>
            </div>
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
