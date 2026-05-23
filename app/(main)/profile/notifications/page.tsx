"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "antd";
import {
  ArrowLeft, Bell, BellOff, MessageSquare,
  Heart, Home, Tag, Megaphone, CheckCheck,
  Trash2, ShieldCheck, Info, Loader2,
  ChevronRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Notification, NotificationType } from "@/lib/types";

// ─── Notification Settings ───────────────────────────────────────────────────
const PREF_SECTIONS = [
  {
    title: "Activity",
    items: [
      { icon: MessageSquare, label: "New messages", desc: "When someone replies to your inquiry", key: "messages" },
      { icon: Heart, label: "Saved home updates", desc: "Price changes on your saved listings", key: "favorites" },
      { icon: Home, label: "New listings nearby", desc: "Properties matching your search", key: "nearby" },
    ],
  },
  {
    title: "Promotions",
    items: [
      { icon: Tag, label: "Deals & offers", desc: "Special pricing from verified agents", key: "deals" },
      { icon: Megaphone, label: "News & updates", desc: "Platform announcements", key: "news" },
    ],
  },
];

// ─── Icon & Color per notification type ──────────────────────────────────────
function NotifIcon({ type }: { type: NotificationType }) {
  const map: Record<NotificationType, { icon: React.ReactNode; bg: string; color: string }> = {
    message:  { icon: <MessageSquare className="h-4 w-4" />, bg: "bg-blue-50",   color: "text-blue-500" },
    listing:  { icon: <Home className="h-4 w-4" />,          bg: "bg-purple-50", color: "text-[#7B2FBE]" },
    system:   { icon: <ShieldCheck className="h-4 w-4" />,   bg: "bg-green-50",  color: "text-green-500" },
    promo:    { icon: <Tag className="h-4 w-4" />,            bg: "bg-amber-50",  color: "text-amber-500" },
    info:     { icon: <Info className="h-4 w-4" />,           bg: "bg-gray-100",  color: "text-gray-500" },
  };
  const { icon, bg, color } = map[type] ?? map.info;
  return (
    <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}>
      {icon}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Tab = "inbox" | "settings";

export default function NotificationsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("inbox");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    messages: true, favorites: true, nearby: false, deals: false, news: true,
  });
  const [masterEnabled, setMasterEnabled] = useState(true);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/notifications/");
      const json = await res.json();
      if (json.data) setNotifications(json.data as Notification[]);
    } catch {
      // If no backend, show demo notifications
      setNotifications(DEMO_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAllRead() {
    try {
      await apiFetch("/api/notifications/mark-read", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  }

  async function markOneRead(id: string) {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch {}
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  async function clearAll() {
    setClearing(true);
    try {
      await apiFetch("/api/notifications/all", { method: "DELETE" });
      setNotifications([]);
    } catch {
      setNotifications([]);
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F8]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      
      {/* Header */}
      <div
        className="bg-white px-4 flex items-center gap-3 border-b border-gray-100"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: "16px" }}
      >
        <button
          onClick={() => router.back()}
          className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-gray-900 flex-1">Notifications</h1>
        {tab === "inbox" && unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#7B2FBE] hover:text-purple-800 transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b border-gray-100 px-4 flex gap-6">
        {(["inbox", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 pt-3 text-sm font-semibold relative transition-colors ${
              tab === t ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {t === "inbox" ? "Inbox" : "Settings"}
            {t === "inbox" && unreadCount > 0 && (
              <span className="ml-1.5 bg-[#7B2FBE] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
            {tab === t && (
              <motion.div
                layoutId="notif-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7B2FBE] rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── INBOX TAB ─────────────────────────────────────────────────── */}
        {tab === "inbox" && (
          <motion.div
            key="inbox"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pt-4 pb-10 space-y-2"
          >
            {/* Actions row */}
            {notifications.length > 0 && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={clearAll}
                  disabled={clearing}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
                >
                  {clearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Clear all
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-[#7B2FBE]" />
              </div>
            )}

            {/* Empty state */}
            {!loading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <BellOff className="h-7 w-7 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">We'll let you know when something happens</p>
              </div>
            )}

            {/* Notification list */}
            {!loading && notifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => markOneRead(notif.id)}
                className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-colors ${
                  notif.is_read
                    ? "bg-white"
                    : "bg-white border-l-4 border-[#7B2FBE]"
                }`}
              >
                <NotifIcon type={notif.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${notif.is_read ? "text-gray-700 font-medium" : "text-gray-900 font-bold"}`}>
                      {notif.title}
                    </p>
                    {!notif.is_read && (
                      <div className="h-2 w-2 rounded-full bg-[#7B2FBE] shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{notif.body}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-gray-300 font-medium">{timeAgo(notif.created_at)}</span>
                    {notif.listing_id && (
                      <Link
                        href={`/listings/${notif.listing_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-[#7B2FBE] font-semibold flex items-center gap-0.5"
                      >
                        View listing <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── SETTINGS TAB ──────────────────────────────────────────────── */}
        {tab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pt-4 pb-10 space-y-4"
          >
            {/* Master toggle */}
            <div className="bg-white rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Bell className="text-[#7B2FBE] h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Push Notifications</p>
                  <p className="text-xs text-gray-400">Allow Nyumba Sasa to send alerts</p>
                </div>
              </div>
              <Switch
                checked={masterEnabled}
                onChange={setMasterEnabled}
                style={{ background: masterEnabled ? "#7B2FBE" : undefined }}
              />
            </div>

            {PREF_SECTIONS.map((section, si) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * (si + 1) }}
                className={`bg-white rounded-2xl overflow-hidden ${!masterEnabled ? "opacity-40 pointer-events-none" : ""}`}
              >
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-4 pb-2">
                  {section.title}
                </p>
                {section.items.map(({ icon: Icon, label, desc, key }, i) => (
                  <div
                    key={key}
                    className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400 truncate">{desc}</p>
                    </div>
                    <Switch
                      size="small"
                      checked={prefs[key]}
                      onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
                      style={{ background: prefs[key] ? "#7B2FBE" : undefined }}
                    />
                  </div>
                ))}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Demo notifications shown when backend is unavailable ────────────────────
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "d1",
    user_id: "",
    type: "listing",
    title: "New listing matches your search",
    body: "A 2-bedroom apartment in Westlands just listed for KES 35,000/mo.",
    is_read: false,
    listing_id: null,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "d2",
    user_id: "",
    type: "message",
    title: "New message from Agent",
    body: "\"Hi! The property is still available. When would you like to view it?\"",
    is_read: false,
    listing_id: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "d3",
    user_id: "",
    type: "system",
    title: "Welcome to Nyumba Sasa! 🎉",
    body: "Your account is set up. Explore thousands of verified homes across Africa.",
    is_read: true,
    listing_id: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "d4",
    user_id: "",
    type: "promo",
    title: "Featured listings this week",
    body: "Check out this week's top verified properties near you at great prices.",
    is_read: true,
    listing_id: null,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];
