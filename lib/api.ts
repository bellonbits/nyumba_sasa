/**
 * API utility for Nyumba Sasa
 * Supports both Next.js API routes and the new FastAPI backend.
 */
import { createClient } from "@/lib/supabase/client";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";
const NEXT_API_URL = process.env.NEXT_PUBLIC_API_URL || FASTAPI_URL;

// Dynamic API routing based on environment configuration (e.g. Docker/Podman local ports)
const API_BASE_URL = NEXT_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  // Prefix path with base URL if it starts with /api
  const url = path.startsWith("/api") ? `${API_BASE_URL}${path}` : path;
  
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Get token from Supabase client for reliable auth flow
  if (typeof window !== "undefined") {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
