"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Switch } from "antd";
import {
  ArrowLeftOutlined, BellOutlined, MessageOutlined,
  HeartOutlined, HomeOutlined, TagOutlined, SoundOutlined,
} from "@ant-design/icons";

const SECTIONS = [
  {
    title: "Activity",
    items: [
      { icon: MessageOutlined, label: "New messages", desc: "When someone replies to your inquiry", key: "messages" },
      { icon: HeartOutlined, label: "Saved home updates", desc: "Price changes on your saved listings", key: "favorites" },
      { icon: HomeOutlined, label: "New listings nearby", desc: "Properties matching your search", key: "nearby" },
    ],
  },
  {
    title: "Promotions",
    items: [
      { icon: TagOutlined, label: "Deals & offers", desc: "Special pricing from verified agents", key: "deals" },
      { icon: SoundOutlined, label: "News & updates", desc: "Platform announcements", key: "news" },
    ],
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    messages: true, favorites: true, nearby: false, deals: false, news: true,
  });

  return (
    <div className="min-h-screen bg-[#F5F5F8]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      {/* Header */}
      <div className="bg-white px-4 flex items-center gap-3 border-b border-gray-100" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: "16px" }}>
        <button onClick={() => router.back()} className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
          <ArrowLeftOutlined />
        </button>
        <h1 className="text-base font-bold text-gray-900">Notifications</h1>
      </div>

      <div className="px-4 pt-5 space-y-4 pb-10">
        {/* Master toggle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <BellOutlined className="text-[#7B2FBE] text-lg" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Push Notifications</p>
              <p className="text-xs text-gray-400">Allow Nyumba Sasa to send alerts</p>
            </div>
          </div>
          <Switch
            defaultChecked
            style={{ background: prefs.messages ? "#7B2FBE" : undefined }}
          />
        </motion.div>

        {SECTIONS.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 * (si + 1) }}
            className="bg-white rounded-2xl overflow-hidden"
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-4 pb-2">{section.title}</p>
            {section.items.map(({ icon: Icon, label, desc, key }, i) => (
              <div
                key={key}
                className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-gray-50" : ""}`}
              >
                <div className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                  <Icon />
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
      </div>
    </div>
  );
}
