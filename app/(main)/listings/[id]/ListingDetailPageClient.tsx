"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getWhatsAppLink } from "@/lib/utils";
import type { Listing } from "@/lib/types";
import { Wifi, Car, Zap } from "lucide-react";
import ListingDetailClient from "./ListingDetailClient";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-4 w-4" />,
  Parking: <Car className="h-4 w-4" />,
  Electricity: <Zap className="h-4 w-4" />,
};

export default function ListingDetailPageClient({ id }: { id: string }) {
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListing() {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/listings/${id}`);
        const json = await res.json();
        if (json.data) {
          setListing(json.data);
        } else {
          router.push("/home");
        }
      } catch (err) {
        console.error("Failed to load listing:", err);
        router.push("/home");
      } finally {
        setLoading(false);
      }
    }

    loadListing();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) return null;

  const whatsappUrl = listing.agent?.phone
    ? getWhatsAppLink(listing.agent.phone, `Hi! I saw your listing on Nyumba Sasa: "${listing.title}". I'm interested!`)
    : null;

  return (
    <ListingDetailClient
      listing={listing}
      whatsappUrl={whatsappUrl}
      amenityIcons={AMENITY_ICONS}
    />
  );
}
