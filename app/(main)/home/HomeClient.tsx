"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  SlidersHorizontal, 
  Zap, 
  Home, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  Globe, 
  Key, 
  Compass, 
  Search 
} from "lucide-react";
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
  const [segment, setSegment] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    setSegment(localStorage.getItem("mvs_segment"));
  }, []);

  const subtitleIcon = useMemo(() => {
    const size = "h-4 w-4 text-[#7B2FBE] shrink-0";
    if (segment === "student") return <GraduationCap className={size} />;
    if (segment === "professional") return <Briefcase className={size} />;
    if (segment === "diaspora") return <Globe className={size} />;
    if (segment === "family") return <Home className={size} />;
    if (segment === "landlord") return <Key className={size} />;
    return <Compass className={size} />;
  }, [segment]);

  const subtitleText = useMemo(() => {
    if (segment === "student") return "Handpicked verified student housing near campus";
    if (segment === "professional") return "Work-ready homes with audited commutes";
    if (segment === "diaspora") return "Vetted video walkthroughs for remote peace-of-mind";
    if (segment === "family") return "Secure long-term spaces with utility audit scores";
    if (segment === "landlord") return "High-intent verified tenant matches";
    return "Discover properties tailored to your preferences";
  }, [segment]);

  const filtered = useMemo(() => {
    let result = listings;
    if (filter === "rent") result = result.filter((l) => l.listing_type === "rent");
    else if (filter === "buy") result = result.filter((l) => l.listing_type === "buy");
    
    if (verifiedOnly) {
      result = result.filter((l) => l.is_verified !== false);
    }
    return result;
  }, [listings, filter, verifiedOnly]);

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

        {/* Top Bar */}
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
              className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100"
            >
              <Bell className="text-gray-600 h-5 w-5" />
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
          <div className="flex items-center gap-1.5 mt-1">
            {subtitleIcon}
            <p className="text-gray-500 text-xs font-semibold leading-none">{subtitleText}</p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="flex items-center gap-2 mb-5"
        >
          <div className="flex-1 flex items-center gap-2.5 bg-white rounded-full px-4 h-12 shadow-sm border border-gray-100">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/search?q=${encodeURIComponent(searchQuery)}`)}
              placeholder="Search here"
              className="flex-1 text-sm text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
            />
            <button className="text-gray-400">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => router.push("/search?deep=1")}
            className="flex items-center gap-1.5 bg-[#7B2FBE] text-white text-sm font-semibold px-4 h-12 rounded-full shadow-sm whitespace-nowrap"
          >
            <Zap className="h-4 w-4 fill-white" />
            Deep Search
          </motion.button>
        </motion.div>

        {/* Filter Chips */}
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

        {/* Trust Infrastructure Vetted Pledge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="bg-gradient-to-r from-[#7B2FBE]/10 to-purple-500/5 border border-[#7B2FBE]/20 rounded-2xl p-4 mb-5 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#7B2FBE]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-gray-900 text-xs font-bold leading-none mb-1">Vetted & physically audited</p>
              <p className="text-gray-500 text-[10px] leading-tight">No fake agents. No phantom deposits.</p>
            </div>
          </div>
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`shrink-0 h-7 w-12 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex items-center ${
              verifiedOnly ? "bg-[#7B2FBE]" : "bg-gray-300"
            }`}
          >
            <motion.div
              layout
              className="h-6 w-6 rounded-full bg-white shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              style={{ x: verifiedOnly ? 18 : 0 }}
            />
          </button>
        </motion.div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-[16px]">Recommended for You</h2>
          <button className="h-8 w-8 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center">
            <SlidersHorizontal className="text-gray-500 h-4 w-4" />
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
              <Home className="h-12 w-12 text-gray-300 mx-auto mb-3" />
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
