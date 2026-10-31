
import { NextResponse } from "next/server";
import { isIP } from "node:net";
import { createServiceClient } from "@/lib/supabase/service";
import { trackingRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4096;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getClientRateLimitKey(request: Request): string | null {
  // In local npm run dev, use one shared development key.
  if (process.env.NODE_ENV !== "production") {
    return "local-development";
  }

  // Vercel overwrites this header with the client's public IP.
  // Reject missing, malformed, or unexpected multi-value headers.
  const forwardedFor = request.headers.get("x-forwarded-for")?.trim();

  if (!forwardedFor || forwardedFor.includes(",")) {
    return null;
  }

  if (isIP(forwardedFor) === 0) {
    return null;
  }

  return `ip:${forwardedFor}`;
}

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get("content-length");

    if (contentLength !== null) {
      const declaredLength = Number(contentLength);

      if (
        !Number.isSafeInteger(declaredLength) ||
        declaredLength < 0
      ) {
        return errorResponse("Invalid request.", 400);
      }

      if (declaredLength > MAX_BODY_BYTES) {
        return errorResponse("Request too large.", 413);
      }
    }

    const reader = request.body?.getReader();

    if (!reader) {
      return errorResponse("Invalid request.", 400);
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        totalBytes += value.byteLength;

        if (totalBytes > MAX_BODY_BYTES) {
          await reader.cancel();
          return errorResponse("Request too large.", 413);
        }

        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const bytes = new Uint8Array(totalBytes);
    let offset = 0;

    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    let body: unknown;

    try {
      body = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return errorResponse("Invalid request.", 400);
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return errorResponse("Invalid request.", 400);
    }

    // Apply rate limiting before validating credentials,
    // so malformed lookup attempts count too.
    const key = getClientRateLimitKey(request);

    if (!key) {
      return errorResponse(
        "Unable to process your request right now.",
        503
      );
    }

    let limitResult;

    try {
      limitResult = await trackingRateLimit.limit(key);
    } catch {
      // Fail closed if the rate limiter is unavailable.
      console.error("Order tracking rate limiter unavailable.");

      return errorResponse(
        "Order tracking is temporarily unavailable. Please try again shortly.",
        503
      );
    }

    if (!limitResult.success) {
      const retryAfter = Math.max(
        1,
        Math.ceil((limitResult.reset - Date.now()) / 1000)
      );

      return NextResponse.json(
        {
          error: "Too many tracking attempts. Please try again shortly.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    const input = body as Record<string, unknown>;

    const orderId =
      typeof input.orderId === "string"
        ? input.orderId.trim()
        : "";

    const phone =
      typeof input.phone === "string"
        ? input.phone.trim()
        : "";

    if (!UUID_REGEX.test(orderId)) {
      return errorResponse(
        "Enter a valid order ID and phone number.",
        400
      );
    }

    const normalizedPhone = phone.replace(/\D/g, "");

    if (
      normalizedPhone.length < 10 ||
      normalizedPhone.length > 15
    ) {
      return errorResponse(
        "Enter a valid order ID and phone number.",
        400
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase.rpc(
      "track_order_lookup",
      {
        p_order_id: orderId,
        p_phone: phone,
      }
    );

    if (error) {
      console.error("Order tracking lookup failed.");

      return errorResponse(
        "Unable to check your order right now. Please try again.",
        500
      );
    }

    if (!data) {
      return errorResponse(
        "We couldn't find an order matching those details. Please check your order ID and phone number.",
        404
      );
    }

    return NextResponse.json({
      order: {
        order_id: data.order_id,
        status: data.status,
        created_at: data.created_at,
        shipping_courier: data.shipping_courier,
        tracking_number: data.tracking_number,
      },
    });
  } catch {
    return errorResponse(
      "Something went wrong. Please try again.",
      500
    );
  }
}
