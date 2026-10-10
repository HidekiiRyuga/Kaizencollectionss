import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_REQUEST_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  try {
    
    const contentLength = request.headers.get("content-length");

    if (
      contentLength !== null &&
      (!/^\d+$/.test(contentLength) ||
        Number(contentLength) > MAX_REQUEST_BODY_BYTES)
    ) {
      return NextResponse.json(
        { error: "Request body is too large or invalid." },
        { status: 413 }
      );
    }

    if (!request.body) {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > MAX_REQUEST_BODY_BYTES) {
        await reader.cancel();

        return NextResponse.json(
          { error: "Request body is too large." },
          { status: 413 }
        );
      }

      chunks.push(value);
    }

    const bodyBytes = new Uint8Array(totalBytes);
    let offset = 0;

    for (const chunk of chunks) {
      bodyBytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    let body: unknown;

    try {
      body = JSON.parse(new TextDecoder().decode(bodyBytes));
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }


    if (
      body === null ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Invalid order data." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      customerName,
      phone,
      address,
      items,
      paymentUtr,
    } = body as Record<string, unknown>;

    if (
      typeof customerName !== "string" ||
      typeof phone !== "string" ||
      typeof address !== "string" ||
      !Array.isArray(items) ||
      typeof paymentUtr !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid order data." },
        { status: 400 }
      );
    }

    const trimmedCustomerName = customerName.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();
    const trimmedPaymentUtr = paymentUtr.trim();

    if (
      trimmedCustomerName.length < 2 ||
      trimmedCustomerName.length > 100 ||
      trimmedPhone.length < 10 ||
      trimmedPhone.length > 20 ||
      trimmedAddress.length < 10 ||
      trimmedAddress.length > 500 ||
      trimmedPaymentUtr.length < 6 ||
      trimmedPaymentUtr.length > 100
    ) {
      return NextResponse.json(
        { error: "One or more fields are invalid or too long." },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    const isValidItems = items.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        typeof item.productId === "string" &&
        typeof item.quantity === "number" &&
        Number.isInteger(item.quantity)
    );

    if (!isValidItems) {
      return NextResponse.json(
        { error: "Invalid order items." },
        { status: 400 }
      );
    }

    const cleanedItems = items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    }));

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: orderId, error } = await supabase.rpc("create_order", {
      p_customer_name: trimmedCustomerName,
      p_phone: trimmedPhone,
      p_address: trimmedAddress,
      p_items: cleanedItems,
      p_user_id: user?.id ?? null,
      p_payment_utr: trimmedPaymentUtr,
    });

    if (error) {
      console.error("Order creation failed:", error);

      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "This UPI transaction ID has already been used. Please check your transaction ID and try again.",
          },
          { status: 409 }
        );
      }

      if (
        error.message.includes(
          "One or more products do not have enough stock"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Some products in your cart no longer have enough stock. Please update your cart and try again.",
          },
          { status: 409 }
        );
      }

      if (
        error.message.includes(
          "One or more products do not exist"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "One or more products in your cart are no longer available.",
          },
          { status: 409 }
        );
      }

      if (
        error.message.includes(
          "Invalid product quantity"
        )
      ) {
        return NextResponse.json(
          {
            error: "One or more product quantities are invalid.",
          },
          { status: 400 }
        );
      }

      if (
        error.message.includes(
          "Payment transaction ID is required"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Please enter your UPI transaction ID / UTR.",
          },
          { status: 400 }
        );
      }

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