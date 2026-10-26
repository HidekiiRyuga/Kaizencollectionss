
"use client";

import { useMemo, useState } from "react";

type ProductInfo = {
  name: string;
  image?: string | null;
};

type OrderInfo = {
  id: string;
  customer_name: string;
  created_at: string | null;
  status: string;
  payment_status: string;
};

type OrderItemInfo = {
  quantity: number;
  price: number;
  products: ProductInfo | ProductInfo[] | null;
  orders: OrderInfo | null;
};

type OrdersViewTabsProps = {
  children: React.ReactNode;
  orderedItems: OrderItemInfo[];
};

function formatPrice(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getProduct(item: OrderItemInfo) {
  return Array.isArray(item.products)
    ? item.products[0] ?? null
    : item.products;
}

function StatusBadge({ value }: { value: string }) {
  const status = value.toLowerCase();

  const style =
    status === "cancelled" || status === "rejected"
      ? "bg-red-50 text-red-700"
      : status === "delivered" || status === "paid"
        ? "bg-green-50 text-green-700"
        : status === "shipped"
          ? "bg-blue-50 text-blue-700"
          : "bg-amber-50 text-amber-800";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${style}`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

export default function OrdersViewTabs({
  children,
  orderedItems,
}: OrdersViewTabsProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");

  const summary = useMemo(() => {
    const products = new Map<
      string,
      {
        name: string;
        image: string | null;
        allUnits: number;
        activeUnits: number;
        cancelledUnits: number;
        activeValue: number;
      }
    >();

    for (const item of orderedItems) {
      if (!item.orders) continue;

      const product = getProduct(item);
      const name = product?.name ?? "Unavailable product";
      const lineValue = item.price * item.quantity;
      const cancelled = item.orders.status.toLowerCase() === "cancelled";

      // A product ID should be used as the key when available.
      const key = name;

      const entry = products.get(key) ?? {
        name,
        image: product?.image ?? null,
        allUnits: 0,
        activeUnits: 0,
        cancelledUnits: 0,
        activeValue: 0,
      };

      entry.allUnits += item.quantity;

      if (cancelled) {
        entry.cancelledUnits += item.quantity;
      } else {
        entry.activeUnits += item.quantity;
        entry.activeValue += lineValue;
      }

      products.set(key, entry);
    }

    return [...products.values()].sort(
      (a, b) => b.activeUnits - a.activeUnits
    );
  }, [orderedItems]);

  const totalUnits = orderedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const nonCancelledUnits = orderedItems.reduce(
    (sum, item) =>
      item.orders?.status.toLowerCase() === "cancelled"
        ? sum
        : sum + item.quantity,
    0
  );

  const nonCancelledValue = orderedItems.reduce(
    (sum, item) =>
      item.orders?.status.toLowerCase() === "cancelled"
        ? sum
        : sum + item.price * item.quantity,
    0
  );

  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label="Order views"
        className="flex w-full gap-2 rounded-xl border border-[#E7DDDD] bg-[#FCF9F9] p-1.5 sm:w-fit"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "orders"}
          onClick={() => setActiveTab("orders")}
          className={`flex-1 rounded-lg px-5 py-3 text-sm font-semibold transition-colors sm:flex-none ${
            activeTab === "orders"
              ? "bg-[#302324] text-white"
              : "text-[#7A6B6D] hover:text-[#302324]"
          }`}
        >
          Orders
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "products"}
          onClick={() => setActiveTab("products")}
          className={`flex-1 rounded-lg px-5 py-3 text-sm font-semibold transition-colors sm:flex-none ${
            activeTab === "products"
              ? "bg-[#302324] text-white"
              : "text-[#7A6B6D] hover:text-[#302324]"
          }`}
        >
          Ordered Products
        </button>
      </div>

      <section
        role="tabpanel"
        hidden={activeTab !== "orders"}
        className="mt-6"
      >
        {children}
      </section>

      <section
        role="tabpanel"
        hidden={activeTab !== "products"}
        className="mt-6"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E7DDDD] bg-white p-5">
            <p className="text-sm text-[#7A6B6D]">All units ordered</p>
            <p className="mt-3 text-2xl font-bold text-[#302324]">
              {totalUnits.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-xs text-[#7A6B6D]">
              Includes cancelled orders
            </p>
          </div>

          <div className="rounded-2xl border border-[#E7DDDD] bg-white p-5">
            <p className="text-sm text-[#7A6B6D]">Non-cancelled units</p>
            <p className="mt-3 text-2xl font-bold text-[#302324]">
              {nonCancelledUnits.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-xs text-[#7A6B6D]">
              Orders not marked cancelled
            </p>
          </div>

          <div className="rounded-2xl border border-[#E7DDDD] bg-white p-5">
            <p className="text-sm text-[#7A6B6D]">Non-cancelled item value</p>
            <p className="mt-3 break-words text-2xl font-bold text-[#302324]">
              {formatPrice(nonCancelledValue)}
            </p>
            <p className="mt-2 text-xs text-[#7A6B6D]">
              Excludes delivery fees
            </p>
          </div>
        </div>

        <h2 className="mt-8 text-2xl font-bold text-[#302324]">
          Product-wise Summary
        </h2>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#E7DDDD] bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#FCF9F9] text-xs uppercase tracking-wide text-[#7A6B6D]">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">All units</th>
                <th className="px-5 py-4">Non-cancelled units</th>
                <th className="px-5 py-4">Cancelled units</th>
                <th className="px-5 py-4">Item value</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E7DDDD]">
              {summary.map((product, index) => (
                <tr key={`${product.name}-${index}`}>
                  <td className="px-5 py-4 font-medium text-[#302324]">
                    {product.name}
                  </td>
                  <td className="px-5 py-4">{product.allUnits}</td>
                  <td className="px-5 py-4">{product.activeUnits}</td>
                  <td className="px-5 py-4">{product.cancelledUnits}</td>
                  <td className="px-5 py-4 font-semibold text-[#302324]">
                    {formatPrice(product.activeValue)}
                  </td>
                </tr>
              ))}

              {summary.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-[#7A6B6D]"
                  >
                    No ordered products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-2xl font-bold text-[#302324]">
          Individual Order Items
        </h2>

        <div className="mt-4 space-y-4">
          {orderedItems.map((item, index) => {
            const order = item.orders;
            if (!order) return null;

            const product = getProduct(item);
            const cancelled = order.status.toLowerCase() === "cancelled";

            return (
              <article
                key={`${order.id}-${index}`}
                className="rounded-2xl border border-[#E7DDDD] bg-white p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-[#302324]">
                      {product?.name ?? "Unavailable product"}
                    </h3>
                    <p className="mt-1 text-sm text-[#7A6B6D]">
                      Quantity: {item.quantity}
                    </p>
                    <p className="mt-1 text-sm text-[#7A6B6D]">
                      Unit price at purchase: {formatPrice(item.price)}
                    </p>
                    <p className="mt-2 font-semibold text-[#302324]">
                      Line total: {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={order.status} />
                    <StatusBadge value={`Payment ${order.payment_status}`} />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 border-t border-[#E7DDDD] pt-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#7A6B6D]">
                      Order ID
                    </p>
                    <p className="mt-1 break-all font-mono text-xs text-[#302324]">
                      {order.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#7A6B6D]">
                      Customer
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#302324]">
                      {order.customer_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#7A6B6D]">
                      Order date
                    </p>
                    <p className="mt-1 text-sm text-[#302324]">
                      {formatDate(order.created_at)}
                    </p>
                    {cancelled && (
                      <p className="mt-2 text-xs font-medium text-red-700">
                        Excluded from non-cancelled totals
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {orderedItems.length === 0 && (
            <div className="rounded-2xl border border-[#E7DDDD] p-8 text-center text-[#7A6B6D]">
              No ordered products yet.
            </div>
          )}
        </div>

        <p className="mt-6 text-xs leading-5 text-[#7A6B6D]">
          Item values use the recorded purchase price multiplied by quantity.
          Non-cancelled orders may still have pending or rejected payments, so
          these figures are not confirmed revenue.
        </p>
      </section>
    </div>
  );
}
