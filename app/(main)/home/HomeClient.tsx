"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BellOutlined, ControlOutlined, ThunderboltFilled, HomeOutlined } from "@ant-design/icons";
import { Badge } from "antd";
import PropertyCard from "@/components/PropertyCard";
import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/lib/types";
import { getInitials } from "@/lib/utils";
import { useRouter } from "next/navigation";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "For Sale", value: "buy" },
  { label: "For Rent", value: "rent" },
  { label: "House", value: "house" },
  { label: "Apartments", value: "apartment" },
];

interface HomeClientProps {
  userName: string;
  userAvatar?: string;
  listings: Listing[];
  favoriteIds: Set<string>;
  userId: string | null;
}

export default function HomeClient({ userName, userAvatar, listings, favoriteIds: initial, userId }: HomeClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(initial);

  const filtered = useMemo(() => {
    let result = listings;
    if (filter === "rent") result = result.filter((l) => l.listing_type === "rent");
    else if (filter === "buy") result = result.filter((l) => l.listing_type === "buy");
    return result;
  }, [listings, filter]);

  async function toggleFavorite(listingId: string) {
    if (!userId) return;
    const supabase = createClient();
    const isFav = favorites.has(listingId);
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId);
      setFavorites((prev) => { const n = new Set(prev); n.delete(listingId); return n; });
    } else {
      await supabase.from("favorites").insert({ user_id: userId, listing_id: listingId });
      setFavorites((prev) => new Set(prev).add(listingId));
    }
  }

  const firstName = userName ? userName.split(" ")[0] : "there";

  return (
    <div className="min-h-screen bg-[#F5F5F8]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="px-5 pt-12 pb-4">

        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 overflow-hidden flex items-center justify-center">
              {userAvatar ? (
                <Image src={userAvatar} alt={userName} width={40} height={40} className="object-cover rounded-full" />
              ) : (
                <span className="text-[#7B2FBE] font-bold text-sm">{getInitials(userName || "U")}</span>
              )}
            </div>
            <div>
              <p className="text-gray-400 text-xs leading-none mb-0.5">Welcome back</p>
              <p className="text-gray-900 font-bold text-base leading-none">Hello {firstName}</p>
            </div>
          </div>
          <Badge dot offset={[-3, 3]}>
            <motion.button
              whileTap={{ scale: 0.88 }}
              className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center"
            >
              <BellOutlined className="text-gray-600 text-[18px]" />
            </motion.button>
          </Badge>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mb-5"
        >
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-1">
            Find Your Dream Home
          </h1>
          <p className="text-gray-400 text-sm">Discover properties tailored to your preferences</p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="flex items-center gap-2 mb-5"
        >
          <div className="flex-1 flex items-center gap-2 bg-white rounded-full px-4 h-12 shadow-sm border border-gray-100">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/search?q=${encodeURIComponent(searchQuery)}`)}
              placeholder="Search here"
              className="flex-1 text-sm text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
            />
            <button className="text-gray-400">
              <ControlOutlined className="text-sm" />
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => router.push("/search?deep=1")}
            className="flex items-center gap-1.5 bg-[#7B2FBE] text-white text-sm font-semibold px-4 h-12 rounded-full shadow-sm whitespace-nowrap"
          >
            <ThunderboltFilled className="text-[13px]" />
            Deep Search
          </motion.button>
        </motion.div>

        {/* Filter chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-5"
        >
          {FILTERS.map(({ label, value }) => (
            <motion.button
              key={value}
              onClick={() => setFilter(value)}
              whileTap={{ scale: 0.93 }}
              layout
              className={[
                "shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200",
                filter === value
                  ? "bg-[#7B2FBE] text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200",
              ].join(" ")}
            >
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-[16px]">Recommended for You</h2>
          <button className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
            <ControlOutlined className="text-gray-500 text-sm" />
          </button>
        </div>

        {/* Listings */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <HomeOutlined className="text-5xl text-gray-200 mb-3 block" />
              <p className="font-semibold text-gray-600">No listings found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different filter</p>
            </motion.div>
          ) : (
            <motion.div key="list" className="space-y-4 pb-6">
              {filtered.map((listing, i) => (
                <PropertyCard
                  key={listing.id}
                  listing={listing}
                  isFavorite={favorites.has(listing.id)}
                  onToggleFavorite={userId ? toggleFavorite : undefined}
                  index={i}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
