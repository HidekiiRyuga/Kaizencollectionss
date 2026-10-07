import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      customerName,
      phone,
      address,
      items,
    } = body;

    if (
      typeof customerName !== "string" ||
      typeof phone !== "string" ||
      typeof address !== "string" ||
      !Array.isArray(items)
    ) {
      return NextResponse.json(
        { error: "Invalid order data." },
        { status: 400 }
      );
    }

    if (
      customerName.trim().length < 2 ||
      phone.trim().length < 10 ||
      address.trim().length < 10
    ) {
      return NextResponse.json(
        { error: "Please provide valid customer information." },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    const cleanedItems = items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    }));

    const { data: orderId, error } = await supabase.rpc(
      "create_order",
      {
        p_customer_name: customerName,
        p_phone: phone,
        p_address: address,
        p_items: cleanedItems,
      }
    );

    if (error) {
      console.error("Order creation failed:", error);

      return NextResponse.json(
        { error: "Failed to create order." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        orderId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order API error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}