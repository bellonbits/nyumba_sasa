"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { App } from "antd";
import { ArrowLeftOutlined, MailOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined, SmileOutlined, MobileOutlined } from "@ant-design/icons";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }
    message.success("Welcome back!");
    router.push("/home");
    router.refresh();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white flex flex-col px-6"
      style={{ paddingTop: "env(safe-area-inset-top, 16px)" }}
    >
      <div className="pt-5 mb-8">
        <Link href="/onboarding">
          <button className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            <ArrowLeftOutlined />
          </button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">Welcome back <SmileOutlined className="text-yellow-400" /></h1>
        <p className="text-gray-400 text-sm">Sign in to your Nyumba Sasa account</p>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 text-red-600 text-sm rounded-2xl px-4 py-3 font-medium">{error}</div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email address</label>
          <div className="flex items-center gap-3 bg-[#F0EEF8] rounded-2xl px-4 h-14">
            <MailOutlined className="text-gray-400 text-base shrink-0" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Password</label>
          <div className="flex items-center gap-3 bg-[#F0EEF8] rounded-2xl px-4 h-14">
            <LockOutlined className="text-gray-400 text-base shrink-0" />
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
            <button type="button" onClick={() => setShowPw(p => !p)} className="text-gray-400 shrink-0">
              {showPw ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-[#7B2FBE] font-semibold">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-[#7B2FBE] text-white text-base font-bold rounded-full disabled:opacity-60 active:scale-98 transition-transform shadow-md mt-2"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <button className="w-full h-14 bg-[#F0EEF8] text-[#7B2FBE] text-sm font-bold rounded-full flex items-center justify-center gap-2">
        <MobileOutlined className="text-base" /> Continue with Phone Number
      </button>

      <p className="text-center text-gray-400 text-sm mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#7B2FBE] font-bold">Sign Up</Link>
      </p>
    </motion.div>
  );
}
