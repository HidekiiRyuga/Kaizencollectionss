"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";

interface CheckoutDetails {
  customerName: string;
  phone: string;
  address: string;
}

export default function PaymentPage() {
  const router = useRouter();

  const { cart, cartTotal, clearCart } = useCart();

  const [details, setDetails] = useState<CheckoutDetails | null>(
    null
  );

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
      setDetails(JSON.parse(savedDetails));
    } catch {
      sessionStorage.removeItem("kaizen-checkout-details");
      router.replace("/checkout");
    }
  }, [router]);

  if (cart.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-[1500px] items-center justify-center px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#302324]">
            Your cart is empty
          </h1>

          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-[#302324] px-8 py-4 text-sm font-semibold text-white hover:bg-[#211819]"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="mx-auto flex min-h-[60vh] items-center justify-center px-8">
        <p className="text-[#7A6B6D]">
          Loading payment...
        </p>
      </main>
    );
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
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
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to place order."
        );
      }

      sessionStorage.removeItem("kaizen-checkout-details");

      clearCart();

      router.push(`/order-success?id=${data.orderId}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1500px] px-8 py-16 lg:px-12 lg:py-20 xl:px-16">
      <div className="mb-12">
        <Link
          href="/checkout"
          className="text-sm font-medium text-[#7A6B6D] hover:text-[#302324]"
        >
          ← Back to delivery details
        </Link>

        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
          Payment
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
          Complete your payment
        </h1>

        <p className="mt-4 max-w-2xl text-[#7A6B6D]">
          Pay the exact amount using UPI, then enter your transaction
          ID below.
        </p>
      </div>

      <div className="grid gap-14 lg:grid-cols-[1fr_380px] xl:gap-20">
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl"
        >
          <div className="rounded-3xl border border-[#E7DDDD] bg-[#FCF9F9] p-6 sm:p-8">
            <div className="text-center">
              <p className="text-sm font-medium text-[#7A6B6D]">
                Amount to pay
              </p>

              <p className="mt-2 text-4xl font-bold text-[#302324]">
                ₹{cartTotal.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="mx-auto mt-8 w-fit rounded-2xl bg-white p-3">
              <Image
                src="/payment/upi-qr.jpg"
                alt="UPI payment QR code"
                width={280}
                height={280}
                className="h-auto w-[240px] sm:w-[280px]"
              />
            </div>

            <div className="mt-7 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
                UPI ID
              </p>

              <p className="mt-2 break-all text-lg font-semibold text-[#302324]">
                jnishaera@okicici
              </p>

              <p className="mt-3 text-sm leading-6 text-[#7A6B6D]">
                Scan the QR code with any UPI app or pay directly to
                the UPI ID above.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <label
              htmlFor="paymentUtr"
              className="text-sm font-medium text-[#302324]"
            >
              UPI Transaction ID / UTR
            </label>

            <input
              id="paymentUtr"
              type="text"
              value={paymentUtr}
              onChange={(event) =>
                setPaymentUtr(event.target.value)
              }
              required
              minLength={6}
              autoComplete="off"
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
              placeholder="Enter the transaction ID from your UPI app"
            />

            <p className="mt-2 text-xs leading-5 text-[#7A6B6D]">
              Find this number in your UPI payment details after
              completing the payment.
            </p>
          </div>

          {error && (
            <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 w-full rounded-full bg-[#302324] px-6 py-4 text-sm font-semibold text-white hover:bg-[#211819] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Submitting Order..."
              : "I've Paid — Place Order"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-[#7A6B6D]">
            Your payment will be manually verified before your order
            is confirmed.
          </p>
        </form>

        <div className="h-fit rounded-3xl bg-[#E7DDDD] p-7 sm:p-8">
          <h2 className="text-xl font-semibold text-[#302324]">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-4 text-sm"
              >
                <span className="text-[#7A6B6D]">
                  {item.name} × {item.quantity}
                </span>

                <span className="shrink-0 font-medium text-[#302324]">
                  ₹
                  {(item.price * item.quantity).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="my-7 h-px bg-[#302324]/10" />

          <div className="flex justify-between">
            <span className="font-semibold text-[#302324]">
              Total
            </span>

            <span className="text-xl font-bold text-[#302324]">
              ₹{cartTotal.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}