
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 12) {
      setError("Your password must contain at least 12 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess("Password updated successfully!");

    await supabase.auth.signOut();

    setTimeout(() => {
      router.replace("/admin/login?password_updated=true");
      router.refresh();
    }, 1500);
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
          KaizenCollectionss
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324]">
          Set New Password
        </h1>

        <p className="mt-3 text-[#7A6B6D]">
          Choose a new password for your admin account.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#302324]"
            >
              New Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={12}
              autoComplete="new-password"
              required
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
              placeholder="At least 12 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-[#302324]"
            >
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              minLength={12}
              autoComplete="new-password"
              required
              className="mt-2 w-full rounded-xl border border-[#E7DDDD] px-4 py-3.5 text-[#302324] outline-none focus:border-[#302324]"
              placeholder="Enter password again"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full rounded-full bg-[#302324] px-6 py-4 text-sm font-semibold text-white hover:bg-[#211819] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating password..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
