import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import ImageCarousel from "@/components/ImageCarousel";
import ListingDetailClient from "./ListingDetailClient";
import { Avatar } from "antd";
import {
  ArrowLeftOutlined, BookOutlined, EnvironmentOutlined,
  MessageOutlined, WifiOutlined, CarOutlined,
  ThunderboltOutlined, CheckCircleFilled,
} from "@ant-design/icons";
import { BedIcon, BathIcon, RulerIcon, WhatsAppIcon } from "@/components/icons";
import { formatPrice, formatDate, getWhatsAppLink, getInitials } from "@/lib/utils";
import type { Listing } from "@/lib/types";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <WifiOutlined />,
  Parking: <CarOutlined />,
  Electricity: <ThunderboltOutlined />,
};

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("listings")
    .select(`*, agent:users!listings_agent_id_fkey(id, name, phone, avatar_url)`)
    .eq("id", id)
    .single();

  if (!data) notFound();
  const l = data as Listing;

  const whatsappUrl = l.agent?.phone
    ? getWhatsAppLink(l.agent.phone, `Hi! I saw your listing on Nyumba Sasa: "${l.title}". I'm interested!`)
    : null;

  return (
    <ListingDetailClient
      listing={l}
      whatsappUrl={whatsappUrl}
      amenityIcons={AMENITY_ICONS}
    />
  );
}
