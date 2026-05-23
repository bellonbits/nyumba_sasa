"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Briefcase,
  Globe,
  Home,
  Key,
  Zap,
  X
} from "lucide-react";

// Define the Minimum Viable Segments (MVS)
const SEGMENTS = [
  {
    id: "student",
    icon: "🎓",
    label: "Student",
    desc: "Moving near campus, budget-focused",
    tagline: "The smartest way to find student hostels and apartments.",
    pain: "Tired of sketchy hostel brokers, fake deposits, and endless campus-radius walking.",
    gain: "100% verified rooms near campus with transparent pricing and instant tour booking.",
    slides: [
      {
        image: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=900&q=80",
        tag: "Near Campus",
        title: "Verified Student\nHostels & Rooms",
        sub: "Direct verification by Nyumba Sasa representatives so you never lose deposits to fake campus brokers.",
      },
      {
        image: "https://images.unsplash.com/photo-1527891751199-7225231a68dd?w=900&q=80",
        tag: "Zero Broker Fees",
        title: "Keep Your\nMoney Safe",
        sub: "Deal directly with verified landlords and property managers near your university. No agent markup.",
      }
    ]
  },
  {
    id: "professional",
    icon: "💼",
    label: "Young Professional",
    desc: "Relocating for work, time-sensitive",
    tagline: "Optimized housing search for active working lifestyles.",
    pain: "Frustrated by long commutes, poor Wi-Fi descriptions, and surprise utility outages.",
    gain: "Search by commute time to key business districts and review audited Wi-Fi / power uptime logs.",
    slides: [
      {
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&q=80",
        tag: "Commute Matcher",
        title: "Live Close to\nYour Workplace",
        sub: "Filter homes by commute duration. See walking, boda, and driving times to your office instantly.",
      },
      {
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",
        tag: "Utility Audits",
        title: "Work-Ready\nHome Amenities",
        sub: "Audited power backup, fiber broadband speeds, and water flow status fully listed on every approved home.",
      }
    ]
  },
  {
    id: "diaspora",
    icon: "🌍",
    label: "Diaspora Client",
    desc: "Searching remotely with high trust requirements",
    tagline: "Total peace-of-mind remote home securing.",
    pain: "Distrust of remote viewing, worries about local family scams, and lack of visual transparency.",
    gain: "Comprehensive physical inspections, verified titles, and live walkthrough video guarantees.",
    slides: [
      {
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80",
        tag: "Video Guarantees",
        title: "Immersive virtual\nwalkthrough tours",
        sub: "Review real high-definition tours filmed by our physical audit team. No photoshopped listings.",
      },
      {
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80",
        tag: "Escrow & Trust",
        title: "100% Secure\nRemote Booking",
        sub: "Verified landlord deeds and secure holding deposit structures, protecting your remote investments.",
      }
    ]
  },
  {
    id: "family",
    icon: "🏡",
    label: "Family Seeker",
    desc: "Seeking secure, affordable long-term space",
    tagline: "Peaceful family-focused home discovery.",
    pain: "Worry about neighborhood safety, school distance, and unexpected rent increases.",
    gain: "Granular neighborhood safety indexes, water reliability logs, and direct-to-owner pricing.",
    slides: [
      {
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80",
        tag: "Safety Audited",
        title: "Secure Spaces\nFor Your Family",
        sub: "Granular community reviews, local security metrics, and proximity audits to top-rated schools.",
      },
      {
        image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=900&q=80",
        tag: "Water & Power",
        title: "Reliable Utilities\nUptime Audited",
        sub: "Physical checklogs verifying borehole water quality, water-tank backup capacity, and grid stability.",
      }
    ]
  },
  {
    id: "landlord",
    icon: "🔑",
    label: "Landlord / Agent",
    desc: "List verified vacancies, acquire tenants fast",
    tagline: "Secure high-intent, premium pre-screened renters.",
    pain: "High vacancy rate, time wasted with uncommitted tire-kickers, and rent default anxieties.",
    gain: "Fast track verified onboarding badge, secure direct matching with screened renters.",
    slides: [
      {
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80",
        tag: "Pre-screened Matches",
        title: "Connect with\nVerified Renters",
        sub: "Receive direct, high-intent tour bookings from pre-screened candidates based on budget and timing.",
      },
      {
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80",
        tag: "Verified Badge",
        title: "Boost Listings\nTrust & Visibility",
      }
    ]
  }
];

