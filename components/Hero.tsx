import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#E7DDDD]">
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#E1ACB0]/40 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-white/50 blur-3xl" />

      <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-6 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#302324]/70">
            Anime · Cute · Collectible
          </p>

          <h1 className="text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-[#302324] sm:text-6xl lg:text-7xl">
            Little things
            <br />
            worth{" "}
            <span className="italic text-[#E1ACB0]">
              collecting.
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-base leading-7 text-[#302324]/75 sm:text-lg">
            Discover cute anime-inspired pieces and unique finds
            made for the things you love.
          </p>

          <div className="mt-9">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 rounded-full bg-[#302324] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4F3B3D] hover:shadow-lg"
            >
              Shop Collection
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute right-[-80px] top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-white/60 lg:block">
          <div className="absolute inset-8 rounded-full border border-[#E1ACB0]/50" />
          <div className="absolute inset-16 rounded-full bg-[#E1ACB0]/25" />
        </div>
      </div>
    </section>
  );
}