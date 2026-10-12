"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function AccountSignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.replace("/account");
      router.refresh();
      return;
    }

    setMessage(
      "Account created. Please check your email to confirm your account."
    );

    setLoading(false);
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-16">
      <div className="w-full">
        <Link
          href="/"
          className="text-sm font-medium text-[#7A6B6D] hover:text-[#302324]"
        >
          ← Back to store
        </Link>

        <div className="mt-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
            Account
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324]">
            Create an account
          </h1>

          <p className="mt-4 text-[#7A6B6D]">
            Create an account to keep track of your orders.
          </p>
        </div>

        <form onSubmit={handleSignup} className="mt-10 space-y-5">
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
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 text-[#302324] outline-none focus:border-[#E1ACB0]"
              placeholder="you@example.com"
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
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 text-[#302324] outline-none focus:border-[#E1ACB0]"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-green-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#302324] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#211819] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#7A6B6D]">
          Already have an account?{" "}
          <Link
            href="/account/login"
            className="font-semibold text-[#302324] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}