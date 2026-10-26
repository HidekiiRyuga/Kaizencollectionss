"use client";

import { useState, type FormEvent } from "react";
import Footer from "@/components/Footer";
import { Mail, MessageCircle, PackageCheck, Bug } from "lucide-react";

type FormStatus = {
  type: "success" | "error";
  message: string;
} | null;

type EnquiryType = "general" | "bug";

export default function ContactPage() {
  const [status, setStatus] = useState<FormStatus>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enquiryType, setEnquiryType] =
    useState<EnquiryType>("general");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      orderId: String(formData.get("orderId") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      enquiryType,
      affectedPage: String(formData.get("affectedPage") ?? ""),
      stepsToReproduce: String(
        formData.get("stepsToReproduce") ?? ""
      ),
      website: String(formData.get("website") ?? ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "We couldn't send your message. Please try again."
        );
      }

      form.reset();
      setEnquiryType("general");
      setStatus({
        type: "success",
        message:
          enquiryType === "bug"
            ? "Thanks for reporting this issue! We've received your bug report."
            : "Thanks for reaching out! Your message has been sent.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 text-sm text-[#302324] outline-none transition focus:border-[#E1ACB0] focus:ring-2 focus:ring-[#E1ACB0]/20";

  return (
    <>
      <main className="mx-auto w-full max-w-[1500px] px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B98289]">
            Contact KaizenCollectionss
          </p>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl lg:text-6xl">
            We&apos;d love to
            <span className="block">hear from you.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-[#7A6B6D] sm:text-lg">
            Have a question about a product, an order, or something
            else? Send us a message and we&apos;ll get back to you.
          </p>
        </section>

        <section className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <aside className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-[#302324]">
                How can we help?
              </h2>
              <p className="mt-3 max-w-md leading-7 text-[#7A6B6D]">
                Whether you&apos;re curious about something in our
                collection, need help with an order, or have spotted
                a website issue, we&apos;re happy to hear from you.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFE5EC] text-[#302324]">
                  <Mail size={20} strokeWidth={1.7} />
                </span>
                <div>
                  <h3 className="font-semibold text-[#302324]">
                    General enquiries
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#7A6B6D]">
                    Questions, suggestions, and feedback are always
                    welcome.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFE5EC] text-[#302324]">
                  <PackageCheck size={20} strokeWidth={1.7} />
                </span>
                <div>
                  <h3 className="font-semibold text-[#302324]">
                    Order support
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#7A6B6D]">
                    Include your order ID so we can identify your
                    order more easily.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFE5EC] text-[#302324]">
                  <Bug size={20} strokeWidth={1.7} />
                </span>
                <div>
                  <h3 className="font-semibold text-[#302324]">
                    Report a bug
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#7A6B6D]">
                    Found something broken? Tell us what happened
                    so we can investigate.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFE5EC] text-[#302324]">
                  <MessageCircle size={20} strokeWidth={1.7} />
                </span>
                <div>
                  <h3 className="font-semibold text-[#302324]">
                    Your feedback matters
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#7A6B6D]">
                    Your feedback helps us make the store better.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="rounded-2xl border border-[#E7DDDD] bg-[#FCF9F9] p-5 sm:p-8 lg:p-10">
            <h2 className="text-2xl font-semibold text-[#302324]">
              {enquiryType === "bug"
                ? "Report a bug"
                : "Send us a message"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#7A6B6D]">
              {enquiryType === "bug"
                ? "Tell us where the issue occurred and how we can reproduce it."
                : "Fill in the details below and we'll receive your message."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="enquiryType"
                  className="text-sm font-medium text-[#302324]"
                >
                  What do you need help with? *
                </label>
                <select
                  id="enquiryType"
                  name="enquiryType"
                  value={enquiryType}
                  onChange={(event) => {
                    setEnquiryType(event.target.value as EnquiryType);
                    setStatus(null);
                  }}
                  className={inputClass}
                >
                  <option value="general">General enquiry / order support</option>
                  <option value="bug">Report a bug</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-[#302324]"
                >
                  Your name *
                </label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  className={inputClass}
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#302324]"
                >
                  Email address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>

              {enquiryType === "general" && (
                <div>
                  <label
                    htmlFor="orderId"
                    className="text-sm font-medium text-[#302324]"
                  >
                    Order ID{" "}
                    <span className="text-[#7A6B6D]">(optional)</span>
                  </label>
                  <input
                    id="orderId"
                    name="orderId"
                    maxLength={100}
                    className={inputClass}
                    placeholder="If your message is about an order"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="subject"
                  className="text-sm font-medium text-[#302324]"
                >
                  {enquiryType === "bug" ? "Issue summary *" : "Subject *"}
                </label>
                <input
                  id="subject"
                  name="subject"
                  required
                  minLength={3}
                  maxLength={150}
                  className={inputClass}
                  placeholder={
                    enquiryType === "bug"
                      ? "E.g. Checkout button isn't working"
                      : "What can we help you with?"
                  }
                />
              </div>

              {enquiryType === "bug" && (
                <>
                  <div>
                    <label
                      htmlFor="affectedPage"
                      className="text-sm font-medium text-[#302324]"
                    >
                      Page where the issue occurred *
                    </label>
                    <input
                      id="affectedPage"
                      name="affectedPage"
                      type="url"
                      required
                      maxLength={1000}
                      className={inputClass}
                      placeholder="https://example.com/shop"
                    />
                    <p className="mt-2 text-xs leading-5 text-[#7A6B6D]">
                      Copy the page address from your browser.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="stepsToReproduce"
                      className="text-sm font-medium text-[#302324]"
                    >
                      Steps to reproduce *
                    </label>
                    <textarea
                      id="stepsToReproduce"
                      name="stepsToReproduce"
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={4}
                      className={`${inputClass} resize-y`}
                      placeholder={
                        "1. Open the shop page\n2. Add a product to the cart\n3. Click checkout\n4. Describe what went wrong"
                      }
                    />
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-[#302324]"
                >
                  {enquiryType === "bug"
                    ? "Additional details *"
                    : "Message *"}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  className={`${inputClass} resize-y`}
                  placeholder={
                    enquiryType === "bug"
                      ? "What did you expect to happen, and what happened instead?"
                      : "Tell us a little more..."
                  }
                />
              </div>

              {/* Honeypot field for basic bot filtering */}
              <div
                aria-hidden="true"
                className="absolute left-[-10000px] h-px w-px overflow-hidden"
              >
                <label htmlFor="website">Leave this field empty</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {status && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`rounded-xl p-4 text-sm leading-6 ${
                    status.type === "success"
                      ? "bg-[#F0F7F0] text-[#285C35]"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {status.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#302324] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#493638] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting
                  ? "Sending..."
                  : enquiryType === "bug"
                    ? "Submit bug report"
                    : "Send message"}
              </button>

              <p className="text-xs leading-5 text-[#7A6B6D]">
                Please don&apos;t include passwords, payment PINs, or
                other sensitive information.
              </p>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
