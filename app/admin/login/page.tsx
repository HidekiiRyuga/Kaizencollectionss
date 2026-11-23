
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const passwordUpdated =
    searchParams.get("password_updated") === "true";

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your admin email first.");
      return;
    }

    setError("");
    setResetMessage("");
    setResetLoading(true);

    const supabase = createClient();

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

    if (resetError) {
      setError(resetError.message);
    } else {
      setResetMessage(
        "If an account exists for this email, a password recovery link has been sent. Please check your inbox."
      );
    }

    setResetLoading(false);
  };

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setResetMessage("");
    setIsLoading(true);

    const supabase = createClient();

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
      setError("Invalid email or password.");
      setIsLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
          KaizenCollectionss
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324]">
          Admin Login
        </h1>

        <p className="mt-3 text-[#7A6B6D]">
          Sign in to manage your store.
        </p>

        {passwordUpdated && (
          <p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            Your password has been updated successfully. Please sign in with your new password.
          </p>
        )}

        <form
          onSubmit={handleLogin}
          className="mt-10 space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-[#302324]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
                setResetMessage("");
              }}
              required
              autoComplete="username"
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
              placeholder="Admin email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#302324]"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
              placeholder="Password"
            />

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading || isLoading}
                className="text-sm font-medium text-[#7A6B6D] underline underline-offset-4 transition-colors hover:text-[#302324] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resetLoading
                  ? "Sending recovery email..."
                  : "Forgot password?"}
              </button>
            </div>
          </div>

          {resetMessage && (
            <p
              role="status"
              className="rounded-xl bg-green-50 px-4 py-3 text-sm leading-6 text-green-700"
            >
              {resetMessage}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || resetLoading}
            className="w-full rounded-full bg-[#302324] px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#211819] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[80vh] items-center justify-center px-6">
          <p className="text-sm text-[#7A6B6D]">
            Loading...
          </p>
        </main>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
