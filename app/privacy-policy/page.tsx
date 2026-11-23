
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how KaizenCollectionss collects, uses, stores and protects your personal information.",
};

const policies = [
  {
    title: "1. Information We Collect",
    content: (
      <>
        <p>
          When you use KaizenCollectionss, we may collect information
          necessary to provide our shopping and customer support services.
        </p>

        <p>This may include:</p>

        <ul className="list-disc space-y-1 pl-5">
          <li>Name and contact information, including email address and phone number.</li>
          <li>Delivery address and other information needed to fulfil orders.</li>
          <li>Account and authentication information.</li>
          <li>Order details, purchased products, quantities and transaction amounts.</li>
          <li>Payment verification information, such as a UPI transaction reference or UTR submitted by you.</li>
          <li>Messages, enquiries, feedback and information submitted through our contact forms.</li>
          <li>Technical information required for website functionality, security and troubleshooting.</li>
        </ul>
      </>
    ),
  },
  {
    title: "2. How We Use Your Information",
    content: (
      <>
        <p>We use collected information for purposes including:</p>

        <ul className="list-disc space-y-1 pl-5">
          <li>Processing and managing customer orders.</li>
          <li>Verifying payments and maintaining transaction records.</li>
          <li>Arranging shipping and delivering purchased products.</li>
          <li>Providing order confirmations and updates.</li>
          <li>Responding to customer enquiries and support requests.</li>
          <li>Managing customer accounts and authentication.</li>
          <li>Preventing fraudulent, unauthorized or suspicious activity.</li>
          <li>Maintaining, improving and securing our website and services.</li>
          <li>Meeting applicable legal and regulatory obligations.</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Payments and Payment Information",
    content: (
      <p>
        We may collect payment-related information required to verify
        transactions, including UPI transaction references or UTR details
        submitted by customers. Payment verification may be performed
        manually. We do not request your UPI PIN, banking password or
        one-time password (OTP) through our website or customer support
        channels. Please do not share these confidential credentials with us.
      </p>
    ),
  },
  {
    title: "4. Cookies and Authentication",
    content: (
      <p>
        Our website may use cookies or similar technologies required for
        essential functionality, such as maintaining login sessions,
        authentication and website security. These technologies may help
        remember your session and ensure that essential website features
        function correctly. Disabling certain cookies may affect some
        website features.
      </p>
    ),
  },
  {
    title: "5. Third-Party Services",
    content: (
      <>
        <p>
          We may rely on trusted third-party service providers to operate,
          maintain and improve our website and business operations.
          These may include:
        </p>

        <ul className="list-disc space-y-1 pl-5">
          <li>Website hosting and infrastructure providers.</li>
          <li>Database and authentication service providers.</li>
          <li>Email delivery and communication service providers.</li>
          <li>Courier and logistics partners responsible for delivering orders.</li>
          <li>Other service providers necessary for website functionality and business operations.</li>
        </ul>

        <p>
          Information may be shared with these providers only to the
          extent reasonably necessary for them to perform their services,
          fulfil orders, maintain website functionality, ensure security
          or meet applicable legal obligations.
        </p>

        <p>
          Such providers may process information in accordance with
          their own privacy policies and applicable terms of service.
        </p>
      </>
    ),
  },
  {
    title: "6. Sharing of Personal Information",
    content: (
      <>
        <p>
          We do not sell customers&apos; personal information as part
          of our business operations.
        </p>

        <p>We may disclose relevant information:</p>

        <ul className="list-disc space-y-1 pl-5">
          <li>To courier partners for delivering orders.</li>
          <li>To service providers supporting our website and operations.</li>
          <li>When necessary to process, verify or investigate transactions.</li>
          <li>When required by law, a lawful request or a competent authority.</li>
          <li>To protect our customers, business, website or legal rights.</li>
        </ul>
      </>
    ),
  },
  {
    title: "7. Data Storage and Security",
    content: (
      <p>
        We use third-party infrastructure and reasonable technical and
        organizational measures intended to protect customer information
        against unauthorized access, alteration, disclosure or loss.
        However, no website, electronic transmission or storage system
        can be guaranteed to be completely secure. Customers should
        protect their account credentials and avoid sharing passwords
        or verification codes.
      </p>
    ),
  },
  {
    title: "8. Data Retention",
    content: (
      <p>
        We retain personal information for as long as reasonably necessary
        to fulfil orders, provide customer support, maintain business and
        transaction records, resolve disputes, prevent fraud and comply
        with applicable legal obligations. Retention periods may vary
        depending on the type of information and the purpose for which
        it was collected.
      </p>
    ),
  },
  {
    title: "9. Your Privacy Choices and Requests",
    content: (
      <>
        <p>
          You may contact us to request access to, correction of or
          deletion of personal information associated with you, subject
          to applicable laws and legitimate record-retention requirements.
        </p>

        <p>
          We may need to verify your identity before responding to
          certain requests. Some information may need to be retained
          where required for legal, security, accounting or transaction
          purposes.
        </p>
      </>
    ),
  },
  {
    title: "10. Children's Privacy",
    content: (
      <p>
        Our website is not intended to knowingly collect personal
        information from children in violation of applicable laws.
        If you believe a child has provided personal information
        improperly, please contact us so that we can review the matter.
      </p>
    ),
  },
  {
    title: "11. Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time to reflect
        changes in our services, business practices or applicable
        requirements. The updated version will be published on this
        page with a revised last-updated date.
      </p>
    ),
  },
];

const supportEmail = "kaizencollectionss@gmail.com";

export default function PrivacyPolicyPage() {
  return (
    <>
      <main className="w-full flex-1 bg-[#FCF9F9] px-4 py-10 sm:px-6 sm:py-14">
        <article className="mx-auto w-full max-w-3xl">
          <header className="mb-8 border-b border-[#E7DDDD] pb-7 sm:mb-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#B58F92]">
              Legal Information
            </p>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#302324] sm:text-4xl">
              Privacy Policy
            </h1>

            <p className="mt-4 text-sm leading-6 text-[#7A6B6D]">
              Your privacy matters to us. This policy explains what
              information KaizenCollectionss collects, how we use it
              and how we handle your personal information when you
              use our website and services.
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
                12. Contact Us
              </h2>

              <p>
                If you have questions or concerns about this Privacy
                Policy or your personal information, please contact us:
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
            This Privacy Policy should be read together with our
            Terms &amp; Conditions and other applicable store policies.
            Nothing in this policy is intended to limit rights available
            to individuals under applicable data protection laws.
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
