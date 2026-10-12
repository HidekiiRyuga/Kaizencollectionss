"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-[#E7DDDD] px-6 py-3 text-sm font-semibold text-[#302324] hover:bg-[#FCF9F9]"
    >
      Sign Out
    </button>
  );
}