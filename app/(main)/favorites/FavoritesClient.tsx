"use client";

import { useState } from "react";
import { Empty } from "antd";
import { Heart } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { createClient } from "@/lib/supabase/client";
import type { Favorite } from "@/lib/types";

export default function FavoritesClient({ favorites: initial, userId }: { favorites: Favorite[]; userId: string }) {
  const [favorites, setFavorites] = useState(initial);

  async function removeFavorite(listingId: string) {
    const supabase = createClient();
    await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId);
    setFavorites((prev) => prev.filter((f) => f.listing_id !== listingId));
  }

  return (
    <div className="min-h-screen bg-[#F5F5F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-16 md:pt-8 safe-bottom">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Saved Homes</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {favorites.length} saved {favorites.length === 1 ? "property" : "properties"}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <Heart className="text-[#FF6A00] h-6 w-6" />
            </div>
            <p className="font-semibold text-gray-700 text-base">No saved homes yet</p>
            <p className="text-sm text-gray-400 mt-1 text-center">
              Tap the heart on any listing to save it here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
            {favorites.map((fav) =>
              fav.listing ? (
                <PropertyCard
                  key={fav.id}
                  listing={fav.listing}
                  isFavorite
                  onToggleFavorite={() => removeFavorite(fav.listing_id)}
                />
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}
