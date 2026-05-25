"use client";

import { useState } from "react";
import Link from "next/link";
import { Form, Input, Button, Alert, Result } from "antd";
import { Mail, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(values: { email: string }) {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#F5F5F8] md:bg-gradient-to-br md:from-[#f3eefc] md:via-[#F5F5F8] md:to-[#edf3fc] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md bg-white shadow-2xl border border-gray-100 rounded-3xl p-10 flex flex-col items-center">
          <Result
            status="success"
            title="Check your email"
            subTitle="We sent a password reset link to your email address."
            extra={
              <Link href="/login">
                <Button type="primary" size="large" className="rounded-xl" style={{ background: "#FF6A00", borderColor: "#FF6A00" }}>
                  Back to Sign In
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F8] md:bg-gradient-to-br md:from-[#f3eefc] md:via-[#F5F5F8] md:to-[#edf3fc] flex flex-col items-center justify-center">
      <div className="w-full max-w-md flex flex-col px-6 pb-12 md:bg-white md:shadow-2xl md:shadow-purple-500/5 md:border md:border-gray-100/80 md:rounded-3xl md:p-10 md:pb-12 md:my-10" style={{ paddingTop: "env(safe-area-inset-top, 16px)" }}>
      <div className="pt-4 mb-8">
        <Link href="/login">
          <Button type="text" icon={<ArrowLeft size={18} />} className="px-0 text-gray-700 flex items-center gap-1.5" />
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h1>
        <p className="text-gray-500">Enter your email and we&apos;ll send you a reset link.</p>
      </div>

      {error && <Alert message={error} type="error" showIcon className="mb-4 rounded-xl" closable />}

      <Form layout="vertical" onFinish={handleSubmit} size="large" requiredMark={false}>
        <Form.Item label={<span className="font-medium text-gray-700">Email address</span>} name="email" rules={[{ required: true, type: "email" }]}>
          <Input prefix={<Mail size={18} className="text-gray-400" />} placeholder="you@example.com" className="rounded-xl" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading} className="h-12 rounded-xl font-semibold" style={{ background: "#FF6A00", borderColor: "#FF6A00" }}>
            Send Reset Link
          </Button>
        </Form.Item>
      </Form>
      </div>
    </div>
  );
}
