
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 12 * 1024;

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get("content-length");

    if (
      contentLength &&
      (!/^\d+$/.test(contentLength) ||
        Number(contentLength) > MAX_BODY_BYTES)
    ) {
      return NextResponse.json(
        { error: "Your message is too large." },
        { status: 413 }
      );
    }

    const rawBody = await request.text();

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Your message is too large." },
        { status: 413 }
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid form data." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    if (typeof data.website === "string" && data.website.trim()) {
      // Silently discard basic honeypot bot submissions.
      return NextResponse.json({ success: true });
    }

    const { name, email, orderId, subject, message } = data;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof orderId !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    const clean = {
      name: name.trim(),
      email: email.trim(),
      orderId: orderId.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };

    if (
      clean.name.length < 2 ||
      clean.name.length > 100 ||
      clean.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email) ||
      clean.orderId.length > 100 ||
      clean.subject.length < 3 ||
      clean.subject.length > 150 ||
      clean.message.length < 10 ||
      clean.message.length > 5000
    ) {
      return NextResponse.json(
        { error: "Please check your details and try again." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("contact_messages")
      .insert({
        name: clean.name,
        email: clean.email,
        order_id: clean.orderId || null,
        subject: clean.subject,
        message: clean.message,
      });

    if (error) {
      console.error("Contact message save failed:", error);

      return NextResponse.json(
        { error: "We couldn't save your message. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Your message has been received." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
