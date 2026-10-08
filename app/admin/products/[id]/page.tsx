
import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "../actions";

import ProductImageUpload from "@/components/admin/ProductImageUpload";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const supabase = await createClient();


  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-8 py-16 lg:px-12 lg:py-20">
      <Link
        href="/admin/products"
        className="text-sm font-medium text-[#7A6B6D] hover:text-[#302324]"
      >
        ← Back to products
      </Link>

      <div className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
          Admin
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324]">
          Edit Product
        </h1>

        <p className="mt-3 text-[#7A6B6D]">
          Update the details of this product.
        </p>
      </div>

      <form action={updateProduct} className="mt-10 space-y-6">
        <div>
          <label className="text-sm font-medium text-[#302324]">
            Product Name
          </label>
            
          <input
            type="text"
            name="name"
            defaultValue={product.name}
            className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 outline-none focus:border-[#E1ACB0]"
            />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[#302324]">
              Price
            </label>

            <input
              type="number"
              name="price"
              defaultValue={product.price}
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 outline-none focus:border-[#E1ACB0]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#302324]">
              Category
            </label>

            <input
              type="text"
              name="category"
              defaultValue={product.category}
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 outline-none focus:border-[#E1ACB0]"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[#302324]">
            Description
          </label>

          <textarea
            name="description"
            defaultValue={product.description ?? ""}
            rows={6}
            className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 outline-none focus:border-[#E1ACB0]"
          />
        </div>

        <ProductImageUpload currentImage={product.image} />

        <div>
          <label
            htmlFor="stock"
            className="text-sm font-medium text-[#302324]"
          >
            Stock
          </label>

          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product.stock}
            className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 text-[#302324] outline-none focus:border-[#E1ACB0]"
          />
        </div>

        <input type="hidden" name="id" value={product.id} />

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="rounded-full bg-[#302324] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#211819]"
          >
            Save Changes
          </button>

          <Link
            href="/admin/products"
            className="rounded-full border border-[#E7DDDD] px-6 py-3.5 text-sm font-semibold text-[#302324]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}