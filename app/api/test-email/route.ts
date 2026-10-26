
import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: "KaizenCollectionss <onboarding@resend.dev>",
      to: ["jnishaera@gmail.com"],
      subject: "KaizenCollectionss — Email Test",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#302324">
          <h1 style="color:#302324">It works! 🌸</h1>
          <p>Your KaizenCollectionss email service has been connected successfully.</p>
          <p>This is a test email. No customer order has been created or changed.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend test failed:", error.name, error.statusCode);

      return NextResponse.json(
        { error: "Resend could not send the test email." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch {
    console.error("Unexpected email test failure");

    return NextResponse.json(
      { error: "Unable to send the test email." },
      { status: 500 }
    );
  }
}
