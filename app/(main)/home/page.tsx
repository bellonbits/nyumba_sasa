import { createClient } from "@/lib/supabase/server";
import HomeClient from "./HomeClient";
import type { Listing } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("users").select("name, avatar_url").eq("id", user.id).single()
    : { data: null };

  const { data: listings } = await supabase
    .from("listings")
    .select(`*, agent:users!listings_agent_id_fkey(id, name, phone, avatar_url)`)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: favorites } = user
    ? await supabase.from("favorites").select("listing_id").eq("user_id", user.id)
    : { data: [] };

  const favoriteIds = new Set((favorites ?? []).map((f) => f.listing_id));

  return (
    <HomeClient
      userName={profile?.name ?? ""}
      userAvatar={profile?.avatar_url ?? ""}
      listings={(listings as Listing[]) ?? []}
      favoriteIds={favoriteIds}
      userId={user?.id ?? null}
    />
  );
}
