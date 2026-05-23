"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { App } from "antd";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Home,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types";

const ROLES: { value: UserRole; icon: React.ReactNode; label: string; desc: string }[] = [
  { value: "user", icon: <Home className="h-5 w-5" />, label: "Home Seeker", desc: "Browse and find listings" },
  { value: "agent", icon: <Briefcase className="h-5 w-5" />, label: "Agent / Landlord", desc: "List & manage properties" },
];

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div className={[
      "h-2.5 rounded-full transition-all",
      done ? "w-2.5 bg-[#7B2FBE]" : active ? "w-7 bg-[#7B2FBE]" : "w-2.5 bg-gray-200",
    ].join(" ")} />
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<UserRole>("user");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password strength: 0-4
  const pwStrength = (() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9!@#$%^&*]/.test(password)) s++;
    return s;
  })();
  const pwStrengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  const pwStrengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-green-500"][pwStrength];

  const passwordsMatch = confirmPassword === "" || password === confirmPassword;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, role } },
    });
    if (authError) { setError(authError.message); setLoading(false); return; }
    
    // The user profile in public.users is automatically created by a 
    // database trigger. No manual insert needed here.
    
    message.success("Account created! Welcome to Nyumba Sasa");
    router.push("/home");
    router.refresh();

  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-6" style={{ paddingTop: "env(safe-area-inset-top, 16px)" }}>
      {/* Header */}
      <div className="pt-5 flex items-center justify-between mb-8">
        <button
          onClick={() => (step === 2 ? setStep(1) : router.push("/onboarding"))}
          className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1.5">
          <StepDot active={step === 1} done={step > 1} />
          <StepDot active={step === 2} done={false} />
        </div>
      </div>

      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
          {step === 1 ? "Create account" : "Almost there!"}
        </h1>
        <p className="text-gray-400 text-sm">
          {step === 1 ? "Tell us about yourself" : "Set up your login details"}
        </p>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 text-red-600 text-sm rounded-2xl px-4 py-3 font-medium">{error}</div>
      )}

      {step === 1 ? (
        <div>
          {/* Role picker */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={[
                  "relative rounded-2xl p-4 text-left border-2 transition-all",
                  role === r.value ? "border-[#7B2FBE] bg-purple-50" : "border-gray-100 bg-gray-50",
                ].join(" ")}
              >
                {role === r.value && (
                  <CheckCircle2 className="absolute top-3 right-3 text-[#7B2FBE] h-4 w-4" />
                )}
                <div className={role === r.value ? "text-[#7B2FBE]" : "text-gray-400"}>{r.icon}</div>
                <p className={`font-bold text-sm mt-2 ${role === r.value ? "text-[#7B2FBE]" : "text-gray-700"}`}>{r.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full name</label>
              <div className="flex items-center gap-3 bg-[#F0EEF8] rounded-2xl px-4 h-14">
                <User className="text-gray-400 h-5 w-5 shrink-0" />
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amina Osei"
                  className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Phone number</label>
              <div className="flex items-center gap-3 bg-[#F0EEF8] rounded-2xl px-4 h-14">
                <Phone className="text-gray-400 h-5 w-5 shrink-0" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 712 345 678" type="tel"
                  className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400" />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!name || !phone) { setError("Please fill in all fields"); return; }
              setError(""); setStep(2);
            }}
            className="w-full h-14 bg-[#7B2FBE] text-white text-base font-bold rounded-full mt-8 active:scale-98 transition-transform shadow-md"
          >
            Continue
          </button>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email address</label>
            <div className="flex items-center gap-3 bg-[#F0EEF8] rounded-2xl px-4 h-14">
              <Mail className="text-gray-400 h-5 w-5 shrink-0" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Password</label>
            <div className={`flex items-center gap-3 bg-[#F0EEF8] rounded-2xl px-4 h-14 transition-colors`}>
              <Lock className="text-gray-400 h-5 w-5 shrink-0" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
              <button type="button" onClick={() => setShowPw(p => !p)} className="text-gray-400 shrink-0 hover:text-gray-600 transition-colors">
                {showPw ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
            {/* Password strength bar */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= pwStrength ? pwStrengthColor : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${
                  pwStrength <= 1 ? "text-red-400" :
                  pwStrength === 2 ? "text-amber-500" :
                  pwStrength === 3 ? "text-blue-500" : "text-green-500"
                }`}>{pwStrengthLabel}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Confirm password</label>
            <div className={`flex items-center gap-3 rounded-2xl px-4 h-14 transition-colors ${
              !passwordsMatch ? "bg-red-50 border border-red-200" : "bg-[#F0EEF8]"
            }`}>
              <Lock className={`h-5 w-5 shrink-0 ${ !passwordsMatch ? "text-red-400" : "text-gray-400"}`} />
              <input
                type={showConfirmPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
              <button type="button" onClick={() => setShowConfirmPw(p => !p)} className="text-gray-400 shrink-0 hover:text-gray-600 transition-colors">
                {showConfirmPw ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
            {!passwordsMatch && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <span>✗</span> Passwords do not match
              </p>
            )}
            {passwordsMatch && confirmPassword.length > 0 && (
              <p className="text-xs text-green-500 mt-1.5 flex items-center gap-1">
                <span>✓</span> Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#7B2FBE] text-white text-base font-bold rounded-full disabled:opacity-60 active:scale-98 transition-transform shadow-md mt-4"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-center text-xs text-gray-400">
            By creating an account you agree to our{" "}
            <span className="text-[#7B2FBE] font-medium">Terms</span> &amp;{" "}
            <span className="text-[#7B2FBE] font-medium">Privacy Policy</span>.
          </p>
        </form>
      )}

      <p className="text-center text-gray-400 text-sm mt-8">
        Already have an account?{" "}
        <Link href="/login" className="text-[#7B2FBE] font-bold">Sign In</Link>
      </p>
    </div>
  );
}
