
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RequestedItem = {
  productId: string;
  quantity: number;
};

type UnavailableItem = {
  productId: string;
  name: string;
  stock: number;
  requestedQuantity: number;
  reason: "out_of_stock" | "insufficient_stock" | "product_unavailable";
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body ||
      !Array.isArray(body.items) ||
      body.items.length === 0 ||
      body.items.length > 100
    ) {
      return NextResponse.json(
        { error: "Your cart is empty or invalid." },
        { status: 400 }
      );
    }

    const items: RequestedItem[] = [];
    const seenIds = new Set<string>();

    for (const item of body.items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !item.productId.trim() ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99 ||
        seenIds.has(item.productId)
      ) {
        return NextResponse.json(
          {
            error:
              "Your cart contains invalid items. Please refresh it.",
          },
          { status: 400 }
        );
      }

      seenIds.add(item.productId);

      items.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    const supabase = await createClient();
    const productIds = items.map((item) => item.productId);

    const [
      { data: products, error: productsError },
      { data: settings, error: settingsError },
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, price, mrp, stock")
        .in("id", productIds),
      supabase
        .from("delivery_settings")
        .select(
          "free_delivery_enabled, delivery_fee, promo_message"
        )
        .eq("id", 1)
        .maybeSingle(),
    ]);

    if (productsError || !products) {
      console.error(
        "Checkout summary product lookup failed:",
        productsError
      );

      return NextResponse.json(
        {
          error:
            "Could not load current product prices. Please try again.",
        },
        { status: 500 }
      );
    }

    if (settingsError || !settings) {
      console.error(
        "Checkout delivery settings lookup failed:",
        settingsError
      );

      return NextResponse.json(
        {
          error:
            "Could not load delivery settings. Please try again.",
        },
        { status: 500 }
      );
    }

    const lines: {
      productId: string;
      name: string;
      mrp: number;
      price: number;
      quantity: number;
      originalLineTotal: number;
      lineTotal: number;
      productSavings: number;
      discountPercent: number;
    }[] = [];

    const unavailableItems: UnavailableItem[] = [];

    for (const item of items) {
      const product = products.find(
        (candidate) => candidate.id === item.productId
      );

      if (!product) {
        unavailableItems.push({
          productId: item.productId,
          name: "Product no longer available",
          stock: 0,
          requestedQuantity: item.quantity,
          reason: "product_unavailable",
        });

        continue;
      }

      if (
        !Number.isSafeInteger(product.stock) ||
        product.stock <= 0
      ) {
        unavailableItems.push({
          productId: product.id,
          name: product.name,
          stock: 0,
          requestedQuantity: item.quantity,
          reason: "out_of_stock",
        });

        continue;
      }

      if (product.stock < item.quantity) {
        unavailableItems.push({
          productId: product.id,
          name: product.name,
          stock: product.stock,
          requestedQuantity: item.quantity,
          reason: "insufficient_stock",
        });

        continue;
      }

      if (
        !Number.isSafeInteger(product.price) ||
        product.price <= 0
      ) {
        throw new Error(
          `${product.name} has an invalid selling price.`
        );
      }

      const mrp = product.mrp ?? product.price;

      if (
        !Number.isSafeInteger(mrp) ||
        mrp < product.price
      ) {
        throw new Error(
          `${product.name} has invalid MRP data. Please contact the store.`
        );
      }

      const originalLineTotal = mrp * item.quantity;
      const lineTotal = product.price * item.quantity;
      const productSavings = originalLineTotal - lineTotal;

      const discountPercent =
        mrp > 0
          ? Math.round(((mrp - product.price) / mrp) * 100)
          : 0;

      if (
        !Number.isSafeInteger(originalLineTotal) ||
        !Number.isSafeInteger(lineTotal) ||
        !Number.isSafeInteger(productSavings)
      ) {
        throw new Error("The cart total is too large.");
      }

      lines.push({
        productId: product.id,
        name: product.name,
        mrp,
        price: product.price,
        quantity: item.quantity,
        originalLineTotal,
        lineTotal,
        productSavings,
        discountPercent,
      });
}

    const subtotal = lines.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );

    const originalSubtotal = lines.reduce(
      (sum, item) => sum + item.originalLineTotal,
      0
    );

    const productSavings = originalSubtotal - subtotal;
    const deliveryFeeListPrice = settings.delivery_fee;

    const hasAvailableProducts = lines.length > 0;

    const freeDeliveryApplied =
      hasAvailableProducts && settings.free_delivery_enabled;

    const deliveryFee = !hasAvailableProducts
      ? 0
      : freeDeliveryApplied
        ? 0
        : deliveryFeeListPrice;

    const deliverySavings = freeDeliveryApplied
      ? deliveryFeeListPrice
      : 0;
    const totalSavings = productSavings + deliverySavings;
    const total = subtotal + deliveryFee;

    if (
      !Number.isSafeInteger(subtotal) ||
      !Number.isSafeInteger(originalSubtotal) ||
      !Number.isSafeInteger(totalSavings) ||
      !Number.isSafeInteger(total) ||
      total < 0 ||
      total > 2_147_483_647
    ) {
      return NextResponse.json(
        { error: "The order total is invalid or too large." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      items: lines,
      unavailableItems,
      originalSubtotal,
      subtotal,
      productSavings,
      deliveryFee,
      deliveryFeeListPrice,
      deliverySavings,
      freeDeliveryApplied,
      deliveryMessage: freeDeliveryApplied
        ? settings.promo_message
        : null,
      totalSavings,
      total,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not calculate your order summary.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
