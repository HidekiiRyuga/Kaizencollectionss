"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-[#E7DDDD]/70 bg-[#FCF9F9]/95 backdrop-blur-md">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="text-lg font-bold tracking-tight text-[#302324] sm:text-xl"
        >
          KaizenCollectionss
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-[#302324] transition-colors hover:text-[#E1ACB0]"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="text-sm font-medium text-[#302324] transition-colors hover:text-[#E1ACB0]"
          >
            Shop
          </Link>

          <Link
            href="/about"
            className="text-sm font-medium text-[#302324] transition-colors hover:text-[#E1ACB0]"
          >
            About
          </Link>
        </div>

        <Link
          href="/cart"
          className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[#302324] transition-colors hover:bg-[#E7DDDD] md:flex"
        >
          <ShoppingBag size={19} strokeWidth={1.8} />
          <span>
            Cart{cartCount > 0 && ` (${cartCount})`}
          </span>
        </Link>

        <button
          type="button"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full p-2 text-[#302324] transition-colors hover:bg-[#E7DDDD] md:hidden"
        >
          {isOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-[#E7DDDD] bg-[#FCF9F9] px-5 py-5 md:hidden">
          <div className="flex flex-col gap-1">
            {[
              ["Home", "/"],
              ["Shop", "/shop"],
              ["About", "/about"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-[#302324] transition-colors hover:bg-[#E7DDDD]"
              >
                {label}
              </Link>
            ))}

            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-[#302324] transition-colors hover:bg-[#E7DDDD]"
            >
              <ShoppingBag size={18} strokeWidth={1.8} />
              <span>
                Cart{cartCount > 0 && ` (${cartCount})`}
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}