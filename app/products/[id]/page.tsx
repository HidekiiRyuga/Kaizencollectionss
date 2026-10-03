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
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
              {product.category}
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            <p className="mt-6 text-2xl font-semibold text-[#302324] sm:text-3xl">
              ₹{product.price.toLocaleString("en-IN")}
            </p>

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