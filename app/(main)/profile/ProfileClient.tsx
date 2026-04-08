"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, Card, Tag, Divider, App } from "antd";
import {
  HeartOutlined, HomeOutlined, BellOutlined, SafetyOutlined,
  QuestionCircleOutlined, SettingOutlined, LogoutOutlined, RightOutlined,
  EditOutlined, DashboardOutlined,
} from "@ant-design/icons";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

interface ProfileClientProps {
  profile: any;
  email: string;
  favCount: number;
  listingCount: number;
}

const ROLE_COLORS: Record<string, string> = { user: "blue", agent: "orange", admin: "red" };
const ROLE_LABELS: Record<string, string> = { user: "Home Seeker", agent: "Agent", admin: "Admin" };

const MENU = [
  { icon: BellOutlined, label: "Notifications", href: "/profile/notifications" },
  { icon: SafetyOutlined, label: "Privacy & Security", href: "/profile/security" },
  { icon: QuestionCircleOutlined, label: "Help & Support", href: "/profile/support" },
  { icon: SettingOutlined, label: "Settings", href: "/profile/settings" },
];

export default function ProfileClient({ profile, email, favCount, listingCount }: ProfileClientProps) {
  const router = useRouter();
  const { modal } = App.useApp();

  async function handleSignOut() {
    modal.confirm({
      title: "Sign out?",
      content: "You'll need to sign in again to access your account.",
      okText: "Sign Out",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      onOk: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/onboarding");
        router.refresh();
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      {/* Header card */}
      <div className="bg-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar src={profile?.avatar_url} size={64} style={{ background: "#FF6A00", fontSize: 22 }}>
              {getInitials(profile?.name ?? "U")}
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{profile?.name ?? "User"}</h1>
            <p className="text-gray-400 text-sm truncate">{email}</p>
            <Tag color={ROLE_COLORS[profile?.role] ?? "blue"} className="mt-1 rounded-full text-xs">
              {ROLE_LABELS[profile?.role] ?? "User"}
            </Tag>
          </div>
          <Link href="/profile/edit">
            <button className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <EditOutlined />
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-orange-50 rounded-2xl p-4 text-center">
            <HeartOutlined className="text-[#FF6A00] text-xl mb-1" />
            <p className="text-2xl font-bold text-gray-900">{favCount}</p>
            <p className="text-xs text-gray-500">Saved Homes</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <HomeOutlined className="text-gray-500 text-xl mb-1" />
            <p className="text-2xl font-bold text-gray-900">{listingCount}</p>
            <p className="text-xs text-gray-500">{profile?.role === "user" ? "Viewed" : "My Listings"}</p>
          </div>
        </div>
      </div>

      {/* Agent / Admin CTA */}
      {profile?.role === "agent" && (
        <div className="px-4 mt-3">
          <Link href="/agent">
            <div className="bg-[#FF6A00] text-white rounded-2xl px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HomeOutlined className="text-xl" />
                <div>
                  <p className="font-semibold text-sm">Agent Dashboard</p>
                  <p className="text-white/70 text-xs">Manage your listings</p>
                </div>
              </div>
              <RightOutlined />
            </div>
          </Link>
        </div>
      )}

      {profile?.role === "admin" && (
        <div className="px-4 mt-3">
          <Link href="/admin">
            <div className="bg-gray-900 text-white rounded-2xl px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DashboardOutlined className="text-xl" />
                <div>
                  <p className="font-semibold text-sm">Admin Dashboard</p>
                  <p className="text-white/70 text-xs">Moderate listings & users</p>
                </div>
              </div>
              <RightOutlined />
            </div>
          </Link>
        </div>
      )}

      {/* Menu */}
      <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden">
        {MENU.map(({ icon: Icon, label, href }, i) => (
          <Link key={label} href={href}>
            <div className={`flex items-center gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors ${i > 0 ? "border-t border-gray-50" : ""}`}>
              <div className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                <Icon />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-800">{label}</span>
              <RightOutlined className="text-gray-300 text-xs" />
            </div>
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <div className="mx-4 mt-3 mb-6">
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-4 bg-white rounded-2xl hover:bg-red-50 transition-colors">
          <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center">
            <LogoutOutlined className="text-red-500" />
          </div>
          <span className="text-sm font-medium text-red-500">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
