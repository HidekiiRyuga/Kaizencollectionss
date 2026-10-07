import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

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

  return (
    <>
      <main className="mx-auto max-w-[1500px] px-8 py-20 lg:px-12 xl:px-16">
        <div className="mb-14">
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

        {products.length === 0 ? (
          <p className="py-20 text-center text-[#7A6B6D]">
            No products available yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}