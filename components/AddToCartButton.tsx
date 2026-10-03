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
    addToCart(product);
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="w-full rounded-full bg-[#302324] px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#211819]"
    >
      Add to Cart
</button>
  );
}