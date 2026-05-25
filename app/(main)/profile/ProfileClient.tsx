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
    <div className="min-h-screen bg-[#F5F5F8] pt-12 md:pt-4">
      <div className="max-w-6xl mx-auto w-full pb-24 px-4 sm:px-6">
        
        {/* Page Title */}
        <div className="mb-6 hidden md:block">
          <h1 className="text-2xl font-black text-gray-900 leading-none">Account Suite</h1>
          <p className="text-gray-400 text-xs mt-1">Manage your credentials, reputation badges, and preference parameters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN: Profile Header & Reputation Stats (1/3 width) */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Main Profile Info Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <Avatar src={profile?.avatar_url} size={80} style={{ background: "#7B2FBE", fontSize: 28 }}>
                    {getInitials(profile?.name ?? "U")}
                  </Avatar>
                  {profile?.identity_verified && (
                    <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 shadow border border-white">
                      <BadgeCheck className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <h2 className="text-lg font-extrabold text-gray-900 leading-none">{profile?.name ?? "User"}</h2>
                    {profile?.email_verified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
                  <p className="text-gray-400 text-xs truncate max-w-[200px]">{email}</p>
                </div>
                
                <Tag color={ROLE_COLORS[profile?.role ?? "user"] ?? "blue"} className="rounded-full text-xs font-bold px-3 py-0.5 border-none">
                  {ROLE_LABELS[profile?.role ?? "user"] ?? "User"}
                </Tag>
                
                <Link href="/profile/edit" className="w-full pt-2">
                  <button className="w-full py-2.5 rounded-full bg-gray-50 border border-gray-150 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors">
                    Edit Profile Credentials
                  </button>
                </Link>
              </div>

              {/* Saved homes counts */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-gray-100">
                <div className="bg-purple-50/50 rounded-2xl p-3 flex flex-col items-center text-center">
                  <Heart className="text-[#7B2FBE] h-4.5 w-4.5 mb-1" />
                  <p className="text-xl font-black text-gray-900 leading-none mb-1">{favCount}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Saved</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center text-center">
                  <Home className="text-gray-500 h-4.5 w-4.5 mb-1" />
                  <p className="text-xl font-black text-gray-900 leading-none mb-1">{listingCount}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    {profile?.role === "user" || profile?.role === "tenant" ? "Viewed" : "Listings"}
                  </p>
                </div>
              </div>
            </div>

            {/* Dashboard Dash Links (Agents / Landlords / Admins) */}
            {(profile?.role === "agent" || profile?.role === "landlord") && (
              <Link href="/agent">
                <div className="bg-[#7B2FBE] hover:bg-[#8e3ee6] transition-colors text-white rounded-3xl p-5 flex items-center justify-between shadow-sm cursor-pointer border border-[#7B2FBE]">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5" />
                    <div>
                      <p className="font-bold text-sm">Agent Dashboard</p>
                      <p className="text-white/70 text-xs">Manage active listings</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </div>
              </Link>
            )}

            {profile?.role === "admin" && (
              <Link href="/admin">
                <div className="bg-gray-900 hover:bg-black transition-colors text-white rounded-3xl p-5 flex items-center justify-between shadow-sm cursor-pointer border border-gray-900">
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-5 w-5" />
                    <div>
                      <p className="font-bold text-sm">Admin Panel</p>
                      <p className="text-white/70 text-xs">Moderate transactions</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </div>
              </Link>
            )}

            {/* Reputation metrics inside left column */}
            {isLandlordOrAgent && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reputation Indicators</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 text-gray-600 font-semibold"><Clock className="h-3.5 w-3.5 text-blue-500" /> Response rate</span>
                      <span className="font-extrabold text-gray-900">{Math.round(responseRate)}%</span>
                    </div>
                    <Progress percent={responseRate} showInfo={false} strokeColor="#7B2FBE" trailColor="#F0EEF8" size="small" />
                  </div>
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                      <TrendingUp className="h-3.5 w-3.5 text-green-500" /> Vetted Matches
                    </span>
                    <span className="font-extrabold text-green-600">{successfulRentals}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Trust Score & Verification + Settings Menus (2/3 width) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Trust Panel Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Platform Trust Standing</p>
              <div className="flex items-center gap-5 pb-5 border-b border-gray-50">
                <TrustScoreRing score={trustScore} />
                <div className="space-y-1">
                  <p className="text-sm font-extrabold text-gray-900 leading-none">
                    {trustScore >= 80 ? "Trusted Member Badged" : trustScore >= 60 ? "Building Active Trust" : "New Renter Member"}
                  </p>
                  <p className="text-gray-400 text-xs leading-normal">
                    {trustScore >= 80
                      ? "Your account carries high physical audit reliability — priority booking slots active."
                      : "Complete all verification procedures to earn the Nyumba Sasa physical badge."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <VerificationBadge verified={!!profile?.email_verified} label="Email Address Cleared" icon={Mail} />
                <VerificationBadge verified={!!profile?.identity_verified} label="Physical Identity Registered" icon={Fingerprint} />
              </div>

              {(!profile?.email_verified || !profile?.identity_verified) && (
                <Link href="/profile/verify">
                  <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-100/60 cursor-pointer hover:bg-amber-100/30 transition-colors">
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700 font-bold flex-1">
                      Complete remaining audit steps to activate verification badge
                    </p>
                    <ChevronRight className="h-4 w-4 text-amber-400" />
                  </div>
                </Link>
              )}
            </div>

            {/* Menu Options List */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              {MENU.map(({ icon: Icon, label, href }, i) => (
                <Link key={label} href={href}>
                  <div className={`flex items-center gap-3.5 px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors ${i > 0 ? "border-t border-gray-100" : ""}`}>
                    <div className="h-8.5 w-8.5 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100/60">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1 text-xs font-bold text-gray-800">{label}</span>
                    <ChevronRight className="text-gray-300 h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Sign Out Trigger */}
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-5 py-4 bg-white rounded-3xl hover:bg-red-50 transition-colors shadow-2xs text-left border border-gray-100">
              <div className="h-8.5 w-8.5 rounded-xl bg-red-50 flex items-center justify-center border border-red-100/35">
                <LogOut className="text-red-500 h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-red-500">Sign Out Credentials</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
