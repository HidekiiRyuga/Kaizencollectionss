import Link from "next/link";
import Image from "next/image";

import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "./actions";

import { redirect } from "next/navigation";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    redirect("/");
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-[1500px] px-8 py-16 lg:px-12 xl:px-16">
        <p className="text-red-600">
          Failed to load products.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1500px] px-8 py-16 lg:px-12 lg:py-20 xl:px-16">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
            Admin
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
            Products
          </h1>

          <p className="mt-4 text-[#7A6B6D]">
            Manage the products shown in your store.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-full bg-[#302324] px-6 py-3.5 text-center text-sm font-semibold text-white hover:bg-[#211819]"
        >
          Add Product
        </Link>
      </div>

      <div className="mt-12 overflow-hidden rounded-2xl border border-[#E7DDDD]">
        {products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-[#7A6B6D]">
              No products yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E7DDDD]">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#E7DDDD]">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#302324]">
                      {product.name}
                    </h2>

                    <p className="mt-1 text-sm text-[#7A6B6D]">
                      {product.category}
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#302324]">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-sm font-medium text-[#302324] hover:underline"
                  >
                    Edit
                  </Link>

                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={product.id} />

                    <button
                      type="submit"
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}