"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Tag, Card, Empty, App, Row, Col } from "antd";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Eye,
  Home,
  Users,
  Clock,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

import { apiFetch } from "@/lib/api";

interface Stats { totalListings: number; totalUsers: number; totalAgents: number; pendingCount: number; }

export default function AdminDashboardClient({ pendingListings: initial, stats }: { pendingListings: any[]; stats: Stats }) {
  const [pending, setPending] = useState(initial);
  const [processing, setProcessing] = useState<string | null>(null);
  const { message } = App.useApp();

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setProcessing(id);
    const res = await apiFetch(`/api/listings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setPending((prev) => prev.filter((l) => l.id !== id));
      message.success(status === "approved" ? "Listing approved!" : "Listing rejected");
    } else {
      message.error("Action failed");
    }
    setProcessing(null);
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="max-w-4xl mx-auto w-full pb-12">
      {/* Dark header */}
      <div className="bg-gray-900 text-white px-4 pt-4 pb-6">
        <div className="flex items-center gap-2 mb-5">
          <Link href="/profile"><Button type="text" icon={<ArrowLeft className="h-5 w-5 text-gray-300" />} className="text-gray-300 px-0 flex items-center justify-center hover:bg-white/10 rounded-full h-9 w-9" /></Link>
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 text-xs">Moderate listings & manage users</p>
          </div>
        </div>

        <Row gutter={10}>
          {[
            { icon: <Home className="h-4 w-4" />, label: "Listings", value: stats.totalListings, color: "#FF6A00" },
            { icon: <Users className="h-4 w-4" />, label: "Users", value: stats.totalUsers, color: "#60a5fa" },
            { icon: <Users className="h-4 w-4" />, label: "Agents", value: stats.totalAgents, color: "#4ade80" },
            { icon: <Clock className="h-4 w-4" />, label: "Pending", value: stats.pendingCount, color: "#fbbf24" },
          ].map(({ icon, label, value, color }) => (
            <Col span={6} key={label}>
              <div className="bg-white/10 rounded-2xl p-3 flex flex-col items-center text-center">
                <div style={{ color }} className="text-base flex items-center justify-center mb-1">{icon}</div>
                <p className="text-xl font-bold text-white mt-1 leading-none">{value}</p>
                <p className="text-[10px] text-gray-400 mt-1">{label}</p>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div className="px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-lg">Pending Review</h2>
          {pending.length > 0 && (
            <Tag color="warning" className="rounded-full">{pending.length} waiting</Tag>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl py-16 flex flex-col items-center">
            <CheckCircle2 className="h-12 w-12 text-green-400 mb-3" />
            <p className="font-semibold text-gray-700">All caught up!</p>
            <p className="text-sm text-gray-400 mt-1">No listings pending review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((listing) => (
              <Card key={listing.id} className="overflow-hidden" styles={{ body: { padding: 0 } }}>
                {listing.images?.[0] && (
                  <div className="relative h-44 w-full">
                    <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm flex-1">{listing.title}</h3>
                    <Tag color={listing.listing_type === "rent" ? "#FF6A00" : "#1a1a1a"} className="rounded-full text-[10px] shrink-0">
                      {listing.listing_type === "rent" ? "Rent" : "Sale"}
                    </Tag>
                  </div>
                  <p className="text-[#FF6A00] font-bold">{formatPrice(listing.price)}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{listing.location}, {listing.city}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    By <span className="font-medium">{listing.agent?.name ?? "Unknown"}</span> · {formatDate(listing.created_at)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{listing.description}</p>
                </div>

                <div className="flex border-t border-gray-100">
                  <Link href={`/listings/${listing.id}`} className="flex-1">
                    <div className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <Eye className="h-4 w-4" /> Preview
                    </div>
                  </Link>
                  <div className="w-px bg-gray-100" />
                  <button
                    onClick={() => updateStatus(listing.id, "rejected")}
                    disabled={processing === listing.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                  <div className="w-px bg-gray-100" />
                  <button
                    onClick={() => updateStatus(listing.id, "approved")}
                    disabled={processing === listing.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-green-600 hover:bg-green-50 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
