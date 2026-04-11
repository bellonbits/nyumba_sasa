"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MessagesClient from "./MessagesClient";
import { apiFetch } from "@/lib/api";

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setCurrentUserId(user.id);
        const res = await apiFetch("/api/messages");
        const json = await res.json();
        const messages = json.data ?? [];

        // Deduplicate: one entry per listing conversation
        const seen = new Set<string>();
        const uniqueConversations = messages.filter((msg: any) => {
          const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          const key = `${msg.listing_id}-${otherId}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setConversations(uniqueConversations);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <MessagesClient conversations={conversations} currentUserId={currentUserId!} />;
}
