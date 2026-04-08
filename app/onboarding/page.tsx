"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightOutlined } from "@ant-design/icons";

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&q=80",
    tag: "For Rent & Sale",
    title: "Find Your\nDream Home",
    sub: "Discover properties tailored to your preferences across Africa.",
  },
  {
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80",
    tag: "Verified Agents",
    title: "Connect With\nTrusted Agents",
    sub: "Chat directly with verified landlords and property managers.",
  },
  {
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80",
    tag: "10K+ Listings",
    title: "Across All\nAfrican Cities",
    sub: "Nairobi, Lagos, Accra, Dar es Salaam and more — all in one app.",
  },
];

export default function OnboardingPage() {
  const [slide, setSlide] = useState(0);
  const [launched, setLaunched] = useState(false);

  // Auto-advance slides
  useEffect(() => {
    const t = setTimeout(() => {
      if (slide < SLIDES.length - 1) setSlide((s) => s + 1);
    }, 3500);
    return () => clearTimeout(t);
  }, [slide]);

  const current = SLIDES[slide];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-black">

      {/* Background image — crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={current.image}
            alt={current.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/88" />
        </motion.div>
      </AnimatePresence>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative pt-14 px-6 flex items-center gap-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 52px)" }}
      >
        <div className="h-10 w-10 rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-lg">
          <Image src="/logo.png" alt="Nyumba Sasa" width={40} height={40} className="object-contain" />
        </div>
        <span className="text-white text-xl font-extrabold tracking-tight drop-shadow">
          Nyumba <span className="text-[#FFE135]">Sasa</span>
        </span>
      </motion.div>

      {/* Slide dots */}
      <div className="relative flex justify-center gap-2 mt-auto pt-4">
        {SLIDES.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setSlide(i)}
            animate={{ width: i === slide ? 28 : 8, opacity: i === slide ? 1 : 0.45 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="h-2 rounded-full bg-white"
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative px-6 pb-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45 }}
          >
            {/* Tag pill */}
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1 mb-4">
              <div className="h-1.5 w-1.5 rounded-full bg-[#FFE135]" />
              <span className="text-white text-xs font-semibold">{current.tag}</span>
            </div>

            <h1 className="text-white font-extrabold leading-tight mb-3" style={{ fontSize: 42 }}>
              {current.title.split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h1>
            <p className="text-white/65 text-base leading-relaxed">{current.sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="relative px-6 pb-10 space-y-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)" }}
      >
        <Link href="/register" className="block">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full h-14 bg-[#7B2FBE] text-white text-base font-bold rounded-full flex items-center justify-center gap-2 shadow-xl"
          >
            Get Started
            <ArrowRightOutlined />
          </motion.button>
        </Link>

        <Link href="/login" className="block">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full h-14 bg-white/12 backdrop-blur-sm border border-white/25 text-white text-base font-semibold rounded-full"
          >
            I already have an account
          </motion.button>
        </Link>

        {/* Stats row */}
        <div className="flex justify-center gap-6 pt-3">
          {["10K+ Listings", "Verified Agents", "Free to Browse"].map((f) => (
            <div key={f} className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#FFE135]" />
              <span className="text-white/55 text-xs font-medium">{f}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
