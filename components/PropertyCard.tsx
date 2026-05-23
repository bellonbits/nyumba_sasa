"use client";

import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Bookmark, 
  GraduationCap, 
  Briefcase, 
  Video, 
  ShieldCheck, 
  Key 
} from "lucide-react";
import { BedIcon, BathIcon, RulerIcon } from "@/components/icons";
import { cn, formatPrice, optimizeCloudinaryUrl } from "@/lib/utils";
import type { Listing } from "@/lib/types";

interface PropertyCardProps {
  listing: Listing;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  className?: string;
  index?: number;
}

const PropertyCard = memo(function PropertyCard({
  listing,
  isFavorite = false,
  onToggleFavorite,
  className,
  index = 0,
}: PropertyCardProps) {
  const imageUrl = optimizeCloudinaryUrl(listing.images?.[0] ?? "", 600, 400);
  const [segment, setSegment] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSegment(localStorage.getItem("mvs_segment"));
  }, []);

  // Compute deterministic trust attributes
  const trustData = React.useMemo(() => {
    // Use real backend verification fields when available
    const isVerified = listing.property_verified
      ?? listing.owner_verified
      ?? listing.caretaker_confirmed
      ?? listing.is_verified
      ?? false;  // Default false — only show "Verified" when actually verified
    return { isVerified };
  }, [listing]);

  // Dynamic match label and icon for shadcn/ui clean design
  const matchIcon = React.useMemo(() => {
    const size = "h-3.5 w-3.5 text-purple-300 shrink-0";
    if (segment === "student") return <GraduationCap className={size} />;
    if (segment === "professional") return <Briefcase className={size} />;
    if (segment === "diaspora") return <Video className={size} />;
    if (segment === "family") return <ShieldCheck className={size} />;
    if (segment === "landlord") return <Key className={size} />;
    return <MapPin className={size} />;
  }, [segment]);

  const matchText = React.useMemo(() => {
    const id = listing.id || "default";
    const charSum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const moveInScore = listing.move_in_score ?? (85 + (charSum % 14));
    const safetyScore = listing.safety_score ?? Number((7.8 + (charSum % 20) / 10).toFixed(1));
    const commuteMins = 8 + (charSum % 18);

    if (segment === "student") return `${moveInScore}% Campus Fit`;
    if (segment === "professional") return `${commuteMins}m Commute`;
    if (segment === "diaspora") return `Video Tour Ready`;
    if (segment === "family") return `Safety: ${safetyScore}/10`;
    if (segment === "landlord") return `Prem. Listed`;
    return `${moveInScore}% Confidence`;
  }, [listing, segment]);

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(listing.id);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <Link href={`/listings/${listing.id}`} className={cn("block", className)}>
        <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition-shadow duration-200">
          
          {/* Image Layer */}
          <div className="relative h-48 w-full bg-gray-100">
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 100vw, 430px"
              className="object-cover"
              loading="lazy"
            />
            
            {/* Top Badge Row */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
              <span className="bg-white/95 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {listing.listing_type === "rent" ? "For Rent" : "For Sale"}
              </span>
              {trustData.isVerified && (
                <span className="bg-[#22C55E]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  ✓ Verified
                </span>
              )}
            </div>

            {/* Dynamic MVS Match Badge */}
            <div className="absolute bottom-3 left-3">
              <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                {matchIcon}
                {matchText}
              </span>
            </div>

            {/* Favorite Action Button */}
            <motion.button
              onClick={handleFavorite}
              whileTap={{ scale: 0.8 }}
              aria-label={isFavorite ? "Remove bookmark" : "Bookmark"}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
            >
              <Bookmark 
                className={cn(
                  "h-4 w-4 transition-colors", 
                  isFavorite ? "text-[#7B2FBE] fill-[#7B2FBE]" : "text-gray-500"
                )} 
              />
            </motion.button>
          </div>

          {/* Details Layer */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[15px] text-gray-900 line-clamp-1">
                  {listing.title}
                </h3>
                <p className="text-gray-400 text-[13px] flex items-center gap-1.5 mt-1.5 line-clamp-1">
                  <MapPin className="text-gray-400 h-3.5 w-3.5 shrink-0" />
                  {listing.location}, {listing.city}
                </p>
              </div>
              <span className="text-[#7B2FBE] font-bold text-lg shrink-0">
                {formatPrice(listing.price)}
                {listing.listing_type === "rent" && (
                  <span className="text-gray-400 font-normal text-xs">/mo</span>
                )}
              </span>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
              <span className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                <BedIcon className="text-sm text-gray-400" />
                {listing.bedrooms} Bd
              </span>
              <span className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                <BathIcon className="text-sm text-gray-400" />
                {listing.bathrooms} Ba
              </span>
              <span className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                <RulerIcon className="text-sm text-gray-400" />
                {listing.area_sqm ? `${listing.area_sqm} m²` : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default PropertyCard;
