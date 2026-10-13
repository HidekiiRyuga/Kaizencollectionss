"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";


export default function NavigationLoadingOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const previousPathname = useRef(pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;

      const url = new URL(link.href, window.location.href);

      if (
        url.origin !== window.location.origin ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        url.pathname === window.location.pathname
      ) {
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setVisible(true);

      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, 8000);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;

      // Keep the overlay visible briefly so the transition is perceptible.
      setVisible(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
    className="fixed inset-0 z-[99999] flex items-center justify-center
        pointer-events-none"
    role="status"
    aria-label="Loading page"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full
            border-3 border-[#E7DDDD]/40
            border-t-[#B58F92]"
      />
    </div>
  );
}
