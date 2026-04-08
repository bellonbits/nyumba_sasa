"use client";

import { useState, useEffect, useCallback } from "react";
import type { Listing, ListingFilters, PaginatedResponse } from "@/lib/types";

interface UseListingsState {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  total: number;
  fetchMore: () => void;
  hasMore: boolean;
  refresh: () => void;
}

export function useListings(filters: ListingFilters = {}): UseListingsState {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const limit = filters.limit ?? 20;
  const hasMore = listings.length < total;

  const fetchListings = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters.type && filters.type !== "all") params.set("type", filters.type);
    if (filters.city) params.set("city", filters.city);
    if (filters.min_price) params.set("min_price", String(filters.min_price));
    if (filters.max_price) params.set("max_price", String(filters.max_price));
    if (filters.bedrooms) params.set("bedrooms", String(filters.bedrooms));
    params.set("page", String(pageNum));
    params.set("limit", String(limit));

    try {
      const res = await fetch(`/api/listings?${params.toString()}`);
      const json: PaginatedResponse<Listing> & { error?: string } = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to load listings");
        return;
      }

      setListings((prev) => (append ? [...prev, ...json.data] : json.data));
      setTotal(json.total);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.city, filters.min_price, filters.max_price, filters.bedrooms, limit]);

  useEffect(() => {
    setPage(1);
    fetchListings(1, false);
  }, [fetchListings]);

  function fetchMore() {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchListings(next, true);
  }

  function refresh() {
    setPage(1);
    fetchListings(1, false);
  }

  return { listings, loading, error, total, fetchMore, hasMore, refresh };
}
