"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, Card, Tag, Divider, App, Progress } from "antd";
import {
  Heart,
  Home,
  Bell,
  Shield,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  Edit,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  Star,
  TrendingUp,
  Clock,
  AlertTriangle,
  Mail,
  Fingerprint,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import type { User } from "@/lib/types";
import { motion } from "framer-motion";

interface ProfileClientProps {
  profile: User | null;
  email: string;
  favCount: number;
  listingCount: number;
}

const ROLE_COLORS: Record<string, string> = {
  user: "blue",
  tenant: "blue",
  agent: "orange",
  landlord: "orange",
  admin: "red",
};
const ROLE_LABELS: Record<string, string> = {
  user: "Home Seeker",
  tenant: "Tenant",
  agent: "Agent",
  landlord: "Landlord",
  admin: "Admin",
};

const MENU = [
  { icon: Bell, label: "Notifications", href: "/profile/notifications" },
  { icon: Shield, label: "Privacy & Security", href: "/profile/security" },
  { icon: HelpCircle, label: "Help & Support", href: "/profile/support" },
  { icon: Settings, label: "Settings", href: "/profile/settings" },
];

function TrustScoreRing({ score }: { score: number }) {
  const radius = 32;
  const stroke = 5;
  const normalized = radius - stroke * 2;
  const circumference = normalized * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={radius * 2} height={radius * 2} className="-rotate-90">
        <circle cx={radius} cy={radius} r={normalized} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
        <circle
          cx={radius} cy={radius} r={normalized} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-gray-900">{Math.round(score)}</span>
    </div>
  );
}

function VerificationBadge({ verified, label, icon: Icon }: { verified: boolean; label: string; icon: React.ElementType }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
      verified ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"
    }`}>
      <Icon className={`h-3.5 w-3.5 ${verified ? "text-green-500" : "text-gray-300"}`} />
      {verified
        ? <><CheckCircle2 className="h-3 w-3 text-green-500" /> {label}</>
        : <><XCircle className="h-3 w-3 text-gray-300" /> {label}</>
      }
    </div>
  );
}

export default function ProfileClient({ profile, email, favCount, listingCount }: ProfileClientProps) {
  const router = useRouter();
  const { modal } = App.useApp();

  const trustScore = profile?.trust_score ?? 90;
  const responseRate = profile?.response_rate ?? 100;
  const successfulRentals = profile?.successful_rentals ?? 0;
  const isLandlordOrAgent = profile?.role === "landlord" || profile?.role === "agent";

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
      <div className="max-w-3xl mx-auto w-full pb-24">
      
      {/* Header card */}
      <div className="bg-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar src={profile?.avatar_url} size={64} style={{ background: "#FF6A00", fontSize: 22 }}>
              {getInitials(profile?.name ?? "U")}
            </Avatar>
            {profile?.identity_verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 shadow">
                <BadgeCheck className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 truncate">{profile?.name ?? "User"}</h1>
              {profile?.email_verified && (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              )}
            </div>
            <p className="text-gray-400 text-sm truncate">{email}</p>
            <Tag color={ROLE_COLORS[profile?.role ?? "user"] ?? "blue"} className="mt-1 rounded-full text-xs">
              {ROLE_LABELS[profile?.role ?? "user"] ?? "User"}
            </Tag>
          </div>
          <Link href="/profile/edit">
            <button className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
              <Edit className="h-4 w-4" />
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-orange-50 rounded-2xl p-4 flex flex-col items-center text-center">
            <Heart className="text-[#FF6A00] h-5 w-5 mb-1" />
            <p className="text-2xl font-bold text-gray-900">{favCount}</p>
            <p className="text-xs text-gray-500">Saved Homes</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center text-center">
            <Home className="text-gray-500 h-5 w-5 mb-1" />
            <p className="text-2xl font-bold text-gray-900">{listingCount}</p>
            <p className="text-xs text-gray-500">{profile?.role === "user" || profile?.role === "tenant" ? "Viewed" : "My Listings"}</p>
          </div>
        </div>
      </div>

      {/* Trust Score Panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm"
      >
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Trust Score</p>
        <div className="flex items-center gap-4">
          <TrustScoreRing score={trustScore} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              {trustScore >= 80 ? "Trusted Member" : trustScore >= 60 ? "Building Trust" : "New Member"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {trustScore >= 80
                ? "High credibility — priority listing access"
                : "Complete verification to improve score"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <VerificationBadge verified={!!profile?.email_verified} label="Email" icon={Mail} />
          <VerificationBadge verified={!!profile?.identity_verified} label="Identity" icon={Fingerprint} />
        </div>

        {(!profile?.email_verified || !profile?.identity_verified) && (
          <Link href="/profile/verify">
            <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 font-medium flex-1">
                Complete verification to unlock full trust badge
              </p>
              <ChevronRight className="h-4 w-4 text-amber-400" />
            </div>
          </Link>
        )}
      </motion.div>

      {/* Reputation Panel (Landlords & Agents) */}
      {isLandlordOrAgent && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm"
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Reputation Metrics</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-gray-600"><Clock className="h-3.5 w-3.5 text-blue-500" /> Response Rate</span>
                <span className="font-semibold text-gray-800">{Math.round(responseRate)}%</span>
              </div>
              <Progress percent={responseRate} showInfo={false} strokeColor="#3B82F6" trailColor="#E5E7EB" size="small" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="flex items-center gap-1.5 text-xs text-gray-600">
                <TrendingUp className="h-3.5 w-3.5 text-green-500" /> Successful Rentals
              </span>
              <span className="text-sm font-bold text-green-600">{successfulRentals}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-gray-600">
                <Star className="h-3.5 w-3.5 text-yellow-500" fill="currentColor" /> Platform Rating
              </span>
              <span className="text-sm font-bold text-yellow-600">
                {successfulRentals > 0 ? "4.7" : "—"}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Agent / Landlord CTA */}
      {(profile?.role === "agent" || profile?.role === "landlord") && (
        <div className="px-4 mt-3">
          <Link href="/agent">
            <div className="bg-[#FF6A00] hover:bg-[#e05d00] transition-colors text-white rounded-2xl px-4 py-4 flex items-center justify-between shadow-sm cursor-pointer">
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5" />
                <div>
                  <p className="font-semibold text-sm">Agent Dashboard</p>
                  <p className="text-white/70 text-xs">Manage your listings</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5" />
            </div>
          </Link>
        </div>
      )}

      {profile?.role === "admin" && (
        <div className="px-4 mt-3">
          <Link href="/admin">
            <div className="bg-gray-900 hover:bg-black transition-colors text-white rounded-2xl px-4 py-4 flex items-center justify-between shadow-sm cursor-pointer">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-5 w-5" />
                <div>
                  <p className="font-semibold text-sm">Admin Dashboard</p>
                  <p className="text-white/70 text-xs">Moderate listings & users</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5" />
            </div>
          </Link>
        </div>
      )}

      {/* Menu */}
      <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden shadow-sm">
        {MENU.map(({ icon: Icon, label, href }, i) => (
          <Link key={label} href={href}>
            <div className={`flex items-center gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors ${i > 0 ? "border-t border-gray-100" : ""}`}>
              <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                <Icon className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-800">{label}</span>
              <ChevronRight className="text-gray-300 h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <div className="mx-4 mt-3 mb-6">
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-4 bg-white rounded-2xl hover:bg-red-50 transition-colors shadow-sm text-left">
          <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center">
            <LogOut className="text-red-500 h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-red-500">Sign Out</span>
        </button>
      </div>
      </div>
    </div>
  );
}
