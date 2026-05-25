"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Drawer, Select, Slider } from "antd";
import { ArrowLeft, Bell, SlidersHorizontal, Search } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import type { Listing, ListingFilters } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

import { apiFetch } from "@/lib/api";

const SORT_OPTS = ["Most Relevant", "Newest", "Price: Low to High", "Price: High to Low"];
const CITIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Lagos", "Accra", "Dar es Salaam", "Kampala", "Kigali"];

export default function SearchPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [query, setQuery] = useState(sp.get("q") ?? "");
  const [sort, setSort] = useState("Most Relevant");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<ListingFilters>({ type: "all" });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.type && filters.type !== "all") params.set("type", filters.type);
    if (filters.city) params.set("city", filters.city);
    if (priceRange[0] > 0) params.set("min_price", String(priceRange[0]));
    if (priceRange[1] < 500000) params.set("max_price", String(priceRange[1]));
    if (filters.bedrooms) params.set("bedrooms", String(filters.bedrooms));
    try {
      const res = await apiFetch(`/api/listings?${params}`);
      const json = await res.json();
      setListings(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [query, filters, priceRange]);

  useEffect(() => {
    const t = setTimeout(fetchListings, 350);
    return () => clearTimeout(t);
  }, [fetchListings]);

  return (
    <div className="min-h-screen bg-[#F5F5F8]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      {/* Header */}
      <div className="bg-[#F5F5F8] px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="h-9 w-9 rounded-full bg-white shadow-sm flex items-center justify-center">
            <ArrowLeft className="text-gray-600 h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Search Result</h1>
          <button className="h-9 w-9 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Bell className="text-gray-600 h-5 w-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2 bg-white rounded-full px-4 h-12 shadow-sm border border-gray-100 mb-4">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location, city…"
            className="flex-1 text-sm text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Results count */}
        <div className="mb-3">
          <h2 className="text-xl font-extrabold text-gray-900">
            {loading ? "Searching…" : `${listings.length} Properties Found`}
          </h2>
          <p className="text-gray-400 text-sm">Matching your search criteria</p>
        </div>

        {/* Sort chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {SORT_OPTS.map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={[
                "shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all",
                sort === s ? "bg-[#7B2FBE] text-white" : "bg-white text-gray-500 border border-gray-200",
              ].join(" ")}
            >
              {s}
            </button>
          ))}
          <button
            onClick={() => setDrawerOpen(true)}
            className="shrink-0 px-3 py-2 rounded-full bg-white border border-gray-200 flex items-center gap-1.5 text-gray-500"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="px-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 space-y-0">
        {loading
          ? [1, 2, 3].map((n) => <PropertyCardSkeleton key={n} />)
          : listings.map((l) => <PropertyCard key={l.id} listing={l} />)}
      </div>

      {/* Filter Drawer */}
      <Drawer
        title={<span className="font-bold text-gray-900">Set Your Search Criteria</span>}
        placement="bottom"
        height="85vh"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ header: { borderBottom: "1px solid #f0f0f0", paddingTop: 20 }, wrapper: { borderRadius: "24px 24px 0 0", overflow: "hidden" } }}
        extra={
          <button onClick={() => { setFilters({ type: "all" }); setPriceRange([0, 500000]); }} className="text-sm text-[#7B2FBE] font-semibold">
            Reset
          </button>
        }
        closeIcon={
          <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">✕</div>
        }
      >
        <div className="space-y-6 pb-6">
          {/* Location */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Location</p>
            <Select
              showSearch placeholder="Select a city"
              value={filters.city || undefined}
              onChange={(v) => setFilters(f => ({ ...f, city: v }))}
              onClear={() => setFilters(f => ({ ...f, city: "" }))}
              allowClear size="large" className="w-full"
              options={CITIES.map((c) => ({ value: c, label: c }))}
            />
          </div>

          {/* Type */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Listing Type</p>
            <div className="flex gap-3">
              {[{ v: "all", l: "All" }, { v: "rent", l: "For Rent" }, { v: "buy", l: "For Sale" }].map(({ v, l }) => (
                <button key={v} onClick={() => setFilters(f => ({ ...f, type: v as ListingFilters["type"] }))}
                  className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-colors ${filters.type === v ? "bg-[#7B2FBE] text-white" : "bg-gray-100 text-gray-600"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-700">Price Range</p>
              <span className="text-sm text-[#7B2FBE] font-semibold">{formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}</span>
            </div>
            <Slider range min={0} max={500000} step={5000} value={priceRange}
              onChange={(v) => setPriceRange(v as [number, number])}
              tooltip={{ formatter: (v) => formatPrice(v ?? 0) }}
              styles={{ track: { background: "#7B2FBE" }, handle: { borderColor: "#7B2FBE" } }}
            />
          </div>

          {/* Bedrooms */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Bedrooms</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setFilters(f => ({ ...f, bedrooms: f.bedrooms === n ? undefined : n }))}
                  className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-colors ${filters.bedrooms === n ? "bg-[#7B2FBE] text-white" : "bg-gray-100 text-gray-600"}`}>
                  {n === 5 ? "5+" : n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { fetchListings(); setDrawerOpen(false); }}
            className="w-full h-13 bg-[#7B2FBE] text-white rounded-full font-bold text-base py-3.5 active:scale-98 transition-transform"
          >
            Search Properties
          </button>
        </div>
      </Drawer>
    </div>
  );
}
