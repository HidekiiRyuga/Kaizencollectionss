
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ orderId: string }>;
};

function formatPrice(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminOrderDetailsPage({ params }: Props) {
  const { orderId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) redirect("/");

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id,
      customer_name,
      phone,
      address,
      total,
      subtotal,
      delivery_fee,
      status,
      payment_status,
      payment_utr,
      created_at,
      cancellation_reason,
      order_items (
        quantity,
        price,
        products (
          name,
          image
        )
      )
    `)
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load order details:", error);

    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-12">
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-[#7A6B6D] transition-colors hover:text-[#302324]"
        >
          ← Back to orders
        </Link>

        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load this order. Please check the server logs.
        </p>
      </main>
    );
  }

  if (!order) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-[#302324] sm:px-6 sm:py-10 lg:px-12 lg:py-14">
      {/* Navigation */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#7A6B6D] transition-colors hover:text-[#302324]"
      >
        <span aria-hidden="true">←</span>
        Back to orders
      </Link>

      {/* Page heading */}
      <header className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B98289]">
          Admin · Order Details
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#302324] sm:text-4xl">
          Ordered Products
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#7A6B6D]">
          Review the items purchased and the details associated with this order.
        </p>
      </header>

      {/* Order and customer information */}
      <section className="mt-7 rounded-2xl border border-[#E7DDDD] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-3 border-b border-[#F0E8E8] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B6D]">
              Order ID
            </p>

            <p className="mt-2 break-all font-mono text-sm font-medium text-[#302324]">
              {order.id}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="inline-flex rounded-full bg-[#FCF4F5] px-3 py-1.5 text-xs font-semibold capitalize text-[#6D4147]">
              Order: {order.status.replaceAll("_", " ")}
            </span>

            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                order.payment_status === "paid"
                  ? "bg-green-50 text-green-700"
                  : order.payment_status === "rejected"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-800"
              }`}
            >
              Payment: {order.payment_status.replaceAll("_", " ")}
            </span>
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-6 pt-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A7779]">
              Customer
            </p>

            <p className="mt-2 text-sm font-semibold text-[#302324]">
              {order.customer_name}
            </p>

            <p className="mt-1 text-sm text-[#7A6B6D]">
              {order.phone}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A7779]">
              Order date
            </p>

            <p className="mt-2 text-sm text-[#302324]">
              {formatDate(order.created_at)}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A7779]">
              Delivery address
            </p>

            <p className="mt-2 break-words text-sm leading-6 text-[#302324]">
              {order.address}
            </p>
          </div>

          {order.payment_utr && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A7779]">
                Payment UTR
              </p>

              <p className="mt-2 break-all font-mono text-sm text-[#302324]">
                {order.payment_utr}
              </p>
            </div>
          )}

          {order.status === "cancelled" && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                Cancellation reason
              </p>

              <p className="mt-2 text-sm leading-6 text-red-700">
                {order.cancellation_reason || "No reason provided."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Ordered products */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#302324]">
              Products in this order
            </h2>

            <p className="mt-2 text-sm text-[#7A6B6D]">
              {order.order_items.length} product line
              {order.order_items.length === 1 ? "" : "s"} in this order.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {order.order_items.map((item, index) => {
            const product = Array.isArray(item.products)
              ? item.products[0]
              : item.products;

            return (
              <article
                key={`${order.id}-${index}`}
                className="rounded-2xl border border-[#E7DDDD] bg-white p-5 transition-shadow hover:shadow-sm sm:p-6"
                >
                <div className="flex items-center gap-4 sm:gap-5">
                    {product?.image ? (
                    <Image
                        src={product.image}
                        alt={product.name ?? "Product"}
                        width={112}
                        height={112}
                        unoptimized
                        className="h-24 w-24 shrink-0 rounded-xl border border-[#E7DDDD] bg-[#FCF9F9] object-cover sm:h-28 sm:w-28"
                    />
                    ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-[#E7DDDD] bg-[#FCF9F9] text-xs text-[#7A6B6D] sm:h-28 sm:w-28">
                        No image
                    </div>
                    )}

                    <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold leading-snug text-[#302324] sm:text-lg">
                        {product?.name ?? "Unavailable product"}
                    </h3>

                    <p className="mt-3 text-sm text-[#7A6B6D]">
                        Quantity: {item.quantity}
                    </p>

                    <p className="mt-1 text-sm text-[#7A6B6D]">
                        Price per item: {formatPrice(item.price)}
                    </p>

                    <p className="mt-3 text-lg font-bold text-[#302324]">
                        {formatPrice(item.price * item.quantity)}
                    </p>
                    </div>

                    <div className="ml-auto shrink-0 self-start pt-1 text-right">
                    <p className="text-base font-bold text-[#302324] sm:text-lg">
                        × {item.quantity}
                    </p>
                    </div>
                </div>
                </article>
            );
          })}

          {order.order_items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#E7DDDD] bg-white px-5 py-12 text-center">
              <p className="font-semibold text-[#302324]">
                No products found
              </p>

              <p className="mt-2 text-sm text-[#7A6B6D]">
                There are no product items associated with this order.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Order summary */}
      <section className="mt-6 w-full rounded-2xl border border-[#E7DDDD] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-[#302324]">
          Order summary
        </h2>

        <div className="mt-5 space-y-4">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-[#7A6B6D]">Subtotal</span>
            <span className="font-medium tabular-nums text-[#302324]">
              {formatPrice(order.subtotal)}
            </span>
          </div>

          <div className="flex justify-between gap-4 text-sm">
            <span className="text-[#7A6B6D]">Delivery fee</span>
            <span className="font-medium tabular-nums text-[#302324]">
              {formatPrice(order.delivery_fee)}
            </span>
          </div>

          <div className="flex justify-between gap-4 border-t border-[#E7DDDD] pt-4">
            <span className="font-semibold text-[#302324]">
              Order total
            </span>

            <span className="text-xl font-bold tabular-nums text-[#302324]">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </section>

      {/* Back navigation */}
      <div className="mt-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center justify-center rounded-full bg-[#302324] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#211819]"
        >
          ← Back to order management
        </Link>
      </div>
    </main>
  );
}
