"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ProfileClient from "./ProfileClient";
import { apiFetch } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [favCount, setFavCount] = useState(0);
  const [listingCount, setListingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setEmail(user.email ?? "");

        // 1. Fetch profile
        const profileRes = await apiFetch(`/api/users/${user.id}`);
        const profileJson = await profileRes.json();
        setProfile(profileJson.data);

        // 2. Fetch Favorites (to count)
        const favsRes = await apiFetch("/api/favorites");
        const favsJson = await favsRes.json();
        setFavCount((favsJson.data ?? []).length);

        // 3. Fetch My Listings (to count)
        const listingsRes = await apiFetch("/api/listings"); // Note: We might need a filter for agent_id if the general GET /listings doesn't return user-specific ones
        // Actually, our get_listings was filtering by status APPROVED by default. 
        // We might need a specific endpoint or filtered query for "my listings".
        // But for now, we'll fetch then filter or just use general if that's what we have.
        const listingsJson = await listingsRes.json();
        const myEntries = (listingsJson.data ?? []).filter((l: any) => l.agent_id === user.id);
        setListingCount(myEntries.length);

      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ProfileClient
      profile={profile}
      email={email}
      favCount={favCount}
      listingCount={listingCount}
    />
  );
}
