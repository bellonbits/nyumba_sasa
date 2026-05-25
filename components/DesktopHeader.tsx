"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Heart, Compass, MessageSquare, User, Bell, LogOut, ShieldCheck, ShieldAlert } from "lucide-react";
import { Badge, Avatar, Dropdown, MenuProps } from "antd";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", Icon: Home },
  { href: "/search", label: "Explore", Icon: Compass },
  { href: "/favorites", label: "Favorites", Icon: Heart },
  { href: "/messages", label: "Messages", Icon: MessageSquare },
  { href: "/profile", label: "Profile", Icon: User },
];

export default function DesktopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    
    async function loadData() {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Get profile details
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (prof) {
        setProfile({ ...prof, email: user.email });
      }

      // 3. Count unread messages
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false);
      
      setUnreadCount(count ?? 0);
    }

    loadData();

    // Subscribe to new message notifications for badge updates
    const channel = supabase
      .channel("desktop-header-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        loadData();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/onboarding");
    router.refresh();
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "name",
      label: (
        <div className="px-1 py-1.5">
          <p className="font-bold text-gray-900 leading-tight mb-0.5">{profile?.name || "User"}</p>
          <p className="text-xs text-gray-400 leading-none truncate max-w-[180px]">{profile?.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "profile",
      icon: <User size={15} />,
      label: <Link href="/profile">My Profile</Link>,
    },
    {
      key: "favorites",
      icon: <Heart size={15} />,
      label: <Link href="/favorites">Saved Homes</Link>,
    },
    {
      key: "messages",
      icon: <MessageSquare size={15} />,
      label: <Link href="/messages">My Messages</Link>,
    },
    { type: "divider" },
    {
      key: "signout",
      icon: <LogOut size={15} className="text-red-500" />,
      danger: true,
      label: <span onClick={handleSignOut}>Sign Out</span>,
    },
  ];

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 h-16 bg-white/85 backdrop-blur-md border-b border-gray-100/80 z-50 transition-all">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href="/home" className="flex items-center gap-2.5 group">
          <div className="h-8.5 w-8.5 rounded-xl bg-white border border-[#7B2FBE]/15 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Image src="/logo.png" alt="Nyumba Sasa Logo" width={20} height={20} className="object-contain" />
          </div>
          <span className="text-gray-900 text-[17px] font-black tracking-tight leading-none">
            Nyumba <span className="text-[#7B2FBE] group-hover:text-purple-600 transition-colors">Sasa</span>
          </span>
        </Link>

        {/* Navigation Middle Menu */}
        <nav className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-full border border-gray-200/40">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname === href || (pathname.startsWith(href + "/") && href !== "/");

            return (
              <Link key={href} href={href} className="relative px-4 py-2 flex items-center gap-1.5 rounded-full transition-colors duration-250 select-none text-xs font-bold">
                {isActive ? (
                  <>
                    <motion.div
                      layoutId="desktop-nav-pill"
                      className="absolute inset-0 bg-[#7B2FBE] rounded-full shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                    <span className="relative z-10 flex items-center gap-1.5 text-white">
                      <Icon size={14} className="fill-current" />
                      <span>{label}</span>
                    </span>
                  </>
                ) : (
                  <span className="relative z-10 flex items-center gap-1.5 text-gray-500 hover:text-gray-950 transition-colors duration-200">
                    <Icon size={14} />
                    <span>{label}</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile / Actions on Right */}
        <div className="flex items-center gap-4">
          {/* Notifications button */}
          <Badge count={unreadCount} overflowCount={9} size="small" offset={[-2, 2]}>
            <Link href="/profile/notifications">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-9.5 w-9.5 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors relative"
              >
                <Bell size={17} />
              </motion.button>
            </Link>
          </Badge>

          {/* Profile Dropdown */}
          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight" arrow>
            <div className="flex items-center gap-2 cursor-pointer select-none pl-1.5 py-1 pr-3 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200/50">
              <Avatar src={profile?.avatar_url} style={{ backgroundColor: "#7B2FBE", fontSize: 13 }} size={32}>
                {getInitials(profile?.name || "U")}
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-gray-800 leading-none mb-0.5 max-w-[90px] truncate">
                  {profile?.name ? profile.name.split(" ")[0] : "Account"}
                </p>
                <p className="text-[10px] text-gray-400 font-semibold leading-none">
                  {profile?.role === "agent" ? "Agent" : profile?.role === "landlord" ? "Landlord" : "Tenant"}
                </p>
              </div>
            </div>
          </Dropdown>
        </div>

      </div>
    </header>
  );
}
