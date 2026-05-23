"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide directly to us, such as your name, email address, phone number, and profile photo when you register. We also collect information about your use of the platform, including listings you view, save, or inquire about.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use the information we collect to provide, maintain, and improve our services, process transactions, send transactional messages, and match you with relevant property listings in your area.",
  },
  {
    title: "3. Sharing of Information",
    body: "We do not sell your personal information. We share information only with agents when you initiate contact about a listing, with service providers who assist in operating our platform, or when required by law.",
  },
  {
    title: "4. Data Storage & Security",
    body: "Your data is stored securely on servers provided by Supabase with 256-bit AES encryption at rest and TLS in transit. We employ industry-standard security measures to protect against unauthorised access.",
  },
  {
    title: "5. Cookies & Tracking",
    body: "We use cookies and similar tracking technologies to maintain your session and remember your preferences. You can disable cookies in your browser settings, though this may affect functionality.",
  },
  {
    title: "6. Your Rights",
    body: "You have the right to access, correct, or delete your personal data at any time. You may also request a copy of your data or withdraw consent for processing. Contact us at privacy@nyumbasasa.com to exercise these rights.",
  },
  {
    title: "7. Children's Privacy",
    body: "Nyumba Sasa is not directed at children under 16. We do not knowingly collect personal information from children. If you believe a child has provided us with their data, please contact us immediately.",
  },
  {
    title: "8. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the effective date below.",
  },
  {
    title: "9. Contact Us",
    body: "If you have questions about this Privacy Policy, please contact our Data Protection Officer at privacy@nyumbasasa.com or write to us at Nyumba Sasa Ltd., Nairobi, Kenya.",
  },
];

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F5F8]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="bg-white px-4 flex items-center gap-3 border-b border-gray-100" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: "16px" }}>
        <button onClick={() => router.back()} className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Privacy Policy</h1>
      </div>

      <div className="px-4 pt-5 pb-10">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-gradient-to-r from-[#7B2FBE] to-[#9B4FDE] rounded-2xl p-5 flex items-center gap-4 mb-4"
        >
          <Shield className="text-white h-8 w-8 shrink-0" />
          <div>
            <p className="text-white font-bold text-sm">Your privacy matters</p>
            <p className="text-white/70 text-xs mt-0.5">Effective date: 1 January 2025</p>
          </div>
        </motion.div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="bg-white rounded-2xl px-5 py-4 mb-4"
        >
          <p className="text-sm text-gray-500 leading-relaxed">
            Welcome to Nyumba Sasa. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform. By using our services, you agree to the practices described here.
          </p>
        </motion.div>

        {/* Sections */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white rounded-2xl px-5 py-4 space-y-5"
        >
          {SECTIONS.map(({ title, body }) => (
            <div key={title}>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
