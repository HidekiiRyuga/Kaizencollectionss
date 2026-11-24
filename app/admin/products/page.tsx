
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { archiveProduct, restoreProduct, toggleFeatured } from "./actions";
import PermanentDeleteProductButton from "./PermanentDeleteProductButton";

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
    console.error("Failed to load products:", error);

    return (
      <main className="mx-auto max-w-[1500px] px-8 py-16 lg:px-12 xl:px-16">
        <p className="text-red-600">
          Failed to load products.
        </p>
      </main>
    );
  }

  const productList = products ?? [];

  const activeProducts = productList.filter(
    (product) => product.is_active
  );

  const archivedProducts = productList.filter(
    (product) => !product.is_active
  );

  function ProductRow({
    product,
    archived = false,
  }: {
    product: (typeof productList)[number];
    archived?: boolean;
  }) {
    return (
      <div
        key={product.id}
        className={`flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between ${
          archived ? "bg-[#FCF9F9]" : ""
        }`}
      >
        <div className="flex items-center gap-5">
          <div
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#E7DDDD] ${
              archived ? "opacity-50" : ""
            }`}
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : null}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className={`font-semibold ${
                  archived ? "text-[#7A6B6D]" : "text-[#302324]"
                }`}
              >
                {product.name}
              </h2>

              {archived && (
                <span className="rounded-full bg-[#E7DDDD] px-2.5 py-1 text-xs font-medium text-[#7A6B6D]">
                  Archived
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-[#7A6B6D]">
              {product.category}
            </p>

            <p className="mt-1 text-sm font-medium text-[#302324]">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <Link
            href={`/admin/products/${product.id}`}
            className="text-sm font-medium text-[#302324] hover:underline"
          >
            Edit
          </Link>

          {archived ? (
            <>
              <form action={restoreProduct}>
                <input type="hidden" name="id" value={product.id} />

                <button
                  type="submit"
                  className="rounded-full bg-[#302324] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#211819]"
                >
                  Restore
                </button>
              </form>

              <PermanentDeleteProductButton
                productId={product.id}
                productName={product.name}
              />
            </>
          ) : (
            <>
              <form action={archiveProduct}>
                <input type="hidden" name="id" value={product.id} />

                <button
                  type="submit"
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Archive
                </button>
              </form>

              <form action={toggleFeatured}>
                <input type="hidden" name="id" value={product.id} />
                <input
                  type="hidden"
                  name="featured"
                  value={product.featured ? "false" : "true"}
                />

                <button
                  type="submit"
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    product.featured
                      ? "bg-[#E1ACB0] text-[#302324] hover:bg-[#D6959B]"
                      : "border border-[#E7DDDD] text-[#302324] hover:bg-[#FCF9F9]"
                  }`}
                >
                  {product.featured ? "★ Featured" : "☆ Feature"}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
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

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-[#F5E9E9] px-4 py-2 text-[#302324]">
              {activeProducts.length} Active
            </span>

            <span className="rounded-full bg-[#E7DDDD] px-4 py-2 text-[#7A6B6D]">
              {archivedProducts.length} Archived
            </span>
          </div>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-full bg-[#302324] px-6 py-3.5 text-center text-sm font-semibold text-white hover:bg-[#211819]"
        >
          Add Product
        </Link>
      </div>

      {/* Active Products */}
      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#302324]">
            Active Products
          </h2>

          <span className="text-sm text-[#7A6B6D]">
            {activeProducts.length} products
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E7DDDD]">
          {activeProducts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-[#7A6B6D]">
                No active products.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E7DDDD]">
              {activeProducts.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Archived Products */}
      <section className="mt-14">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#302324]">
              Archived Products
            </h2>

            <p className="mt-1 text-sm text-[#7A6B6D]">
              These products are hidden from your store but their records are preserved.
            </p>
          </div>

          <span className="text-sm text-[#7A6B6D]">
            {archivedProducts.length} products
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E7DDDD]">
          {archivedProducts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-[#7A6B6D]">
                No archived products.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E7DDDD]">
              {archivedProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  archived
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
