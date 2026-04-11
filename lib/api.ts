/**
 * API utility for Nyumba Sasa
 * Supports both Next.js API routes and the new FastAPI backend.
 */
import { createClient } from "@/lib/supabase/client";

// Deployment URL for the FastAPI backend (once deployed to Back4App)
const FASTAPI_URL = "https://nyumbasasa-fastapi.b4a.app"; // Update with actual URL after deploy
const NEXT_API_URL = "https://nyumbasasa-ten.vercel.app";

// Switching to FastAPI as the primary backend provider
const API_BASE_URL = FASTAPI_URL;

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
