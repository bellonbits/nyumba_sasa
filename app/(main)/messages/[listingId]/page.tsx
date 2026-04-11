"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ChatClient from "./ChatClient";
import { apiFetch } from "@/lib/api";

interface PageProps {
  params: Promise<{ listingId: string }>;
  searchParams: Promise<{ partner?: string }>;
}

export default function ChatPage({ params, searchParams }: PageProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const { listingId } = use(params);
  const partnerId = sp.get("partner") ?? "";

  const [listing, setListing] = useState<any>(null);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChatData() {
      if (!partnerId) {
        router.push("/messages");
        return;
      }

      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setCurrentUserId(user.id);

        // 1. Fetch listing info
        const listingRes = await apiFetch(`/api/listings/${listingId}`);
        const listingJson = await listingRes.json();
        setListing(listingJson.data);

        // 2. Fetch partner profile
        const partnerRes = await apiFetch(`/api/users/${partnerId}`);
        const partnerJson = await partnerRes.json();
        setPartnerProfile(partnerJson.data);

        // 3. Mark incoming messages as read (FastAPI endpoint)
        // Find existing messages from partner that are unread
        const msgsRes = await apiFetch("/api/messages");
        const msgsJson = await msgsRes.json();
        const allMsgs = msgsJson.data ?? [];
        
        const relevant = allMsgs.filter((m: any) => 
          m.listing_id === listingId && 
          ((m.sender_id === user.id && m.receiver_id === partnerId) || 
           (m.sender_id === partnerId && m.receiver_id === user.id))
        ).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        // Mark unread as read
        const unread = relevant.filter((m: any) => !m.is_read && m.receiver_id === user.id);
        for (const m of unread) {
          await apiFetch(`/api/messages/${m.id}/read`, { method: "PATCH" });
        }

        setMessages(relevant);

      } catch (err) {
        console.error("Failed to load chat:", err);
      } finally {
        setLoading(false);
      }
    }

    loadChatData();
  }, [listingId, partnerId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ChatClient
      listing={listing}
      partner={partnerProfile}
      messages={messages}
      currentUserId={currentUserId!}
    />
  );
}
