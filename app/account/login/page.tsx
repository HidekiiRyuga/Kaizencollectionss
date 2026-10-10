"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function AccountLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace("/account");
    router.refresh();
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
            Welcome back
          </h1>

          <p className="mt-4 text-[#7A6B6D]">
            Sign in to view your orders and manage your account.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-10 space-y-5">
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
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 text-[#302324] outline-none focus:border-[#E1ACB0]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#302324] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#211819] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#7A6B6D]">
          Don't have an account?{" "}
          <Link
            href="/account/signup"
            className="font-semibold text-[#302324] hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}