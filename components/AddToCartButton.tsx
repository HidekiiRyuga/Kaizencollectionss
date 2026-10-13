"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const { cart, addToCart } = useCart();
  const [feedback, setFeedback] = useState<
    "idle" | "added" | "limit"
  >("idle");

  useEffect(() => {
    if (feedback === "idle") return;

    const timeout = window.setTimeout(() => {
      setFeedback("idle");
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const existingItem = cart.find(
      (item) => item.id === product.id
    );

    if (
      existingItem &&
      existingItem.quantity >= product.stock
    ) {
      setFeedback("limit");
      return;
    }

    addToCart(product);
    setFeedback("added");
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      aria-live="polite"
      className={`w-full rounded-full px-6 py-4 text-sm font-semibold
        cursor-pointer transition-colors duration-100 ease-out
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-[#E1ACB0] focus-visible:ring-offset-2
        ${
          isOutOfStock
            ? "cursor-not-allowed bg-[#E7DDDD] text-[#7A6B6D]"
            : feedback === "added"
              ? "bg-[#302324] text-[#E1ACB0]"
              : feedback === "limit"
                ? "bg-[#302324] text-[#E7DDDD]"
                : "bg-[#302324] text-white hover:bg-[#513B3D]"
        }`}
    >
      {isOutOfStock
        ? "Out of Stock"
        : feedback === "added"
          ? "✓ Added to Cart"
          : feedback === "limit"
            ? "Maximum Stock Reached"
            : "Add to Cart"}
    </button>
  );
}
