"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeftOutlined, LockOutlined, MobileOutlined, EyeOutlined,
  FileTextOutlined, DeleteOutlined, RightOutlined, SafetyCertificateOutlined,
} from "@ant-design/icons";

const ITEMS = [
  {
    icon: LockOutlined,
    label: "Change Password",
    desc: "Update your account password",
    href: "/forgot-password",
    color: "bg-purple-50",
    iconColor: "text-[#7B2FBE]",
  },
  {
    icon: MobileOutlined,
    label: "Two-Factor Authentication",
    desc: "Add an extra layer of security",
    href: "#",
    color: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    icon: EyeOutlined,
    label: "Active Sessions",
    desc: "Manage devices signed in to your account",
    href: "#",
    color: "bg-green-50",
    iconColor: "text-green-500",
  },
  {
    icon: FileTextOutlined,
    label: "Privacy Policy",
    desc: "How we handle your data",
    href: "/profile/privacy-policy",
    color: "bg-gray-100",
    iconColor: "text-gray-500",
  },
  {
    icon: DeleteOutlined,
    label: "Delete Account",
    desc: "Permanently remove your account",
    href: "/profile/delete-account",
    color: "bg-red-50",
    iconColor: "text-red-500",
    danger: true,
  },
];

export default function SecurityPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F5F8]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="bg-white px-4 flex items-center gap-3 border-b border-gray-100" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: "16px" }}>
        <button onClick={() => router.back()} className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
          <ArrowLeftOutlined />
        </button>
        <h1 className="text-base font-bold text-gray-900">Privacy &amp; Security</h1>
      </div>

      <div className="px-4 pt-5 pb-10 space-y-4">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-gradient-to-r from-[#7B2FBE] to-[#9B4FDE] rounded-2xl p-5 flex items-center gap-4"
        >
          <SafetyCertificateOutlined className="text-white text-3xl shrink-0" />
          <div>
            <p className="text-white font-bold text-sm">Your account is protected</p>
            <p className="text-white/70 text-xs mt-0.5">We use 256-bit encryption to keep your data safe.</p>
          </div>
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="bg-white rounded-2xl overflow-hidden"
        >
          {ITEMS.map(({ icon: Icon, label, desc, href, color, iconColor, danger }, i) => (
            <Link key={label} href={href}>
              <div className={`flex items-center gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors ${i > 0 ? "border-t border-gray-50" : ""}`}>
                <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                  <Icon className={iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${danger ? "text-red-500" : "text-gray-800"}`}>{label}</p>
                  <p className="text-xs text-gray-400 truncate">{desc}</p>
                </div>
                <RightOutlined className="text-gray-300 text-xs" />
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
