"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, Input, Button, Avatar, App, Upload } from "antd";
import { ArrowLeft, User, Phone, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

import { apiFetch } from "@/lib/api";

export default function EditProfilePage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }: any) => {
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        form.setFieldsValue({ name: data.name, phone: data.phone });
      }
    });
  }, [form, router]);

  async function handleSave(values: { name: string; phone: string }) {
    setLoading(true);
    const res = await apiFetch(`/api/users/${profile.id}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    });
    if (res.ok) {
      message.success("Profile updated!");
      router.push("/profile");
    } else {
      message.error("Failed to update profile");
    }
    setLoading(false);
  }

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await apiFetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.data?.url) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await apiFetch(`/api/users/${user.id}`, {
          method: "PATCH",
          body: JSON.stringify({ avatar_url: json.data.url }),
        });
        setProfile((p: any) => ({ ...p, avatar_url: json.data.url }));
        message.success("Photo updated!");
      }
    }
    setUploading(false);
    return false; // prevent antd default upload
  }

  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-gray-100">
        <Link href="/profile">
          <Button type="text" icon={<ArrowLeft className="h-5 w-5 text-gray-700" />} className="px-0 text-gray-700 flex items-center justify-center hover:bg-gray-100 rounded-full h-9 w-9" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Edit Profile</h1>
      </div>

      {!profile ? (
        <div className="h-[60vh] flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Avatar */}
          <div className="flex justify-center pt-8 pb-6">
            <div className="relative">
              <Avatar src={profile.avatar_url} size={80} style={{ background: "#FF6A00", fontSize: 28 }}>
                {getInitials(profile.name ?? "U")}
              </Avatar>
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleAvatarUpload}
              >
                <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[#FF6A00] text-white flex items-center justify-center shadow-md">
                  {uploading ? <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                </button>
              </Upload>
            </div>
          </div>

          <div className="px-4">
            <Form form={form} layout="vertical" onFinish={handleSave} size="large" requiredMark={false}>
              <Form.Item label={<span className="font-medium text-gray-700">Full name</span>} name="name" rules={[{ required: true }]}>
                <Input prefix={<User className="text-gray-400 h-4 w-4 shrink-0" />} className="rounded-xl" />
              </Form.Item>
              <Form.Item label={<span className="font-medium text-gray-700">Phone number</span>} name="phone" rules={[{ required: true }]}>
                <Input prefix={<Phone className="text-gray-400 h-4 w-4 shrink-0" />} className="rounded-xl" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={loading} className="h-12 rounded-xl font-semibold" style={{ background: "#FF6A00", borderColor: "#FF6A00" }}>
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </div>
        </>
      )}
    </div>
  );
}
