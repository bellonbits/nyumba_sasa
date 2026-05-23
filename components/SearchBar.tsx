"use client";

import { useState } from "react";
import { Input } from "antd";
import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  defaultValue?: string;
  showFilter?: boolean;
  placeholder?: string;
}

export default function SearchBar({
  defaultValue = "",
  showFilter = true,
  placeholder = "Search city, location…",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function handleSearch(value: string) {
    if (value.trim()) router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={() => handleSearch(query)}
          placeholder={placeholder}
          prefix={<Search size={18} className="text-gray-400" />}
          size="large"
          className="rounded-xl"
          allowClear
        />
      </div>
      {showFilter && (
        <button
          onClick={() => router.push("/search")}
          className="h-11 w-11 rounded-xl bg-[#FF6A00] text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform shrink-0"
          aria-label="Filters"
        >
          <SlidersHorizontal size={18} />
        </button>
      )}
    </div>
  );
}
