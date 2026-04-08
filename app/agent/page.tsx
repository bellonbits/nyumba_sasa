import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AgentDashboardClient from "./AgentDashboardClient";
import type { Listing } from "@/lib/types";

export default async function AgentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("role, name").eq("id", user.id).single();
  if (!profile || !["agent", "admin"].includes(profile.role)) redirect("/home");

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("agent_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AgentDashboardClient
      listings={(listings as Listing[]) ?? []}
      agentName={profile.name}
    />
  );
}
