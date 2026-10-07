"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/context/CartContext";
import Footer from "@/components/Footer";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
  } = useCart();

  if (cart.length === 0) {
    return (
      <>
        <main className="mx-auto flex min-h-[60vh] max-w-[1500px] items-center justify-center px-8 py-20 lg:px-12 xl:px-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
              Your cart is empty
            </h1>

            <p className="mt-5 text-base leading-7 text-[#7A6B6D] sm:text-lg">
              Looks like you haven't added anything yet.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-flex rounded-full bg-[#302324] px-8 py-4 text-sm font-semibold text-white hover:bg-[#211819]"
            >
              Continue Shopping
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-[1500px] px-8 py-16 lg:px-12 lg:py-20 xl:px-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
            Your selection
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
            Your Cart
          </h1>
        </div>

        <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_380px] xl:gap-20">
          {/* Cart Items */}
          <div>
            <div className="space-y-8">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-5 border-b border-[#E7DDDD] pb-8 sm:gap-7"
                >
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#E7DDDD] sm:h-36 sm:w-36">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h2 className="text-base font-semibold text-[#302324] sm:text-lg">
                          {item.name}
                        </h2>

                        <p className="mt-2 text-sm text-[#7A6B6D]">
                          ₹{item.price.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="shrink-0 text-[#7A6B6D] hover:text-[#302324]"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={19} strokeWidth={1.8} />
                      </button>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="rounded-full border border-[#E7DDDD] p-2 text-[#302324] hover:bg-[#E7DDDD]"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="w-7 text-center text-sm font-medium text-[#302324]">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="rounded-full border border-[#E7DDDD] p-2 text-[#302324] hover:bg-[#E7DDDD]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/shop"
              className="mt-8 inline-block text-sm font-medium text-[#7A6B6D] hover:text-[#302324]"
            >
              ← Continue shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-3xl bg-[#E7DDDD] p-7 sm:p-8">
            <h2 className="text-xl font-semibold text-[#302324]">
              Order Summary
            </h2>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#7A6B6D]">Subtotal</span>

                <span className="font-medium text-[#302324]">
                  ₹{cartTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-[#7A6B6D]">Shipping</span>

                <span className="font-medium text-[#302324]">
                  Calculated later
                </span>
              </div>
            </div>

            <div className="my-7 h-px bg-[#302324]/10" />

            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#302324]">
                Total
              </span>

              <span className="text-xl font-bold text-[#302324]">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-7 block w-full rounded-full bg-[#302324] px-6 py-4 text-center text-sm font-semibold text-white hover:bg-[#211819]"
            >
              Order Now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}