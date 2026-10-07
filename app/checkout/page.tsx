"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();

  const {
  cart,
  cartTotal,
  clearCart,
} = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (cart.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-[1500px] items-center justify-center px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#302324]">
            Your cart is empty
          </h1>

          <p className="mt-4 text-[#7A6B6D]">
            Add something to your cart before checking out.
          </p>

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
          customerName,
          phone,
          address,
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
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
          Checkout
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
          Complete your order
        </h1>
      </div>

      <div className="grid gap-14 lg:grid-cols-[1fr_380px] xl:gap-20">
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl space-y-7"
        >
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium text-[#302324]"
            >
              Full name
            </label>

            <input
              id="name"
              type="text"
              value={customerName}
              onChange={(event) =>
                setCustomerName(event.target.value)
              }
              required
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="text-sm font-medium text-[#302324]"
            >
              Phone number
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              required
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
              placeholder="Your phone number"
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="text-sm font-medium text-[#302324]"
            >
              Delivery address
            </label>

            <textarea
              id="address"
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
              required
              rows={5}
              className="mt-2 w-full resize-none rounded-xl border border-[#E7DDDD] bg-white px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
              placeholder="Enter your complete delivery address"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#302324] px-6 py-4 text-sm font-semibold text-white hover:bg-[#211819] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
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
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
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