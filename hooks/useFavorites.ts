"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useFavorites(userId: string | null) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const supabase = createClient();

    supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) {
          setFavoriteIds(new Set(data.map((f) => f.listing_id)));
        }
        setLoading(false);
      });
  }, [userId]);

  async function toggle(listingId: string) {
    if (!userId) return;
    const supabase = createClient();
    const isFav = favoriteIds.has(listingId);

    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });

    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId);
    } else {
      const { error } = await supabase.from("favorites").insert({ user_id: userId, listing_id: listingId });
      if (error) {
        // Revert on failure
        setFavoriteIds((prev) => { const next = new Set(prev); next.delete(listingId); return next; });
      }
    }
  }

  return { favoriteIds, loading, toggle };
}
