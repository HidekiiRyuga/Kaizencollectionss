import Link from "next/link";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#302324] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-xl font-bold tracking-tight"
            >
              KaizenCollectionss
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-6 text-white/65">
              Anime-inspired finds, cute collectibles, and little
              things worth keeping.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold">Explore</h3>

            <div className="mt-3 flex flex-col gap-3">
              <Link
                href="/"
                className="text-sm text-white/65 transition-colors hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/shop"
                className="text-sm text-white/65 transition-colors hover:text-white"
              >
                Shop
              </Link>

              <Link
                href="/track-order"
                className="text-sm text-white/65 transition-colors hover:text-white"
              >
                Track Order
              </Link>

              <Link
                href="/about"
                className="text-sm text-white/65 transition-colors hover:text-white"
              >
                About
              </Link>

            </div>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-semibold">Policies</h3>

            <div className="mt-3 flex flex-col gap-3">
              <Link
                href="/returns-refunds"
                className="text-sm text-white/65 transition-colors hover:text-white"
              >
                Returns &amp; Refunds
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold">Get in touch</h3>

            <div className="mt-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-white"
              >
                <Mail size={18} strokeWidth={1.8} />
                Contact us
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-white/15 pt-4">
          <p className="text-xs leading-5 text-white/45">
            © {new Date().getFullYear()} KaizenCollectionss. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
