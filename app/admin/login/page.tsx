"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
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
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
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
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
              placeholder="Password"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-[#302324] px-6 py-4 text-sm font-semibold text-white hover:bg-[#211819] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}