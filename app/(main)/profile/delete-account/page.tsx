"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { App } from "antd";
import {
  ArrowLeft,
  AlertTriangle,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const CONSEQUENCES = [
  "All your saved favourites will be permanently deleted",
  "Your message history will be erased",
  "Any active listings you posted will be removed",
  "Your profile and personal data will be wiped",
  "This action cannot be undone",
];

const REASONS = [
  "Found a home — no longer need the app",
  "Too many notifications",
  "Privacy concerns",
  "Switching to another platform",
  "Other",
];

export default function DeleteAccountPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (confirm.trim().toLowerCase() !== "delete") {
      message.error("Please type DELETE to confirm");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("users").delete().eq("id", user.id);
        await supabase.auth.signOut();
      }
      setStep(3);
      setTimeout(() => router.push("/onboarding"), 2500);
    } catch {
      message.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F8]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="bg-white px-4 flex items-center gap-3 border-b border-gray-100" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: "16px" }}>
        {step < 3 && (
          <button onClick={() => (step === 2 ? setStep(1) : router.back())} className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-base font-bold text-gray-900">Delete Account</h1>
      </div>

      <AnimatePresence mode="wait">

        {/* Step 1 — consequences */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="px-4 pt-6 pb-10"
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-3 animate-pulse">
                <AlertTriangle className="text-red-500 h-8 w-8" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Before you go…</h2>
              <p className="text-sm text-gray-400 mt-1">Deleting your account is permanent and cannot be undone.</p>
            </div>

            <div className="bg-white rounded-2xl p-4 mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">What you will lose</p>
              <div className="space-y-3">
                {CONSEQUENCES.map((c) => (
                  <div key={c} className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Trash2 className="text-red-400 h-3 w-3" />
                    </div>
                    <p className="text-sm text-gray-600">{c}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full h-13 bg-red-500 text-white font-bold rounded-full py-3.5 text-sm active:scale-95 transition-transform"
            >
              I understand — continue
            </button>
            <button
              onClick={() => router.back()}
              className="w-full mt-3 h-13 bg-white text-gray-600 font-semibold rounded-full py-3.5 text-sm border border-gray-200"
            >
              Keep my account
            </button>
          </motion.div>
        )}

        {/* Step 2 — reason + confirm */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="px-4 pt-6 pb-10 space-y-4"
          >
            {/* Reason */}
            <div className="bg-white rounded-2xl p-4">
              <p className="text-sm font-bold text-gray-900 mb-3">Why are you leaving?</p>
              <div className="space-y-2">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`w-full text-left px-3 py-3 rounded-xl text-sm font-medium transition-colors ${reason === r ? "bg-red-50 text-red-500 border border-red-200" : "bg-gray-50 text-gray-700"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm text */}
            <div className="bg-white rounded-2xl p-4">
              <p className="text-sm font-bold text-gray-900 mb-1">Confirm deletion</p>
              <p className="text-xs text-gray-400 mb-3">
                Type <span className="font-bold text-red-400">DELETE</span> in the box below to confirm.
              </p>
              <div className="bg-red-50 rounded-xl px-4 h-12 flex items-center border border-red-100">
                <input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Type DELETE"
                  className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-red-300 font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleDelete}
              disabled={loading || !reason}
              className="w-full h-13 bg-red-500 text-white font-bold rounded-full py-3.5 text-sm disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? "Deleting…" : "Permanently Delete Account"}
            </button>
          </motion.div>
        )}

        {/* Step 3 — success */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="text-green-500 h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Account deleted</h2>
            <p className="text-sm text-gray-400">Your data has been permanently removed. We hope to see you again someday.</p>
            <p className="text-xs text-gray-300 mt-4">Redirecting…</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
