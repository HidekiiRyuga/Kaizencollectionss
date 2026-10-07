import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id,
      customer_name,
      phone,
      address,
      total,
      status,
      created_at,
      order_items (
        id,
        quantity,
        price,
        products (
          id,
          name,
          image
        )
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 lg:px-12 lg:py-20">
      <Link
        href="/account/orders"
        className="text-sm font-medium text-[#7A6B6D] hover:text-[#302324]"
      >
        ← Back to orders
      </Link>

      <div className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
          Order Details
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#302324] sm:text-4xl">
          Order #{order.id}
        </h1>

        <p className="mt-3 text-sm text-[#7A6B6D]">
          {new Date(order.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-[#E7DDDD] bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#302324]">
            Order Status
          </h2>

          <span className="rounded-full bg-[#E7DDDD] px-4 py-2 text-sm font-semibold capitalize text-[#302324]">
            {order.status}
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#E7DDDD] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#302324]">
          Items
        </h2>

        <div className="mt-6 divide-y divide-[#E7DDDD]">
          {order.order_items.map((item) => {
            const product = Array.isArray(item.products)
              ? item.products[0]
              : item.products;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 py-5"
              >
                <div>
                  <p className="font-medium text-[#302324]">
                    {product?.name ?? "Product"}
                  </p>

                  <p className="mt-1 text-sm text-[#7A6B6D]">
                    ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                  </p>
                </div>

                <p className="font-semibold text-[#302324]">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#E7DDDD] pt-5">
          <p className="font-semibold text-[#302324]">
            Total
          </p>

          <p className="text-lg font-bold text-[#302324]">
            ₹{order.total.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#E7DDDD] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#302324]">
          Delivery Details
        </h2>

        <div className="mt-5 space-y-3 text-sm">
          <div>
            <p className="text-[#7A6B6D]">Name</p>
            <p className="mt-1 font-medium text-[#302324]">
              {order.customer_name}
            </p>
          </div>

          <div>
            <p className="text-[#7A6B6D]">Phone</p>
            <p className="mt-1 font-medium text-[#302324]">
              {order.phone}
            </p>
          </div>

          <div>
            <p className="text-[#7A6B6D]">Address</p>
            <p className="mt-1 whitespace-pre-line font-medium text-[#302324]">
              {order.address}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}