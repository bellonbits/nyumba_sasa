"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Fingerprint,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Upload,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

async function getMyUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

type Step = "menu" | "email" | "identity" | "success";

function StepCard({ icon, title, desc, achieved, onClick }: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  achieved: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={achieved}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
        achieved
          ? "bg-green-50 border-green-200 cursor-default"
          : "bg-white border-gray-100 hover:border-[#7B2FBE]/30 hover:shadow-sm active:scale-[0.98]"
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
        achieved ? "bg-green-100" : "bg-gray-50"
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${achieved ? "text-green-700" : "text-gray-900"}`}>{title}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
      </div>
      {achieved ? (
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
      ) : (
        <div className="h-5 w-5 rounded-full border-2 border-gray-200 shrink-0" />
      )}
    </button>
  );
}

export default function VerifyPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("menu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);

  // Email OTP verification
  const [emailOtp, setEmailOtp] = useState("");

  // Identity verification
  const [idType, setIdType] = useState<"national_id" | "passport">("national_id");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  async function handleSendEmailOtp() {
    setLoading(true);
    setError(null);
    try {
      const userId = await getMyUserId();
      if (!userId) throw new Error("Not logged in");
      const res = await apiFetch(`/api/users/${userId}/verify-email`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      // Simulated OTP - pre-fill for demo
      setEmailOtp("123456");
    } catch {
      setError("Could not send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyEmailOtp() {
    if (!emailOtp) return;
    setLoading(true);
    setError(null);
    try {
      const userId = await getMyUserId();
      if (!userId) throw new Error("Not logged in");
      // For demo: any 6-digit code works since backend just marks verified
      const res = await apiFetch(`/api/users/${userId}/verify-email`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Invalid OTP");
      setEmailVerified(true);
      setStep("success");
    } catch {
      setError("Could not verify. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleIdentitySubmit() {
    if (!idFile) { setError("Please upload your ID document."); return; }
    setLoading(true);
    setError(null);
    try {
      const userId = await getMyUserId();
      if (!userId) throw new Error("Not logged in");

      // Upload ID document
      const formData = new FormData();
      formData.append("file", idFile);
      const uploadRes = await apiFetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      const docUrl = uploadData?.data?.url ?? "";

      const res = await apiFetch(`/api/users/${userId}/verify-identity`, {
        method: "POST",
        body: JSON.stringify({
          action: "submit_documents",
          id_document_type: idType,
          id_document_url: docUrl,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setIdentityVerified(true);
      setStep("success");
    } catch {
      setError("Failed to submit documents. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-5 flex items-center gap-3 shadow-sm">
        <button onClick={() => step === "menu" ? router.back() : setStep("menu")} className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <div>
          <h1 className="font-bold text-gray-900 text-base">Identity Verification</h1>
          <p className="text-xs text-gray-400">Build trust with other members</p>
        </div>
      </div>

      <div className="px-4 pt-5 pb-10 space-y-3">

        <AnimatePresence mode="wait">

          {/* Main Menu */}
          {step === "menu" && (
            <motion.div key="menu" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
              
              {/* Trust levels explanation */}
              <div className="bg-gradient-to-br from-[#7B2FBE]/5 to-blue-500/5 rounded-2xl p-4 border border-[#7B2FBE]/10">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-5 w-5 text-[#7B2FBE]" />
                  <p className="text-sm font-bold text-gray-900">Trust Level System</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Complete each level to unlock trust badges, listing priority access, and higher visibility on the platform.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Level 1 — Email</p>
                <StepCard
                  icon={<Mail className="h-5 w-5 text-blue-500" />}
                  title="Verify Email Address"
                  desc="Confirm your email to unlock basic trust features and magic link login."
                  achieved={emailVerified}
                  onClick={() => setStep("email")}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Level 2 — Identity (Landlords & Agents)</p>
                <StepCard
                  icon={<Fingerprint className="h-5 w-5 text-[#7B2FBE]" />}
                  title="Submit National ID or Passport"
                  desc="Required for listing properties. Protects tenants from fake landlords."
                  achieved={identityVerified}
                  onClick={() => setStep("identity")}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Level 4 — Reputation (Automatic)</p>
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <BadgeCheck className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">Platform Reputation</p>
                    <p className="text-xs text-gray-400 mt-0.5">Earned through positive tenant reviews, response rate, and successful rentals.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Email Verification Step */}
          {step === "email" && (
            <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm">Email Verification</h2>
                    <p className="text-xs text-gray-400">We'll send a 6-digit code to your email</p>
                  </div>
                </div>

                <button
                  onClick={handleSendEmailOtp}
                  disabled={loading}
                  className="w-full py-3 bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Send Verification Code
                </button>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <p className="text-xs font-semibold text-gray-600 mb-3">Enter the 6-digit code from your email:</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full text-center text-2xl font-bold tracking-[0.4em] border-2 border-gray-200 rounded-xl py-3 focus:border-blue-500 focus:outline-none"
                />
                {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
                <button
                  onClick={handleVerifyEmailOtp}
                  disabled={emailOtp.length < 6 || loading}
                  className={`mt-3 w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                    emailOtp.length >= 6 && !loading
                      ? "bg-gray-900 text-white hover:bg-black"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Verify Code
                </button>
              </div>
            </motion.div>
          )}

          {/* Identity Verification Step */}
          {step === "identity" && (
            <motion.div key="identity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Fingerprint className="h-6 w-6 text-[#7B2FBE]" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm">Identity Verification</h2>
                    <p className="text-xs text-gray-400">Upload your government ID for manual review</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Document Type</p>
                  <div className="flex gap-2">
                    {(["national_id", "passport"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setIdType(type)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          idType === type
                            ? "bg-[#7B2FBE] text-white border-[#7B2FBE]"
                            : "bg-gray-50 text-gray-600 border-gray-100"
                        }`}
                      >
                        {type === "national_id" ? "National ID" : "Passport"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Upload ID Document</p>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-6 cursor-pointer hover:border-[#7B2FBE] transition-colors">
                    <Upload className="h-6 w-6 text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">{idFile ? idFile.name : "Tap to upload photo of ID"}</p>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setIdFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Documents are reviewed by our team within 24–48 hours and are never shared publicly.
                  </p>
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                  onClick={handleIdentitySubmit}
                  disabled={!idFile || loading}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                    idFile && !loading ? "bg-gray-900 text-white hover:bg-black" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Submit for Review
                </button>
              </div>
            </motion.div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {emailVerified && !identityVerified ? "Email Verified!" : "Submitted for Review!"}
              </h2>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                {emailVerified && !identityVerified
                  ? "Your email is now verified. Your trust score has been updated."
                  : "Your documents are under review. We'll notify you within 24–48 hours."}
              </p>
              <Link href="/profile" className="mt-8 w-full">
                <button className="w-full py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold">
                  Back to Profile
                </button>
              </Link>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
