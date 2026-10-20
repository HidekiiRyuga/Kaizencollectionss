
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "./ProductCard";

export default async function SuggestedProducts() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, mrp, image, stock")
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load featured products:", error);
  }

  const featuredProducts = products ?? [];

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

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                mrp={product.mrp}
                image={product.image ?? "/products/placeholder.jpg"}
                stock={product.stock}
              />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-[#7A6B6D]">
            Our featured products are coming soon.
          </p>
        )}

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
