"use client";

import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOutlined, BookFilled, EnvironmentOutlined } from "@ant-design/icons";
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
          {/* Image */}
          <div className="relative h-48 w-full bg-gray-100">
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 100vw, 430px"
              className="object-cover"
              loading="lazy"
            />
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                {listing.listing_type === "rent" ? "For Rent" : "For Sale"}
              </span>
            </div>
            <motion.button
              onClick={handleFavorite}
              whileTap={{ scale: 0.8 }}
              aria-label={isFavorite ? "Remove bookmark" : "Bookmark"}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
            >
              {isFavorite
                ? <BookFilled className="text-[#7B2FBE] text-sm" />
                : <BookOutlined className="text-gray-500 text-sm" />}
            </motion.button>
          </div>

          {/* Info */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[15px] text-gray-900 line-clamp-1">
                  {listing.title}
                </h3>
                <p className="text-gray-400 text-[13px] flex items-center gap-1 mt-1 line-clamp-1">
                  <EnvironmentOutlined className="text-gray-400 text-xs shrink-0" />
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

            {/* Stats row */}
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
