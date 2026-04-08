"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AppLoader({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-white ${
        fullScreen ? "min-h-screen" : "min-h-[40vh]"
      }`}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="h-20 w-20 rounded-3xl overflow-hidden shadow-lg bg-white border border-gray-100 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Nyumba Sasa"
            width={72}
            height={72}
            className="object-contain"
            priority
          />
        </div>
      </motion.div>

      {/* App name */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="text-lg font-extrabold text-gray-900 tracking-tight mb-1"
      >
        Nyumba <span className="text-[#7B2FBE]">Sasa</span>
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="text-xs text-gray-400 mb-10"
      >
        Find Your Dream Home
      </motion.p>

      {/* Animated progress bar */}
      <div className="w-44 h-1 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#7B2FBE] rounded-full"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Three bouncing dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-[#7B2FBE]"
            animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.18,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
