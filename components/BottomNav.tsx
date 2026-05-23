"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Heart, Compass, MessageSquare, User } from "lucide-react";

const NAV = [
  { href: "/home",      label: "Home",      Icon: Home },
  { href: "/favorites", label: "Favorites",  Icon: Heart },
  { href: "/search",    label: "Explore",    Icon: Compass },
  { href: "/messages",  label: "Messages",   Icon: MessageSquare },
  { href: "/profile",   label: "Profile",    Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white border-t border-gray-100/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-[62px] px-3">
        {NAV.map(({ href, label, Icon }) => {
          const isActive = pathname === href || (pathname.startsWith(href + "/") && href !== "/");

          return (
            <Link key={href} href={href} className="flex flex-col items-center justify-center flex-1 h-full">
              {isActive ? (
                <motion.div
                  layoutId="nav-pill"
                  className="flex items-center gap-1.5 bg-[#7B2FBE] text-white px-4 py-2 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                >
                  <Icon size={18} fill="currentColor" />
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    className="text-[12px] font-semibold overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                </motion.div>
              ) : (
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="flex flex-col items-center gap-0.5"
                >
                  <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon size={18} className="text-gray-400" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
