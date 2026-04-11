"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { BedIcon, BathIcon, RulerIcon } from "@/components/icons";
import { getWhatsAppLink } from "@/lib/utils";
import type { Listing } from "@/lib/types";
import ListingDetailClient from "./ListingDetailClient";
import {
  WifiOutlined, CarOutlined, ThunderboltOutlined,
} from "@ant-design/icons";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <WifiOutlined />,
  Parking: <CarOutlined />,
  Electricity: <ThunderboltOutlined />,
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ListingDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
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
