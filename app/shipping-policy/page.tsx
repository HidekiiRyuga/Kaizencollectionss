
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Learn about shipping coverage, charges, order processing and delivery at KaizenCollectionss.",
};

const policies = [
  {
    title: "1. Shipping Coverage",
    content: (
      <p>
        KaizenCollectionss currently offers shipping across India,
        subject to courier service availability at the delivery
        address. We aim to make our products accessible to customers
        throughout the country.
      </p>
    ),
  },
  {
    title: "2. Shipping Charges",
    content: (
      <>
        <p>
          A fixed shipping fee is applicable to every order.
          The applicable amount will be displayed during checkout
          before you confirm your purchase.
        </p>
        <p>
          Shipping charges are not currently based on a free-shipping
          threshold or different location-based pricing.
        </p>
        <p>
          Please review the final order summary before placing
          your order.
        </p>
      </>
    ),
  },
  {
    title: "3. Order Processing",
    content: (
      <p>
        Orders are processed after successful order placement
        and any required payment verification. Processing may
        take additional time depending on product availability,
        order volume and operational requirements. We will
        communicate relevant updates where possible.
      </p>
    ),
  },
  {
    title: "4. Dispatch and Delivery Time",
    content: (
      <p>
        Delivery time may vary depending on the destination,
        courier operations, transportation conditions, holidays
        and other logistical factors. Any delivery estimate
        communicated to a customer is indicative and should
        not be treated as a guaranteed delivery date.
      </p>
    ),
  },
  {
    title: "5. Order Tracking",
    content: (
      <p>
        Where tracking information is available from the courier,
        we will share the relevant tracking details with the
        customer after dispatch. Customers may contact us if
        they need assistance checking their order status.
      </p>
    ),
  },
  {
    title: "6. Accurate Delivery Information",
    content: (
      <>
        <p>
          Customers are responsible for providing complete
          and accurate delivery information during checkout.
          This includes:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Full recipient name.</li>
          <li>Correct phone number.</li>
          <li>Complete house, street and locality details.</li>
          <li>City, state and correct PIN code.</li>
          <li>Any additional delivery instructions required.</li>
        </ul>
        <p>
          Incorrect or incomplete information may result in
          delivery delays, failed delivery attempts or the
          return of a parcel.
        </p>
      </>
    ),
  },
  {
    title: "7. Delays and Delivery Issues",
    content: (
      <>
        <p>
          Delays may occur due to circumstances such as:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Courier or transportation disruptions.</li>
          <li>Weather conditions or natural events.</li>
          <li>Public holidays and operational closures.</li>
          <li>Incorrect or incomplete delivery information.</li>
          <li>Other circumstances beyond our reasonable control.</li>
        </ul>
        <p>
          If your order is delayed or you experience a delivery
          issue, please contact us with your order ID so that
          we can review the situation and assist you.
        </p>
      </>
    ),
  },
  {
    title: "8. Failed or Undelivered Orders",
    content: (
      <p>
        If a delivery attempt fails or a parcel is returned
        to us, we will review the circumstances and contact
        the customer where appropriate. Any further shipping,
        cancellation or refund arrangements will be handled
        in accordance with our applicable order policies
        and consumer-protection requirements.
      </p>
    ),
  },
  {
    title: "9. Damaged Packages",
    content: (
      <p>
        If your package arrives visibly damaged or the product
        inside is damaged or defective, please contact us
        promptly with your order ID and supporting photographs
        or videos. Please refer to our Returns, Refunds &amp;
        Cancellations Policy for the procedure to report
        damaged or defective products.
      </p>
    ),
  },
  {
    title: "10. Changes to This Policy",
    content: (
      <p>
        We may update this Shipping Policy to reflect changes
        in our delivery arrangements, courier services or
        business operations. Any revised version will be
        published on this page with an updated last-updated date.
      </p>
    ),
  },
];

const supportEmail = "kaizencollectionss@gmail.com";

export default function ShippingPolicyPage() {
  return (
    <>
      <main className="w-full flex-1 bg-[#FCF9F9] px-4 py-10 sm:px-6 sm:py-14">
        <article className="mx-auto w-full max-w-3xl">
          <header className="mb-8 border-b border-[#E7DDDD] pb-7 sm:mb-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#B58F92]">
              Customer Support
            </p>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#302324] sm:text-4xl">
              Shipping Policy
            </h1>

            <p className="mt-4 text-sm leading-6 text-[#7A6B6D]">
              We aim to deliver your KaizenCollectionss orders
              safely and conveniently. Here's what you need
              to know about shipping, delivery and order tracking.
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
                11. Contact Us
              </h2>

              <p>
                Need help with shipping or delivery? Contact our
                support team with your order ID:
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
            This policy should be read together with our Terms
            &amp; Conditions and Returns, Refunds &amp;
            Cancellations Policy. Nothing here limits any
            rights available to customers under applicable law.
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
