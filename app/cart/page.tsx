
"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useCart } from "@/context/CartContext";
import Footer from "@/components/Footer";

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

interface CartSummary {
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

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");

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
          data.error || "Could not load the latest cart prices."
        );
      }

      setSummary(data as CartSummary);
    } catch (error) {
      setSummaryError(
        error instanceof Error
          ? error.message
          : "Could not load the latest cart prices."
      );
    } finally {
      setSummaryLoading(false);
    }
  }, [cart]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  if (cart.length === 0) {
    return (
      <>
        <main className="mx-auto flex min-h-[60vh] max-w-[1500px] items-center justify-center px-8 py-20 lg:px-12 xl:px-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
              Your cart is empty
            </h1>

            <p className="mt-5 text-base font-medium leading-7 text-[#625456] sm:text-lg">
              Looks like you haven&apos;t added anything yet.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-flex rounded-full bg-[#302324] px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-[#211819]"
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
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#B86F79]">
            Your selection
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
            Your Cart
          </h1>
        </div>

        <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_380px] xl:gap-20">
          <div>
            <div className="space-y-8">
              {cart.map((item) => {
                const currentItem = summary?.items.find(
                  (summaryItem) => summaryItem.productId === item.id
                );

                return (
                  <div
                    key={item.id}
                    className="flex gap-5 border-b border-[#D9CACA] pb-8 sm:gap-7"
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
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-lg font-bold leading-snug text-[#302324] sm:text-xl">
                            {item.name}
                          </h2>

                          {currentItem ? (
                            <>
                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                                <span className="font-bold text-[#302324]">
                                  {formatPrice(currentItem.price)}
                                </span>

                                {currentItem.mrp > currentItem.price && (
                                  <>
                                    <span className="font-medium text-[#625456] line-through">
                                      {formatPrice(currentItem.mrp)}
                                    </span>

                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-900">
                                      {currentItem.discountPercent}% off
                                    </span>
                                  </>
                                )}
                              </div>

                              {currentItem.productSavings > 0 && (
                                <p className="mt-1 text-sm font-semibold text-green-900">
                                  You save{" "}
                                  {formatPrice(currentItem.productSavings)}{" "}
                                  on this item
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="mt-1 text-sm font-semibold text-[#302324]">
                              {formatPrice(item.price)}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="shrink-0 text-[#625456] transition-colors hover:text-[#302324]"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={19} strokeWidth={2} />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="rounded-full border border-[#D9CACA] p-2 text-[#302324] transition-colors hover:bg-[#E7DDDD]"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus size={14} strokeWidth={2} />
                          </button>

                          <span className="w-7 text-center text-sm font-bold text-[#302324]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                            className="rounded-full border border-[#D9CACA] p-2 text-[#302324] transition-colors hover:bg-[#E7DDDD] disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus size={14} strokeWidth={2} />
                          </button>
                        </div>

                        {currentItem && (
                          <p className="text-sm font-bold text-[#302324]">
                            {formatPrice(currentItem.lineTotal)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/shop"
              className="mt-8 inline-block text-sm font-semibold text-[#625456] transition-colors hover:text-[#302324]"
            >
              ← Continue shopping
            </Link>
          </div>

          <aside className="h-fit rounded-3xl bg-[#E7DDDD] p-7 sm:p-8">
            <h2 className="text-xl font-bold text-[#302324]">
              Order Summary
            </h2>

            {summaryLoading && (
              <p className="mt-6 text-sm font-medium text-[#625456]">
                Calculating prices...
              </p>
            )}

            {summaryError && (
              <div className="mt-6 rounded-xl bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">
                  {summaryError}
                </p>

                <button
                  type="button"
                  onClick={() => void loadSummary()}
                  className="mt-3 text-sm font-bold text-[#302324] underline underline-offset-4"
                >
                  Retry
                </button>
              </div>
            )}

            {summary && !summaryLoading && (
              <>
                <div className="mt-8 space-y-4">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold text-[#625456]">
                      Subtotal
                    </span>

                    <span className="font-bold text-[#302324]">
                      {formatPrice(summary.originalSubtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold text-[#625456]">
                      Product discounts
                    </span>

                    <span className="font-bold text-green-900">
                      −{formatPrice(summary.productSavings)}
                    </span>
                  </div>
                </div>

                <div className="my-7 h-px bg-[#302324]/20" />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-bold text-[#302324]">
                    Total
                  </span>

                  <span className="text-xl font-bold text-[#302324]">
                    {formatPrice(summary.subtotal)}
                  </span>
                </div>
              </>
            )}

            <Link
              href="/checkout"
              aria-disabled={summaryLoading || !summary || !!summaryError}
              className={`mt-7 block w-full rounded-full bg-[#302324] px-6 py-4 text-center text-sm font-bold text-white transition-colors hover:bg-[#211819] ${
                summaryLoading || !summary || !!summaryError
                  ? "pointer-events-none opacity-60"
                  : ""
              }`}
            >
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
