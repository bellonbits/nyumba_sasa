"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, Input, Button, Upload, Select, InputNumber, App, Row, Col, Spin } from "antd";
import { ArrowLeftOutlined, PlusOutlined, LoadingOutlined, HomeOutlined, KeyOutlined } from "@ant-design/icons";
import type { Listing } from "@/lib/types";

import { apiFetch } from "@/lib/api";

const AMENITIES = ["WiFi", "Parking", "Water", "Electricity", "Garden", "Security", "Pool", "Gym", "Furnished", "CCTV"];
const CITIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Lagos", "Accra", "Dar es Salaam", "Kampala"];

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [listingId, setListingId] = useState<string>("");

  useEffect(() => {
    params.then(async ({ id }) => {
      setListingId(id);
      const res = await apiFetch(`/api/listings/${id}`);
      const json = await res.json();
      if (json.data) {
        const l: Listing = json.data;
        setListing(l);
        setUploadedImages(l.images ?? []);
        setSelectedAmenities(l.amenities ?? []);
        form.setFieldsValue({
          title: l.title,
          description: l.description,
          price: l.price,
          listing_type: l.listing_type,
          location: l.location,
          city: l.city,
          bedrooms: l.bedrooms,
          bathrooms: l.bathrooms,
          area_sqm: l.area_sqm,
        });
      }
    });
  }, [params, form]);

  async function handleImageUpload(file: File) {
    setUploadingCount((c) => c + 1);
    const fd = new FormData();
    fd.append("file", file);
    const res = await apiFetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.data?.url) setUploadedImages((prev) => [...prev, json.data.url]);
    else message.error("Upload failed");
    setUploadingCount((c) => c - 1);
    return false;
  }

  async function handleSubmit(values: any) {
    setLoading(true);
    const res = await apiFetch(`/api/listings/${listingId}`, {
      method: "PATCH",
      body: JSON.stringify({ ...values, images: uploadedImages, amenities: selectedAmenities }),
    });
    if (res.ok) {
      message.success("Listing updated!");
      router.push("/agent");
    } else {
      message.error("Failed to update listing");
    }
    setLoading(false);
  }

  if (!listing) return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>;

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <Link href="/agent"><Button type="text" icon={<ArrowLeftOutlined />} className="px-0 text-gray-700" /></Link>
        <h1 className="text-lg font-bold text-gray-900">Edit Listing</h1>
      </div>

      <div className="px-4 py-5">
        <Form form={form} layout="vertical" onFinish={handleSubmit} size="large" requiredMark={false}>
          {/* Photos */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">Photos</p>
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
                  {uploadingCount > 0 ? <LoadingOutlined className="text-[#FF6A00]" /> : <PlusOutlined className="text-gray-400" />}
                  <span className="text-[10px] text-gray-400 mt-1">Add photo</span>
                </div>
              </Upload>
            </div>
          </div>

          <Form.Item label={<span className="font-semibold text-gray-700">Listing Type</span>} name="listing_type" rules={[{ required: true }]}>
            <Select size="large" options={[
              { value: "rent", label: <span className="flex items-center gap-1.5"><HomeOutlined />For Rent</span> },
              { value: "buy", label: <span className="flex items-center gap-1.5"><KeyOutlined />For Sale</span> },
            ]} />
          </Form.Item>

          <Form.Item label={<span className="font-semibold text-gray-700">Title</span>} name="title" rules={[{ required: true }]}>
            <Input className="rounded-xl" />
          </Form.Item>

          <Form.Item label={<span className="font-semibold text-gray-700">Description</span>} name="description" rules={[{ required: true }]}>
            <Input.TextArea rows={4} className="rounded-xl" />
          </Form.Item>

          <Form.Item label={<span className="font-semibold text-gray-700">Price (KES)</span>} name="price" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full rounded-xl" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label={<span className="font-semibold text-gray-700">Location</span>} name="location" rules={[{ required: true }]}>
                <Input className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span className="font-semibold text-gray-700">City</span>} name="city" rules={[{ required: true }]}>
                <Select showSearch options={CITIES.map((c) => ({ value: c, label: c }))} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item label={<span className="font-semibold text-gray-700">Beds</span>} name="bedrooms" rules={[{ required: true }]}>
                <InputNumber min={0} className="w-full rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<span className="font-semibold text-gray-700">Baths</span>} name="bathrooms" rules={[{ required: true }]}>
                <InputNumber min={0} className="w-full rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<span className="font-semibold text-gray-700">Area m²</span>} name="area_sqm">
                <InputNumber min={0} className="w-full rounded-xl" />
              </Form.Item>
            </Col>
          </Row>

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
            Save Changes
          </Button>
        </Form>
      </div>
    </div>
  );
}
