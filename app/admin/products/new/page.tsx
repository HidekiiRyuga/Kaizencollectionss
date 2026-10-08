import Link from "next/link";

import ProductImageUpload from "@/components/admin/ProductImageUpload";
import { createProduct } from "../actions";

export default function NewProductPage() {
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

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
          Add Product
        </h1>

        <p className="mt-4 text-[#7A6B6D]">
          Add a new product to your store.
        </p>
      </div>

      <form action={createProduct} className="mt-10 space-y-6">
        <div>
          <label
            htmlFor="name"
            className="text-sm font-medium text-[#302324]"
          >
            Product Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Anime Keychain"
            className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 text-[#302324] outline-none focus:border-[#E1ACB0]"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label
              htmlFor="price"
              className="text-sm font-medium text-[#302324]"
            >
              Price
            </label>

            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="1"
              required
              placeholder="299"
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 text-[#302324] outline-none focus:border-[#E1ACB0]"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="text-sm font-medium text-[#302324]"
            >
              Category
            </label>

            <input
              id="category"
              name="category"
              type="text"
              required
              placeholder="Accessories"
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 text-[#302324] outline-none focus:border-[#E1ACB0]"
            />
          </div>
          
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
              defaultValue="0"
              placeholder="10"
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 text-[#302324] outline-none focus:border-[#E1ACB0]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="text-sm font-medium text-[#302324]"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            rows={6}
            placeholder="Describe the product..."
            className="mt-2 w-full resize-none rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 text-[#302324] outline-none focus:border-[#E1ACB0]"
          />
        </div>

        <ProductImageUpload />

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="rounded-full bg-[#302324] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#211819]"
          >
            Create Product
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