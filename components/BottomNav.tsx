"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  HomeOutlined, HomeFilled,
  HeartOutlined, HeartFilled,
  EnvironmentOutlined, EnvironmentFilled,
  MessageOutlined, MessageFilled,
  UserOutlined,
} from "@ant-design/icons";

const NAV = [
  { href: "/home",      label: "Home",      IconOff: HomeOutlined,        IconOn: HomeFilled },
  { href: "/favorites", label: "Favorites",  IconOff: HeartOutlined,       IconOn: HeartFilled },
  { href: "/search",    label: "Explore",    IconOff: EnvironmentOutlined, IconOn: EnvironmentFilled },
  { href: "/messages",  label: "Messages",   IconOff: MessageOutlined,     IconOn: MessageFilled },
  { href: "/profile",   label: "Profile",    IconOff: UserOutlined,        IconOn: UserOutlined },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white border-t border-gray-100/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-[62px] px-3">
        {NAV.map(({ href, label, IconOff, IconOn }) => {
          const isActive = pathname === href || (pathname.startsWith(href + "/") && href !== "/");
          const Icon = isActive ? IconOn : IconOff;

          return (
            <Link key={href} href={href} className="flex flex-col items-center justify-center flex-1 h-full">
              {isActive ? (
                <motion.div
                  layoutId="nav-pill"
                  className="flex items-center gap-1.5 bg-[#7B2FBE] text-white px-4 py-2 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                >
                  <Icon style={{ fontSize: 18 }} />
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
                    <Icon style={{ fontSize: 18, color: "#9ca3af" }} />
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
