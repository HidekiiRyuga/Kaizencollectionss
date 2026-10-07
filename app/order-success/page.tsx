import Link from "next/link";
import Footer from "@/components/Footer";

interface OrderSuccessPageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const { id } = await searchParams;

  return (
    <>
      <main className="mx-auto flex min-h-[65vh] max-w-[1500px] items-center justify-center px-8 py-20 lg:px-12 xl:px-16">
        <div className="w-full max-w-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E7DDDD]">
            <span className="text-2xl text-[#302324]">✓</span>
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
            Order Confirmed
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#302324] sm:text-5xl">
            Thank you for your order!
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#7A6B6D] sm:text-lg">
            We've received your order and will get in touch with you
            shortly with the next steps.
          </p>

          {id && (
            <p className="mt-6 text-sm text-[#7A6B6D]">
              Order ID:{" "}
              <span className="font-medium text-[#302324]">
                {id}
              </span>
            </p>
          )}

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="rounded-full bg-[#302324] px-8 py-4 text-sm font-semibold text-white hover:bg-[#211819]"
            >
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="rounded-full border border-[#E7DDDD] px-8 py-4 text-sm font-semibold text-[#302324] hover:bg-[#E7DDDD]"
            >
              Back Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}