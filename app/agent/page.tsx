"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AgentDashboardClient from "./AgentDashboardClient";
import type { Listing } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export default function AgentDashboardPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [agentName, setAgentName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgentData() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // 1. Fetch profile to check role
        const profileRes = await apiFetch(`/api/users/${user.id}`);
        const profileJson = await profileRes.json();
        const profile = profileJson.data;

        if (!profile || !["agent", "admin"].includes(profile.role)) {
          router.push("/home");
          return;
        }

        setAgentName(profile.name);

        // 2. Fetch all listings by this agent
        const listingsRes = await apiFetch("/api/listings");
        const listingsJson = await listingsRes.json();
        const allListings = listingsJson.data ?? [];
        
        // Filter for this agent
        const agentListings = allListings.filter((l: any) => l.agent_id === user.id);
        setListings(agentListings);

      } catch (err) {
        console.error("Failed to load agent dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAgentData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AgentDashboardClient
      listings={listings}
      agentName={agentName}
    />
  );
}
