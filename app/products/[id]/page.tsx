
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";
import AddToCartButton from "@/components/AddToCartButton";
import Footer from "@/components/Footer";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  const mrp = product.mrp;
  const price = product.price;
  const hasDiscount = mrp > price;

  const discountPercentage = hasDiscount
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;

  return (
    <>
      <main className="mx-auto max-w-[1500px] px-8 py-16 lg:px-12 lg:py-20 xl:px-16">
        <Link
          href="/shop"
          className="text-sm font-medium text-[#7A6B6D] hover:text-[#302324]"
        >
          ← Back to shop
        </Link>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-20 xl:gap-28">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-[#E7DDDD]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />

            {hasDiscount && (
              <span className="absolute left-4 top-4 rounded-full bg-[#302324] px-4 py-2 text-sm font-semibold text-white">
                {discountPercentage}% OFF
              </span>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
              {product.category}
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-semibold text-[#302324] sm:text-3xl">
                ₹{price.toLocaleString("en-IN")}
              </span>

              {hasDiscount && (
                <span className="text-lg text-[#7A6B6D] line-through">
                  ₹{mrp.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {hasDiscount && (
              <p className="mt-2 text-sm font-medium text-[#7A6B6D]">
                You save ₹{(mrp - price).toLocaleString("en-IN")}
              </p>
            )}

            {product.stock > 0 ? (
              <p className="mt-3 text-sm font-medium text-[#7A6B6D]">
                {product.stock} in stock
              </p>
            ) : (
              <p className="mt-3 text-sm font-medium text-red-600">
                Out of stock
              </p>
            )}

            <div className="my-8 h-px bg-[#E7DDDD]" />

            <p className="max-w-xl text-base leading-8 text-[#7A6B6D] sm:text-lg">
              {product.description}
            </p>

            <div className="mt-10 max-w-md">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
