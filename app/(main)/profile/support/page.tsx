"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MessageSquare, Mail, HelpCircle, Plus, Minus
} from "lucide-react";

const FAQS = [
  {
    q: "How do I list my property on Nyumba Sasa?",
    a: "Register as an Agent or Landlord, then go to your Agent Dashboard and tap \"New Listing\". Fill in the property details, upload photos, and submit for review. Listings go live once approved.",
  },
  {
    q: "How do I contact an agent about a listing?",
    a: "Open any listing and tap \"Contact\" to send a WhatsApp message, or \"Schedule a Tour\" to send an in-app message. You'll get a response in the Messages tab.",
  },
  {
    q: "Is Nyumba Sasa free to use?",
    a: "Browsing and contacting agents is completely free for home seekers. Agents may have listing limits based on their plan.",
  },
  {
    q: "How long does listing approval take?",
    a: "Listings are typically reviewed within 24 hours by our moderation team.",
  },
  {
    q: "How do I report a suspicious listing?",
    a: "On any listing page, tap the share/options button and select \"Report Listing\". Our team will investigate within 48 hours.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-50 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-gray-800 flex-1">{q}</span>
        <span className="text-gray-400 shrink-0">
          {open ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SupportPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F5F8]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="bg-white px-4 flex items-center gap-3 border-b border-gray-100" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: "16px" }}>
        <button onClick={() => router.back()} className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-bold text-gray-900">Help &amp; Support</h1>
      </div>

      <div className="px-4 pt-5 pb-10 space-y-4">
        {/* Contact cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-2 gap-3"
        >
          <a href="mailto:support@nyumbasasa.com">
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 active:bg-gray-50 transition-colors">
              <div className="h-11 w-11 rounded-2xl bg-purple-50 flex items-center justify-center">
                <Mail className="text-[#7B2FBE] h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Email Us</p>
              <p className="text-xs text-gray-400 text-center">support@nyumbasasa.com</p>
            </div>
          </a>
          <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer">
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 active:bg-gray-50 transition-colors">
              <div className="h-11 w-11 rounded-2xl bg-green-50 flex items-center justify-center">
                <MessageSquare className="text-green-500 h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-gray-800">WhatsApp</p>
              <p className="text-xs text-gray-400 text-center">Chat with support</p>
            </div>
          </a>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="bg-white rounded-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <HelpCircle className="text-[#7B2FBE] h-5 w-5" />
            <p className="text-sm font-bold text-gray-900">Frequently Asked Questions</p>
          </div>
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </motion.div>

        {/* App version */}
        <p className="text-center text-xs text-gray-400 pt-2">Nyumba Sasa v1.0.0</p>
      </div>
    </div>
  );
}
