"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Avatar } from "antd";
import {
  ArrowLeftOutlined, BookOutlined, BookFilled, EnvironmentOutlined,
  MessageOutlined, CheckCircleFilled,
} from "@ant-design/icons";
import { BedIcon, BathIcon, RulerIcon, WhatsAppIcon } from "@/components/icons";
import ImageCarousel from "@/components/ImageCarousel";
import { formatPrice, formatDate, getInitials } from "@/lib/utils";
import type { Listing } from "@/lib/types";

const TABS = ["Overview", "Amenities", "Location", "Policies"] as const;
type Tab = typeof TABS[number];

interface Props {
  listing: Listing;
  whatsappUrl: string | null;
  amenityIcons: Record<string, React.ReactNode>;
}

export default function ListingDetailClient({ listing: l, whatsappUrl, amenityIcons }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [saved, setSaved] = useState(false);

  const slideUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  } as const;

  return (
    <div className="min-h-screen bg-white" style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}>
      {/* Carousel */}
      <div className="relative">
        <ImageCarousel images={l.images} title={l.title} className="h-72 w-full" />
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-4"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
        >
          <Link href="/home" className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <ArrowLeftOutlined className="text-gray-700" />
          </Link>
          <span className="text-white font-bold text-base drop-shadow">Property Details</span>
          <motion.button
            whileTap={{ scale: 0.82 }}
            onClick={() => setSaved((s) => !s)}
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            {saved
              ? <BookFilled className="text-[#7B2FBE]" />
              : <BookOutlined className="text-gray-700" />}
          </motion.button>
        </div>
      </div>

      {/* Thumbnail strip */}
      {l.images.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none bg-white">
          {l.images.slice(0, 5).map((img, i) => (
            <div key={i} className="relative h-14 w-16 rounded-xl overflow-hidden shrink-0 border-2 border-transparent hover:border-[#7B2FBE] transition-colors">
              <Image src={img} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <motion.div {...slideUp} className="px-5 pt-4 space-y-4">
        {/* Price + location */}
        <div>
          <span className="text-[28px] font-extrabold text-[#7B2FBE]">
            {formatPrice(l.price)}
            {l.listing_type === "rent" && (
              <span className="text-gray-400 font-normal text-sm ml-1">/month</span>
            )}
          </span>
          <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
            <EnvironmentOutlined className="text-gray-400" />
            {l.location}, {l.city}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3">
          {[
            { icon: <BedIcon className="text-gray-500 text-base" />, label: `${l.bedrooms} Bd` },
            { icon: <BathIcon className="text-gray-500 text-base" />, label: `${l.bathrooms} Ba` },
            { icon: <RulerIcon className="text-gray-500 text-base" />, label: l.area_sqm ? `${l.area_sqm} m²` : "N/A" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2">
              {icon}
              <span className="text-gray-600 text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3">
          <Link href={`/messages/${l.id}?partner=${l.agent?.id}`} className="flex-1">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="w-full h-12 bg-[#7B2FBE] text-white rounded-full font-semibold text-sm"
            >
              Schedule a Tour
            </motion.button>
          </Link>
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="w-full h-12 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="text-green-500 text-base" />
                Contact
              </motion.button>
            </a>
          ) : (
            <Link href={`/messages/${l.id}?partner=${l.agent?.id}`} className="flex-1">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="w-full h-12 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm"
              >
                Contact
              </motion.button>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-100 pb-1">
          {TABS.map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileTap={{ scale: 0.95 }}
              className={[
                "text-sm font-semibold pb-2 transition-colors relative",
                activeTab === tab ? "text-gray-900" : "text-gray-400",
              ].join(" ")}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "Overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <h3 className="font-bold text-gray-900 text-base mb-2">Property Description</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{l.description}</p>
          </motion.div>
        )}

        {activeTab === "Amenities" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            {l.amenities?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {l.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-[#7B2FBE] text-sm font-medium">
                    <CheckCircleFilled className="text-xs" />
                    {amenityIcons[a] ?? null} {a}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No amenities listed.</p>
            )}
          </motion.div>
        )}

        {activeTab === "Location" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <p className="text-gray-500 text-sm">
              <EnvironmentOutlined className="mr-1" />{l.location}, {l.city}
            </p>
          </motion.div>
        )}

        {activeTab === "Policies" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <p className="text-gray-400 text-sm">Contact the agent for rental or purchase policies.</p>
          </motion.div>
        )}

        {/* Agent */}
        {l.agent && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4 mb-4">
            <Avatar src={l.agent.avatar_url} size={44} style={{ background: "#7B2FBE" }}>
              {getInitials(l.agent.name ?? "A")}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{l.agent.name}</p>
              <p className="text-xs text-gray-400">Listed {formatDate(l.created_at)}</p>
            </div>
            <Link href={`/messages/${l.id}?partner=${l.agent.id}`}>
              <div className="h-9 w-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[#7B2FBE]">
                <MessageOutlined />
              </div>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
