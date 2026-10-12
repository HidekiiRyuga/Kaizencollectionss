"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      return;
    }

    addToCart(product);
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      className={`w-full rounded-full px-6 py-4 text-sm font-semibold transition-colors ${
        isOutOfStock
          ? "cursor-not-allowed bg-[#E7DDDD] text-[#7A6B6D]"
          : "bg-[#302324] text-white hover:bg-[#211819]"
      }`}
    >
      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
    </button>
  );
}