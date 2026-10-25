"use client";

import { useState } from "react";

export default function CopyOrderIdButton({
  orderId,
}: {
  orderId: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-full border border-[#E7DDDD] px-3 py-1.5 text-xs font-semibold text-[#302324] hover:bg-[#FCF9F9]"
      aria-label="Copy order ID"
    >
      {copied ? "Copied!" : "Copy ID"}
    </button>
  );
}
