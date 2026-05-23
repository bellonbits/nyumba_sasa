"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, Input, Button, Upload, Select, InputNumber, App, Row, Col } from "antd";
import { ArrowLeft, Plus, Loader2, Home, Key } from "lucide-react";
import type { UploadFile } from "antd";

import { apiFetch } from "@/lib/api";

const AMENITIES = ["WiFi", "Parking", "Water", "Electricity", "Garden", "Security", "Pool", "Gym", "Furnished", "CCTV"];
const CITIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Lagos", "Accra", "Dar es Salaam", "Kampala"];

export default function NewListingPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  async function handleImageUpload(file: File) {
    setUploadingCount((c) => c + 1);
    const fd = new FormData();
    fd.append("file", file);
    const res = await apiFetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.data?.url) {
      setUploadedImages((prev) => [...prev, json.data.url]);
    } else {
      message.error("Image upload failed");
    }
    setUploadingCount((c) => c - 1);
    return false;
  }

  async function handleSubmit(values: any) {
    if (uploadedImages.length === 0) {
      message.warning("Please upload at least one photo");
      return;
    }
    setLoading(true);
    const res = await apiFetch("/api/listings", {
      method: "POST",
      body: JSON.stringify({ ...values, images: uploadedImages, amenities: selectedAmenities }),
    });
    const json = await res.json();
    if (!res.ok) {
      message.error(json.error ?? "Failed to create listing");
      setLoading(false);
      return;
    }
    message.success("Listing submitted for review!");
    router.push("/agent");
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <Link href="/agent"><Button type="text" icon={<ArrowLeft className="h-5 w-5 text-gray-700" />} className="px-0 text-gray-700 flex items-center" /></Link>
        <h1 className="text-lg font-bold text-gray-900">New Listing</h1>
      </div>

      <div className="px-4 py-5">
        <Form form={form} layout="vertical" onFinish={handleSubmit} size="large" requiredMark={false}>

          {/* Photos */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">Photos <span className="text-red-400">*</span></p>
            <div className="flex flex-wrap gap-2">
              {uploadedImages.map((url, i) => (
                <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setUploadedImages((p) => p.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center">×</button>
                </div>
              ))}
              <Upload accept="image/*" showUploadList={false} beforeUpload={handleImageUpload} multiple>
                <div className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6A00] transition-colors">
                  {uploadingCount > 0 ? <Loader2 className="h-5 w-5 text-[#FF6A00] animate-spin" /> : <Plus className="h-5 w-5 text-gray-400" />}
                  <span className="text-[10px] text-gray-400 mt-1">Add photo</span>
                </div>
              </Upload>
            </div>
          </div>

          {/* Type */}
          <Form.Item label={<span className="font-semibold text-gray-700">Listing Type</span>} name="listing_type" initialValue="rent" rules={[{ required: true }]}>
            <Select size="large" className="w-full" options={[
              { value: "rent", label: <span className="flex items-center gap-1.5"><Home className="h-4 w-4 text-gray-500" />For Rent</span> },
              { value: "buy", label: <span className="flex items-center gap-1.5"><Key className="h-4 w-4 text-gray-500" />For Sale</span> },
            ]} />
          </Form.Item>

          <Form.Item label={<span className="font-semibold text-gray-700">Property Title</span>} name="title" rules={[{ required: true, message: "Add a title" }]}>
            <Input placeholder="e.g. Spacious 2BR apartment in Westlands" className="rounded-xl" />
          </Form.Item>

          <Form.Item label={<span className="font-semibold text-gray-700">Description</span>} name="description" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Describe the property, neighbourhood, access..." className="rounded-xl" />
          </Form.Item>

          <Form.Item label={<span className="font-semibold text-gray-700">Price (KES)</span>} name="price" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full rounded-xl" placeholder="e.g. 35000" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label={<span className="font-semibold text-gray-700">Location / Area</span>} name="location" rules={[{ required: true }]}>
                <Input placeholder="e.g. Westlands" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span className="font-semibold text-gray-700">City</span>} name="city" rules={[{ required: true }]}>
                <Select showSearch placeholder="Select city" options={CITIES.map((c) => ({ value: c, label: c }))} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item label={<span className="font-semibold text-gray-700">Bedrooms</span>} name="bedrooms" rules={[{ required: true }]}>
                <InputNumber min={0} className="w-full rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<span className="font-semibold text-gray-700">Bathrooms</span>} name="bathrooms" rules={[{ required: true }]}>
                <InputNumber min={0} className="w-full rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<span className="font-semibold text-gray-700">Area m²</span>} name="area_sqm">
                <InputNumber min={0} className="w-full rounded-xl" />
              </Form.Item>
            </Col>
          </Row>

          {/* Amenities */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button key={a} type="button"
                  onClick={() => setSelectedAmenities((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a])}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedAmenities.includes(a) ? "bg-[#FF6A00] text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <Button type="primary" htmlType="submit" size="large" block loading={loading} className="h-12 rounded-2xl font-semibold" style={{ background: "#FF6A00", borderColor: "#FF6A00" }}>
            Submit for Review
          </Button>
          <p className="text-center text-xs text-gray-400 mt-3">Your listing will be reviewed before going live.</p>
        </Form>
      </div>
    </div>
  );
}
