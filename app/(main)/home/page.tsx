"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import HomeClient from "./HomeClient";
import type { Listing } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export default function HomePage() {
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          // 1. Fetch profile
          const profileRes = await apiFetch(`/api/users/${user.id}`);
          const profileJson = await profileRes.json();
          if (profileJson.data) {
            setUserName(profileJson.data.name ?? "");
            setUserAvatar(profileJson.data.avatar_url ?? "");
          }

          // 2. Fetch favorites
          const favsRes = await apiFetch("/api/favorites");
          const favsJson = await favsRes.json();
          const ids = new Set((favsJson.data ?? []).map((f: any) => f.listing_id));
          setFavoriteIds(ids as Set<string>);
        }

        // 3. Fetch approved listings
        const listingsRes = await apiFetch("/api/listings?limit=20");
        const listingsJson = await listingsRes.json();
        setListings(listingsJson.data ?? []);

      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <HomeClient
      userName={userName}
      userAvatar={userAvatar}
      listings={listings}
      favoriteIds={favoriteIds}
      userId={userId}
    />
  );
}