const SEGMENT_ICONS: Record<string, React.ComponentType<any>> = {
  student: GraduationCap,
  professional: Briefcase,
  diaspora: Globe,
  family: Home,
  landlord: Key,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"segment" | "value">("segment");
  const [selectedSegment, setSelectedSegment] = useState<string>("student");
  const [slide, setSlide] = useState(0);
  const [showPainWay, setShowPainWay] = useState(false); // Penicillin switcher state

  const activeSeg = SEGMENTS.find((s) => s.id === selectedSegment) || SEGMENTS[0];
  const slides = activeSeg.slides;

  // Auto-advance slides in step 'value'
  useEffect(() => {
    if (step !== "value") return;
    const t = setTimeout(() => {
      setSlide((s) => (s < slides.length - 1 ? s + 1 : 0));
    }, 4500);
    return () => clearTimeout(t);
  }, [slide, step, slides.length]);

  const selectSegmentAndAdvance = (id: string) => {
    setSelectedSegment(id);
    localStorage.setItem("mvs_segment", id);
    setStep("value");
    setSlide(0);
  };

  const handleSkipOrStart = () => {
    router.push("/home");
  };

  // Safe area styles
  const safeAreaTop = { paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)" };
  const safeAreaBottom = { paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-black font-sans max-w-[430px] mx-auto shadow-2xl">
      
      {/* -------------------- STEP 1: SEGMENT SELECTION -------------------- */}
      {step === "segment" && (
        <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-br from-[#100520] via-black to-[#090b16] z-10">
          <div style={safeAreaTop} className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-[#7B2FBE]/20">
                <Image src="/logo.png" alt="Nyumba Sasa" width={26} height={26} className="object-contain" />
              </div>
              <span className="text-white text-lg font-extrabold tracking-tight">
                Nyumba <span className="text-[#FFE135]">Sasa</span>
              </span>
            </div>
            
            <h1 className="text-white text-3xl font-extrabold leading-tight">
              Tell us who you are
            </h1>
            <p className="text-gray-400 text-sm">
              We personalize your search with 100% verified trust metrics tailored exactly to your lifestyle.
            </p>
          </div>

          {/* Persona selector grid */}
          <div className="my-auto py-6 space-y-3">
            {SEGMENTS.map((seg) => {
              const IconComponent = SEGMENT_ICONS[seg.id] || Home;
              return (
                <motion.button
                  key={seg.id}
                  onClick={() => selectSegmentAndAdvance(seg.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#7B2FBE] hover:bg-white/[0.08] transition-all flex items-center gap-4 relative overflow-hidden group"
                >
                  <div className="h-12 w-12 rounded-xl bg-[#7B2FBE]/10 border border-[#7B2FBE]/25 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComponent className="h-6 w-6 text-[#7B2FBE] group-hover:text-[#FFE135] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-base leading-none mb-1 group-hover:text-[#FFE135] transition-colors">{seg.label}</p>
                    <p className="text-gray-400 text-xs truncate leading-none">{seg.desc}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                  <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[#7B2FBE] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              );
            })}
          </div>

          {/* Onboarding footer */}
          <div style={safeAreaBottom} className="space-y-4">
            <button
              onClick={handleSkipOrStart}
              className="w-full h-13 bg-white/10 border border-white/15 text-white font-semibold rounded-full hover:bg-white/15 active:scale-98 transition-all text-sm py-3.5"
            >
              Skip and Browse Anonymously
            </button>
            <div className="flex justify-center gap-6">
              {["100% Verified", "Escrow Protection", "Zero Scams"].map((item) => (
                <div key={item} className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#FFE135]" />
                  <span className="text-gray-500 text-[10px] font-semibold tracking-wider uppercase">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- STEP 2: TALLORED VALUE PROPOSITION & PENICILLIN CAROUSEL -------------------- */}
      {step === "value" && (
        <div className="flex-1 flex flex-col justify-between relative min-h-screen">
          
          {/* Background image crossfade */}
          <AnimatePresence mode="sync">
            <motion.div
              key={slide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-0"
            >
              <Image
                src={slides[slide].image}
                alt={slides[slide].title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#100520]/60 via-black/80 to-black" />
            </motion.div>
          </AnimatePresence>

          {/* Logo & Change Persona Link */}
          <div
            style={safeAreaTop}
            className="relative px-6 flex items-center justify-between z-10"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <Image src="/logo.png" alt="Nyumba Sasa" width={20} height={20} className="object-contain" />
              </div>
              <span className="text-white text-md font-extrabold tracking-tight drop-shadow">
                Nyumba <span className="text-[#FFE135]">Sasa</span>
              </span>
            </div>
            <button
              onClick={() => setStep("segment")}
              className="text-xs font-bold text-gray-300 hover:text-white px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5"
            >
              <span>Change Persona</span>
              {(() => {
                const ActiveIcon = SEGMENT_ICONS[activeSeg.id] || Home;
                return <ActiveIcon className="h-3.5 w-3.5 text-[#FFE135] shrink-0" />;
              })()}
            </button>
          </div>

          {/* Dynamic slides copywriting */}
          <div className="relative px-6 pt-12 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="space-y-3"
              >
                <div className="inline-flex items-center gap-1.5 bg-[#7B2FBE]/30 backdrop-blur-sm border border-[#7B2FBE]/50 rounded-full px-3 py-1">
                  <span className="text-white text-[11px] font-bold tracking-wider uppercase">{slides[slide].tag}</span>
                </div>
                <h2 className="text-white text-3xl font-extrabold leading-tight">
                  {slides[slide].title.split("\n").map((line, i) => (
                    <span key={i} className="block">{line}</span>
                  ))}
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed max-w-[340px]">
                  {slides[slide].sub}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Indicator Dots */}
          <div className="relative flex justify-center gap-1.5 pt-4 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === slide ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>

          {/* PENICILLIN INTERACTIVE VALUE REALIZATION CARD */}
          <div className="relative px-6 pt-5 pb-2 z-10">
            <motion.div
              layout
              className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-5 shadow-2xl relative overflow-hidden"
            >
              {/* Card Title Selector */}
              <div className="flex bg-black/45 rounded-full p-1 border border-white/10 mb-4">
                <button
                  onClick={() => setShowPainWay(false)}
                  className={`flex-1 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                    !showPainWay
                      ? "bg-[#7B2FBE] text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-[#FFE135] fill-current" />
                  <span>The Nyumba Sasa Way</span>
                </button>
                <button
                  onClick={() => setShowPainWay(true)}
                  className={`flex-1 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                    showPainWay
                      ? "bg-red-600/90 text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <X className="h-3.5 w-3.5 text-red-500" />
                  <span>The Broken Old Way</span>
                </button>
              </div>

              {/* Dynamic Before/After text based on persona */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={showPainWay ? "pain" : "gain"}
                  initial={{ opacity: 0, x: showPainWay ? 15 : -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: showPainWay ? -15 : 15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  {showPainWay ? (
                    <div className="space-y-2">
                      <p className="text-red-400 font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5">
                        <XCircle className="text-red-500 h-4 w-4" /> The Wasted Friction
                      </p>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        {activeSeg.pain}
                      </p>
                      <div className="pt-2 flex flex-wrap gap-2">
                        {["Fake listings", "Wasted deposit scams", "No Wi-Fi transparency", "Water blackouts"].map(f => (
                          <span key={f} className="text-[10px] text-red-300 font-semibold bg-red-950/40 border border-red-900/40 px-2 py-0.5 rounded-full">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-green-400 font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5">
                        <CheckCircle2 className="text-green-400 h-4 w-4" /> Penicillin Solution
                      </p>
                      <p className="text-white text-sm leading-relaxed font-medium">
                        {activeSeg.gain}
                      </p>
                      <div className="pt-2 flex flex-wrap gap-2">
                        {["100% Audited", "Uptime scores", "1-Tap scheduling", "Direct WhatsApp"].map(f => (
                          <span key={f} className="text-[10px] text-[#FFE135] font-semibold bg-[#7B2FBE]/20 border border-[#7B2FBE]/40 px-2 py-0.5 rounded-full">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Bottom CTAs */}
          <div
            style={safeAreaBottom}
            className="relative px-6 pb-6 pt-4 space-y-3 z-10 bg-gradient-to-t from-black via-black/95 to-transparent"
          >
            <div className="flex gap-3">
              <Link href="/register" className="flex-1">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="w-full h-14 bg-[#7B2FBE] hover:bg-[#8e3ee6] text-white text-sm font-extrabold rounded-full flex items-center justify-center gap-2 shadow-xl border border-[#7B2FBE]"
                >
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>

              <Link href="/login" className="flex-1">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="w-full h-14 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-full border border-white/15"
                >
                  Sign In
                </motion.button>
              </Link>
            </div>

            <button
              onClick={handleSkipOrStart}
              className="w-full text-center py-2 text-xs font-bold text-gray-400 hover:text-white tracking-wide transition-colors flex items-center justify-center gap-1"
            >
              <span>EXPLORE FREE PLEDGE & RENTALS</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
