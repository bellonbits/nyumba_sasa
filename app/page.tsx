"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        router.push("/home");
      } else {
        router.push("/onboarding");
      }
    }

    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
