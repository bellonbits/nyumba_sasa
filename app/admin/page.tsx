import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/home");

  // Fetch pending listings
  const { data: pendingListings } = await supabase
    .from("listings")
    .select(`*, agent:users!listings_agent_id_fkey(id, name, phone)`)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  // Stats
  const { count: totalListings } = await supabase
    .from("listings").select("*", { count: "exact", head: true });
  const { count: totalUsers } = await supabase
    .from("users").select("*", { count: "exact", head: true });
  const { count: totalAgents } = await supabase
    .from("users").select("*", { count: "exact", head: true }).eq("role", "agent");

  return (
    <AdminDashboardClient
      pendingListings={pendingListings ?? []}
      stats={{
        totalListings: totalListings ?? 0,
        totalUsers: totalUsers ?? 0,
        totalAgents: totalAgents ?? 0,
        pendingCount: pendingListings?.length ?? 0,
      }}
    />
  );
}
