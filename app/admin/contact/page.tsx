import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Bug, Mail } from "lucide-react";

export default async function AdminContactPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || !isAdmin) {
    redirect("/");
  }

  const { data: messages, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, order_id, subject, message, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch contact messages:", error);
  }

  const items = messages ?? [];

  return (
    <main className="mx-auto w-full max-w-[1500px] px-6 py-12 sm:px-8 lg:px-12 lg:py-16 xl:px-16">
      <Link
        href="/admin"
        className="text-sm font-medium text-[#7A6B6D] hover:text-[#302324]"
      >
        ← Back to dashboard
      </Link>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B98289]">
          Admin
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
          Contact Messages
        </h1>

        <p className="mt-4 text-[#7A6B6D]">
          Read customer enquiries and bug reports submitted through your website.
        </p>
      </div>

      {error ? (
        <p className="mt-10 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          We couldn&apos;t load contact messages. Please try again.
        </p>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-[#E7DDDD] p-8">
          <h2 className="text-lg font-semibold text-[#302324]">
            No messages yet
          </h2>
          <p className="mt-2 text-sm text-[#7A6B6D]">
            New contact form submissions and bug reports will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-5">
          <p className="text-sm text-[#7A6B6D]">
            {items.length} {items.length === 1 ? "message" : "messages"}
          </p>

          {items.map((item) => {
            const isBugReport = item.subject.startsWith("[BUG REPORT]");
            const displaySubject = isBugReport
              ? item.subject.replace(/^\[BUG REPORT\]\s*/, "")
              : item.subject;

            return (
              <article
                key={item.id}
                className={`rounded-2xl border bg-white p-5 sm:p-7 ${
                  isBugReport
                    ? "border-[#E1ACB0]"
                    : "border-[#E7DDDD]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {isBugReport && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE5EC] px-3 py-1 text-xs font-semibold text-[#8B304C]">
                          <Bug size={13} />
                          Bug report
                        </span>
                      )}

                      <span className="rounded-full bg-[#F5F0F0] px-3 py-1 text-xs font-semibold capitalize text-[#5E5052]">
                        {item.status}
                      </span>
                    </div>

                    <h2 className="break-words text-lg font-semibold text-[#302324]">
                      {displaySubject}
                    </h2>

                    <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#7A6B6D]">
                      <Mail size={14} />
                      <span>From {item.name}</span>
                      <span aria-hidden="true">·</span>
                      <a
                        href={`mailto:${item.email}`}
                        className="break-all underline underline-offset-4 hover:text-[#302324]"
                      >
                        {item.email}
                      </a>
                    </p>
                  </div>
                </div>

                <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-[#5E5052]">
                  {item.message}
                </p>

                {item.order_id && (
                  <p className="mt-4 text-sm text-[#7A6B6D]">
                    Order ID:{" "}
                    <span className="font-medium text-[#302324]">
                      {item.order_id}
                    </span>
                  </p>
                )}

                <p className="mt-5 border-t border-[#E7DDDD] pt-4 text-xs text-[#7A6B6D]">
                  Received{" "}
                  {new Date(item.created_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Kolkata",
                  })}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}