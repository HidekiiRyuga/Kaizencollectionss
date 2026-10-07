import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { products } from "@/data/products";
import ProductCard from "./ProductCard";
import FadeIn from "./FadeIn";

export default function SuggestedProducts() {
  return (
    <section className="bg-[#FCF9F9]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#E1ACB0]">
              Our picks
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#302324] sm:text-4xl">
              Suggested Items
            </h2>
          </div>

          <Link
            href="/shop"
            className="group hidden items-center gap-1 text-sm font-medium text-[#302324] sm:flex"
          >
            View all
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/shop"
            className="text-sm font-medium text-[#302324]"
          >
            View all products →
          </Link>
        </div>
      </div>
    </section>
  );
}