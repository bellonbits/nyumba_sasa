"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Switch, Select } from "antd";
import {
  ArrowLeftOutlined, GlobalOutlined, DollarOutlined,
  BgColorsOutlined, EyeOutlined, CompassOutlined, RightOutlined,
} from "@ant-design/icons";

const CURRENCIES = [
  { value: "KES", label: "KES — Kenyan Shilling" },
  { value: "NGN", label: "NGN — Nigerian Naira" },
  { value: "GHS", label: "GHS — Ghanaian Cedi" },
  { value: "TZS", label: "TZS — Tanzanian Shilling" },
  { value: "UGX", label: "UGX — Ugandan Shilling" },
  { value: "ZAR", label: "ZAR — South African Rand" },
  { value: "USD", label: "USD — US Dollar" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "sw", label: "Swahili" },
  { value: "fr", label: "French" },
  { value: "yo", label: "Yoruba" },
  { value: "ha", label: "Hausa" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState("KES");
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(false);
  const [dataMode, setDataMode] = useState(false);
  const [location, setLocation] = useState(true);

  const item = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay },
  });

  return (
    <div className="min-h-screen bg-[#F5F5F8]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="bg-white px-4 flex items-center gap-3 border-b border-gray-100" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: "16px" }}>
        <button onClick={() => router.back()} className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
          <ArrowLeftOutlined />
        </button>
        <h1 className="text-base font-bold text-gray-900">Settings</h1>
      </div>

      <div className="px-4 pt-5 pb-10 space-y-4">

        {/* Locale */}
        <motion.div {...item(0)} className="bg-white rounded-2xl overflow-hidden">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-4 pb-2">Locale</p>

          <div className="px-4 pb-3 border-b border-gray-50">
            <label className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <GlobalOutlined className="text-blue-500" />
              </div>
              <span className="text-sm font-medium text-gray-800">Language</span>
            </label>
            <Select
              value={language}
              onChange={setLanguage}
              options={LANGUAGES}
              size="large"
              className="w-full"
            />
          </div>

          <div className="px-4 py-3">
            <label className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <DollarOutlined className="text-green-500" />
              </div>
              <span className="text-sm font-medium text-gray-800">Currency</span>
            </label>
            <Select
              value={currency}
              onChange={setCurrency}
              options={CURRENCIES}
              size="large"
              className="w-full"
              showSearch
            />
          </div>
        </motion.div>

        {/* Display */}
        <motion.div {...item(0.07)} className="bg-white rounded-2xl overflow-hidden">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-4 pb-2">Display</p>

          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-50">
            <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <BgColorsOutlined className="text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Dark Mode</p>
              <p className="text-xs text-gray-400">Switch to dark theme</p>
            </div>
            <Switch
              checked={darkMode}
              onChange={setDarkMode}
              style={{ background: darkMode ? "#7B2FBE" : undefined }}
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-4">
            <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <EyeOutlined className="text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Data Saver</p>
              <p className="text-xs text-gray-400">Load lower-res images to save data</p>
            </div>
            <Switch
              checked={dataMode}
              onChange={setDataMode}
              style={{ background: dataMode ? "#7B2FBE" : undefined }}
            />
          </div>
        </motion.div>

        {/* Permissions */}
        <motion.div {...item(0.14)} className="bg-white rounded-2xl overflow-hidden">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-4 pb-2">Permissions</p>

          <div className="flex items-center gap-3 px-4 py-4">
            <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <CompassOutlined className="text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Location Access</p>
              <p className="text-xs text-gray-400">Show listings near you</p>
            </div>
            <Switch
              checked={location}
              onChange={setLocation}
              style={{ background: location ? "#7B2FBE" : undefined }}
            />
          </div>
        </motion.div>

        {/* Cache */}
        <motion.div {...item(0.2)} className="bg-white rounded-2xl overflow-hidden">
          <button
            onClick={() => { localStorage.clear(); alert("Cache cleared"); }}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <RightOutlined className="text-red-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-800">Clear Cache</p>
              <p className="text-xs text-gray-400">Free up local storage</p>
            </div>
            <RightOutlined className="text-gray-300 text-xs" />
          </button>
        </motion.div>

      </div>
    </div>
  );
}
