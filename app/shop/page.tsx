import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

export default async function ShopPage({
  searchParams,
}: ShopPageProps) {
  const { q, category } = await searchParams;

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (q?.trim()) {
    query = query.ilike("name", `%${q.trim()}%`);
  }

  if (category?.trim() && category !== "All") {
    query = query.eq("category", category);
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Failed to fetch products:", error);

    return (
      <>
        <main className="mx-auto max-w-[1500px] px-8 py-20 lg:px-12 xl:px-16">
          <h1 className="text-5xl font-bold tracking-tight text-[#302324]">
            Shop
          </h1>

          <p className="mt-5 text-[#7A6B6D]">
            We couldn't load the products right now. Please try again later.
          </p>
        </main>

        <Footer />
      </>
    );
  }

  const categories = [
    "All",
    "Accessories",
    "Stickers",
    "Plushies",
  ];

  return (
    <>
      <main className="mx-auto max-w-[1500px] px-8 py-20 lg:px-12 xl:px-16">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E1ACB0]">
            KaizenCollectionss
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-[#302324] sm:text-6xl">
            Shop
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#7A6B6D]">
            Explore our collection of anime-inspired finds and cute
            collectibles.
          </p>
        </div>

        <div className="mb-12 space-y-6">
          <form
            method="GET"
            action="/shop"
            className="flex max-w-2xl gap-3"
          >
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search products..."
              className="min-w-0 flex-1 rounded-full border border-[#E7DDDD] bg-white px-5 py-3.5 text-sm text-[#302324] outline-none focus:border-[#E1ACB0]"
            />

            {category && (
              <input
                type="hidden"
                name="category"
                value={category}
              />
            )}

            <button
              type="submit"
              className="rounded-full bg-[#302324] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#211819]"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-3">
            {categories.map((item) => {
              const isActive =
                (item === "All" && !category) ||
                category === item;

              const params = new URLSearchParams();

              if (q?.trim()) {
                params.set("q", q.trim());
              }

              if (item !== "All") {
                params.set("category", item);
              }

              const queryString = params.toString();

              return (
                <Link
                  key={item}
                  href={`/shop${queryString ? `?${queryString}` : ""}`}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-[#302324] text-white"
                      : "border border-[#E7DDDD] text-[#302324] hover:bg-[#FCF9F9]"
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-[#302324]">
              No products found.
            </p>

            <p className="mt-2 text-[#7A6B6D]">
              Try a different search or category.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block text-sm font-semibold text-[#302324] hover:underline"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm text-[#7A6B6D]">
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}