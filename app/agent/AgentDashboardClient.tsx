"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Tag, Statistic, Row, Col, Card, App, Empty } from "antd";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Home,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Listing } from "@/lib/types";

import { apiFetch } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = { approved: "success", pending: "warning", rejected: "error" };

export default function AgentDashboardClient({ listings: initial, agentName }: { listings: Listing[]; agentName: string }) {
  const [listings, setListings] = useState(initial);
  const { modal, message } = App.useApp();

  const stats = {
    total: listings.length,
    approved: listings.filter((l) => l.status === "approved").length,
    pending: listings.filter((l) => l.status === "pending").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
  };

  function confirmDelete(id: string, title: string) {
    modal.confirm({
      title: `Delete "${title}"?`,
      content: "This listing will be permanently removed.",
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        const res = await apiFetch(`/api/listings/${id}`, { method: "DELETE" });
        if (res.ok) {
          setListings((prev) => prev.filter((l) => l.id !== id));
          message.success("Listing deleted");
        } else {
          message.error("Failed to delete listing");
        }
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-5">
          <Link href="/profile">
            <Button type="text" icon={<ArrowLeft className="h-5 w-5" />} className="px-0 text-gray-600 flex items-center justify-center hover:bg-gray-100 rounded-full h-9 w-9" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Listings</h1>
            <p className="text-sm text-gray-400">Welcome, {agentName.split(" ")[0]}</p>
          </div>
        </div>

        {/* Stats */}
        <Row gutter={8}>
          {[
            { icon: <Home className="h-4 w-4" />, label: "Total", value: stats.total, color: "#1a1a1a" },
            { icon: <CheckCircle2 className="h-4 w-4" />, label: "Live", value: stats.approved, color: "#52c41a" },
            { icon: <Clock className="h-4 w-4" />, label: "Pending", value: stats.pending, color: "#fa8c16" },
            { icon: <XCircle className="h-4 w-4" />, label: "Rejected", value: stats.rejected, color: "#ff4d4f" },
          ].map(({ icon, label, value, color }) => (
            <Col span={6} key={label}>
              <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center text-center">
                <div style={{ color }} className="text-base mb-1 flex items-center justify-center">{icon}</div>
                <p className="text-lg font-bold text-gray-900 leading-none mt-1">{value}</p>
                <p className="text-[10px] text-gray-400 mt-1">{label}</p>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div className="px-4 py-4">
        <Link href="/agent/new">
          <Button type="primary" size="large" icon={<Plus className="h-5 w-5" />} block className="h-12 rounded-2xl font-semibold mb-5 flex items-center justify-center gap-1.5" style={{ background: "#FF6A00", borderColor: "#FF6A00" }}>
            Add New Listing
          </Button>
        </Link>

        {listings.length === 0 ? (
          <Empty description="No listings yet. Add your first property!" className="py-16" />
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden" styles={{ body: { padding: 0 } }}>
                <div className="flex gap-3 p-3">
                  <div className="relative h-20 w-[88px] rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    {listing.images?.[0] && (
                      <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">{listing.title}</p>
                      <Tag color={STATUS_COLORS[listing.status]} className="shrink-0 text-[10px] rounded-full capitalize">{listing.status}</Tag>
                    </div>
                    <p className="text-[#FF6A00] font-bold text-sm mt-1">{formatPrice(listing.price)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(listing.created_at)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-gray-100">
                  {[
                    { icon: <Eye className="h-4 w-4" />, label: "View", href: `/listings/${listing.id}`, color: "text-gray-500" },
                    { icon: <Edit className="h-4 w-4" />, label: "Edit", href: `/agent/edit/${listing.id}`, color: "text-[#FF6A00]" },
                  ].map(({ icon, label, href, color }) => (
                    <Link key={label} href={href} className="flex-1">
                      <div className={`flex items-center justify-center gap-1.5 py-3 text-xs font-medium ${color} hover:bg-gray-50 transition-colors`}>
                        {icon} {label}
                      </div>
                    </Link>
                  ))}
                  <div className="w-px bg-gray-100" />
                  <button
                    onClick={() => confirmDelete(listing.id, listing.title)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
