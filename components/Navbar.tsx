"use client";

import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { cartCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E7DDDD] bg-[#FCF9F9]">
      <nav className="relative mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4 lg:px-12 xl:px-16">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="text-lg font-bold tracking-tight text-[#302324] sm:text-xl"
        >
          KaizenCollectionss
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-[#302324] hover:text-[#E1ACB0]"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="text-sm font-medium text-[#302324] hover:text-[#E1ACB0]"
          >
            Shop
          </Link>

          <Link
            href="/about"
            className="text-sm font-medium text-[#302324] hover:text-[#E1ACB0]"
          >
            About
          </Link>

          <Link
            href="/account"
            className="text-sm font-medium text-[#302324] hover:text-[#E1ACB0]"
          >
            Account
          </Link>

          <Link
            href="/cart"
            className="flex items-center gap-2 text-sm font-medium text-[#302324] hover:text-[#E1ACB0]"
          >
            <ShoppingBag size={18} />

            <span>
              Cart
              {cartCount > 0 && ` (${cartCount})`}
            </span>
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-4 md:hidden">
          
          <Link
          href="/account"
          onClick={closeMenu}
          className="text-base font-medium text-[#302324]"
        >
          Account
        </Link>
          <Link
            href="/cart"
            onClick={closeMenu}
            className="relative text-[#302324]"
            aria-label="Cart"
          >
            <ShoppingBag size={21} />

            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#302324] px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="relative z-[60] flex h-10 w-10 items-center justify-center text-[#302324]"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div
        className={`border-t border-[#E7DDDD] bg-[#FCF9F9] md:hidden ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="px-6 py-6">
          <div className="flex flex-col gap-6">
            <Link
              href="/"
              onClick={closeMenu}
              className="text-base font-medium text-[#302324]"
            >
              Home
            </Link>

            <Link
              href="/shop"
              onClick={closeMenu}
              className="text-base font-medium text-[#302324]"
            >
              Shop
            </Link>

            <Link
              href="/about"
              onClick={closeMenu}
              className="text-base font-medium text-[#302324]"
            >
              About
            </Link>

            <Link
              href="/cart"
              onClick={closeMenu}
              className="text-base font-medium text-[#302324]"
            >
              Cart
              {cartCount > 0 && ` (${cartCount})`}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}