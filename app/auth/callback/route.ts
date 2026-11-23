
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createClient();

  let error = null;

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;
  } else if (tokenHash && type === "recovery") {
    const result = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });
    error = result.error;
  } else {
    error = new Error("Missing recovery credentials.");
  }

  if (error) {
    console.error("Authentication callback error:", error);

    return NextResponse.redirect(
      `${origin}/admin/login?error=recovery_failed`
    );
  }

  return NextResponse.redirect(
    `${origin}/admin/reset-password`
  );
}
