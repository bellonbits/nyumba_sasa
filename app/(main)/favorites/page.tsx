import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FavoritesClient from "./FavoritesClient";
import type { Favorite } from "@/lib/types";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      *,
      listing:listings(
        *,
        agent:users!listings_agent_id_fkey(id, name, phone, avatar_url)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <FavoritesClient favorites={(favorites as Favorite[]) ?? []} userId={user.id} />;
}
