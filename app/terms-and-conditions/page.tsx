
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the terms and conditions governing purchases and use of KaizenCollectionss.",
};

const policies = [
  {
    title: "1. Introduction",
    content: (
      <p>
        Welcome to KaizenCollectionss. These Terms &amp; Conditions
        govern your access to and use of our website, products and
        services. By accessing our website or placing an order, you
        agree to these terms. If you do not agree, please discontinue
        using our website.
      </p>
    ),
  },
  {
    title: "2. Eligibility and Website Use",
    content: (
      <>
        <p>
          By using our website, you confirm that you are legally
          permitted to enter into a purchase transaction under
          applicable laws.
        </p>
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Use the website for unlawful or fraudulent purposes.</li>
          <li>Provide false, misleading or incomplete information.</li>
          <li>Attempt unauthorized access to our website, accounts or systems.</li>
          <li>Interfere with the website's functionality or security.</li>
          <li>Use our website in a way that harms other customers or our business.</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Products and Availability",
    content: (
      <p>
        We make reasonable efforts to display product descriptions,
        images and information accurately. However, minor differences
        in colours, appearance or presentation may occur due to
        screen settings, photography or product variations. All
        products are subject to availability. Product listings,
        prices and availability may change without prior notice.
      </p>
    ),
  },
  {
    title: "4. Pricing and Orders",
    content: (
      <>
        <p>
          Prices are displayed on the website in Indian Rupees (INR),
          unless stated otherwise. Applicable shipping charges will
          be displayed during checkout before you confirm your order.
        </p>
        <p>
          Placing an order constitutes a request to purchase the
          selected products. An order is subject to verification,
          product availability and successful completion of the
          applicable payment process.
        </p>
        <p>
          We reserve the right to contact you if clarification is
          needed regarding your order.
        </p>
      </>
    ),
  },
  {
    title: "5. Payments and Verification",
    content: (
      <>
        <p>
          We currently support the payment methods presented during
          checkout. Where manual UPI payment is offered, customers
          must follow the displayed payment instructions and provide
          the requested transaction reference or UTR for verification.
        </p>
        <p>
          An order requiring manual verification may remain pending
          until the payment has been successfully checked. Submitting
          a payment reference alone does not constitute confirmation
          that payment has been received.
        </p>
        <p>
          Never share your UPI PIN, banking password or OTP with
          anyone claiming to represent KaizenCollectionss.
        </p>
      </>
    ),
  },
  {
    title: "6. Order Processing and Delivery",
    content: (
      <p>
        Orders are processed subject to payment verification,
        product availability and the information supplied at
        checkout. Delivery is available across India, subject to
        service availability at the destination. Shipping charges
        and applicable delivery information are displayed during
        checkout. Please refer to our Shipping Policy for further
        details.
      </p>
    ),
  },
  {
    title: "7. Cancellations, Returns and Refunds",
    content: (
      <p>
        Order cancellations, returns and refunds are governed by
        our Returns, Refunds &amp; Cancellations Policy. Please
        review that policy before placing an order. Nothing in
        these Terms &amp; Conditions is intended to remove any
        rights available to customers under applicable law.
      </p>
    ),
  },
  {
    title: "8. Customer Responsibilities",
    content: (
      <>
        <p>You are responsible for:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Providing accurate contact and delivery information.</li>
          <li>Reviewing your cart and order details before checkout.</li>
          <li>Following the payment instructions provided during checkout.</li>
          <li>Keeping your account credentials and verification details confidential.</li>
          <li>Contacting us promptly if you notice an issue with your order.</li>
        </ul>
      </>
    ),
  },
  {
    title: "9. Intellectual Property",
    content: (
      <p>
        Unless otherwise stated, the website's original text,
        branding, design elements, graphics and other original
        content are owned by or used by KaizenCollectionss with
        appropriate permission. They may not be copied, reproduced,
        distributed or commercially used without prior authorization.
        Product artwork, character names, logos and third-party
        materials may belong to their respective owners.
      </p>
    ),
  },
  {
    title: "10. Website Availability",
    content: (
      <p>
        We aim to keep our website accessible and functioning
        properly. However, temporary interruptions may occur due
        to maintenance, technical issues, hosting problems or
        circumstances beyond our control. We do not guarantee
        uninterrupted or error-free access at all times.
      </p>
    ),
  },
  {
    title: "11. Limitation of Liability",
    content: (
      <p>
        To the extent permitted by applicable law, KaizenCollectionss
        shall not be responsible for indirect or consequential losses
        arising from the use or temporary unavailability of the
        website, or from events beyond our reasonable control.
        Nothing in these terms excludes liability that cannot
        legally be excluded or limits any statutory consumer rights.
      </p>
    ),
  },
  {
    title: "12. Changes to These Terms",
    content: (
      <p>
        We may revise these Terms &amp; Conditions when our services,
        business practices or legal requirements change. Updated
        terms will be published on this page with a revised
        last-updated date. Continued use of the website after
        changes are published constitutes acceptance of the
        updated terms to the extent permitted by applicable law.
      </p>
    ),
  },
  {
    title: "13. Governing Law and Disputes",
    content: (
      <p>
        These terms are governed by the laws of India. Any disputes
        arising in connection with the use of our website or
        purchases will be addressed in accordance with applicable
        Indian law and the jurisdiction of competent courts.
        This provision does not restrict consumer rights or
        remedies available under applicable law.
      </p>
    ),
  },
];

const supportEmail = "kaizencollectionss@gmail.com";

export default function TermsAndConditionsPage() {
  return (
    <>
      <main className="w-full flex-1 bg-[#FCF9F9] px-4 py-10 sm:px-6 sm:py-14">
        <article className="mx-auto w-full max-w-3xl">
          <header className="mb-8 border-b border-[#E7DDDD] pb-7 sm:mb-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#B58F92]">
              Legal Information
            </p>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#302324] sm:text-4xl">
              Terms &amp; Conditions
            </h1>

            <p className="mt-4 text-sm leading-6 text-[#7A6B6D]">
              Please read these terms carefully before using
              KaizenCollectionss or placing an order. They explain
              the conditions applicable to our website, products
              and services.
            </p>

            <p className="mt-4 text-xs text-[#7A6B6D]">
              Last updated: 23 November 2026
            </p>
          </header>

          <div className="space-y-8 text-sm leading-7 text-[#514447] sm:space-y-9 sm:text-base">
            {policies.map((policy) => (
              <section key={policy.title} className="space-y-3">
                <h2 className="text-lg font-semibold tracking-tight text-[#302324] sm:text-xl">
                  {policy.title}
                </h2>
                {policy.content}
              </section>
            ))}

            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-[#302324] sm:text-xl">
                14. Contact Us
              </h2>

              <p>
                If you have questions about these Terms &amp;
                Conditions, please contact us:
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

          <div className="mt-10 rounded-2xl border border-[#E7DDDD] bg-white/70 p-5 text-xs leading-6 text-[#7A6B6D] sm:p-6 sm:text-sm">
            These terms should be read together with our Privacy
            Policy, Shipping Policy and Returns, Refunds &amp;
            Cancellations Policy. Applicable consumer rights
            remain unaffected.
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
