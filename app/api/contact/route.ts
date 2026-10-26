import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 12 * 1024;

type EnquiryType = "general" | "bug";

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

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

    const {
      name,
      email,
      orderId,
      subject,
      message,
      enquiryType: rawEnquiryType,
      affectedPage,
      stepsToReproduce,
    } = data;

    const enquiryType: EnquiryType =
      rawEnquiryType === undefined ? "general" : (rawEnquiryType as EnquiryType);

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof orderId !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string" ||
      (enquiryType !== "general" && enquiryType !== "bug") ||
      (affectedPage !== undefined && typeof affectedPage !== "string") ||
      (stepsToReproduce !== undefined &&
        typeof stepsToReproduce !== "string")
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
      affectedPage:
        typeof affectedPage === "string" ? affectedPage.trim() : "",
      stepsToReproduce:
        typeof stepsToReproduce === "string"
          ? stepsToReproduce.trim()
          : "",
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
      clean.message.length > 5000 ||
      clean.affectedPage.length > 1000 ||
      clean.stepsToReproduce.length > 2000
    ) {
      return NextResponse.json(
        { error: "Please check your details and try again." },
        { status: 400 }
      );
    }

    if (
      enquiryType === "bug" &&
      (!clean.affectedPage ||
        !isValidHttpUrl(clean.affectedPage) ||
        clean.stepsToReproduce.length < 10)
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid page URL and at least 10 characters describing how to reproduce the issue.",
        },
        { status: 400 }
      );
    }

    const savedSubject =
      enquiryType === "bug" ? `[BUG REPORT] ${clean.subject}` : clean.subject;

    const savedMessage =
      enquiryType === "bug"
        ? [
            "Type: Bug report",
            `Affected page: ${clean.affectedPage}`,
            "",
            "Steps to reproduce:",
            clean.stepsToReproduce,
            "",
            "Additional details:",
            clean.message,
          ].join("\n")
        : clean.message;

    const supabase = await createClient();

    const { error } = await supabase.from("contact_messages").insert({
      name: clean.name,
      email: clean.email,
      order_id: enquiryType === "general" ? clean.orderId || null : null,
      subject: savedSubject,
      message: savedMessage,
    });

    if (error) {
      console.error("Contact message save failed:", error);

      return NextResponse.json(
        { error: "We couldn't save your message. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          enquiryType === "bug"
            ? "Your bug report has been received."
            : "Your message has been received.",
      },
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
