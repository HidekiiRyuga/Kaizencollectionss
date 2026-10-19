import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Returns, Refunds & Cancellations",
  description:
    "Learn about returns, refunds, and order cancellations at KaizenCollectionss.",
};

const policies = [
  {
    title: "1. Returns & Refunds",
    content: (
      <p>
        We generally accept returns or refunds for products that arrive
        damaged or defective. We don&apos;t usually accept returns for
        change of mind or choosing the wrong product, unless required by law.
      </p>
    ),
  },
  {
    title: "2. Report a Problem",
    content: (
      <>
        <p>
          Please contact us within <strong>7 days of delivery</strong>,
          where reasonably possible.
        </p>
        <p>Please include:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your order ID</li>
          <li>A short description of the problem</li>
          <li>Photos or videos showing the issue</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Unboxing Video",
    content: (
      <p>
        A continuous unboxing video is compulsory for damaged or defective
        product claims. It should clearly show the unopened package, the
        opening process, and the product&apos;s condition. Claims submitted
        without an unboxing video may not be accepted, subject to applicable
        consumer-protection laws.
      </p>
    ),
  },
  {
    title: "4. Replacement or Refund",
    content: (
      <p>
        If your damaged or defective product claim is approved, you may
        choose a replacement or refund, subject to applicable law.
        Replacements depend on stock availability. Refunds will usually be
        sent to your original payment method. We&apos;ll explain any return
        arrangements and applicable shipping costs.
      </p>
    ),
  },
  {
    title: "5. Order Cancellation",
    content: (
      <p>
        You can request cancellation <strong>before your order ships</strong>{" "}
        by emailing us with your order ID. Once your order has shipped,
        cancellation may not be possible through our standard process.
        Any eligible refund will follow applicable law.
      </p>
    ),
  },
  {
    title: "6. Refund Timeline",
    content: (
      <p>
        Once your refund is approved, we&apos;ll initiate it as required.
        The time it takes to reach your account depends on your bank or
        payment provider.
      </p>
    ),
  },
  {
    title: "7. Other Order Issues",
    content: (
      <p>
        Received the wrong item, or is something missing? Contact us with
        your order ID and details. We&apos;ll review the issue and help find
        an appropriate solution.
      </p>
    ),
  },
];

const supportEmail = "akiyamashinichiiiii@gmail.com";

export default function ReturnsRefundsPage() {
  return (
    <>
      <main className="w-full flex-1 bg-[#FCF9F9] px-4 py-10 sm:px-6 sm:py-14">
        <article className="mx-auto w-full max-w-3xl">
          {/* Page heading */}
          <header className="mb-8 border-b border-[#E7DDDD] pb-7 sm:mb-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#B58F92]">
              Customer Support
            </p>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#302324] sm:text-4xl">
              Returns, Refunds &amp; Cancellations
            </h1>

            <p className="mt-4 text-sm leading-6 text-[#7A6B6D]">
              At KaizenCollectionss, we want you to be happy with your
              order. If something goes wrong, here&apos;s how we can help.
            </p>

            <p className="mt-4 text-xs text-[#7A6B6D]">
              Last updated: 19 October 2026
            </p>
          </header>

          {/* Policy sections */}
          <div className="space-y-8 text-sm leading-7 text-[#514447] sm:space-y-9 sm:text-base">
            {policies.map((policy) => (
              <section key={policy.title} className="space-y-3">
                <h2 className="text-lg font-semibold tracking-tight text-[#302324] sm:text-xl">
                  {policy.title}
                </h2>

                {policy.content}
              </section>
            ))}

            {/* Contact */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-[#302324] sm:text-xl">
                8. Contact Us
              </h2>

              <p>
                Need help with an order? We&apos;re happy to hear from you.
                Reach out to our support team:
              </p>

              <div className="rounded-2xl border border-[#E7DDDD] bg-white p-5 sm:p-6">
                <p className="font-semibold text-[#302324]">
                  KaizenCollectionss
                </p>

                <Link
                  href={`mailto:${supportEmail}`}
                  className="mt-2 inline-block break-all text-[#8F6268] underline decoration-[#E1ACB0] underline-offset-4 transition-colors hover:text-[#302324] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E1ACB0] focus-visible:ring-offset-2"
                >
                  {supportEmail}
                </Link>
              </div>
            </section>
          </div>

          {/* Legal note */}
          <div className="mt-10 rounded-2xl border border-[#E7DDDD] bg-white/70 p-5 text-xs leading-6 text-[#7A6B6D] sm:p-6 sm:text-sm">
            This policy does not limit any rights or remedies available to
            customers under applicable consumer-protection laws.
          </div>
        </article>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}