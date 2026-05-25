"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar } from "antd";
import { ArrowLeft, Send, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDate, getInitials, getWhatsAppLink } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

interface ChatClientProps {
  listing: any;
  partner: any;
  messages: any[];
  currentUserId: string;
}

export default function ChatClient({ listing, partner, messages: initial, currentUserId }: ChatClientProps) {
  const [messages, setMessages] = useState(initial);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversations list for desktop sidebar
  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await apiFetch("/api/messages");
        const json = await res.json();
        setConversations(json.data ?? []);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    }
    loadConversations();
  }, []);

  // Real-time chat subscriptions
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat-${listing?.id}-${partner?.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `listing_id=eq.${listing?.id}` },
        (payload: any) => {
          const msg = payload.new;
          if (
            (msg.sender_id === partner?.id && msg.receiver_id === currentUserId) ||
            (msg.sender_id === currentUserId && msg.receiver_id === partner?.id)
          ) {
            setMessages((prev: any[]) => [...prev, msg]);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [listing?.id, partner?.id, currentUserId]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const supabase = createClient();
    const { data: msg } = await supabase
      .from("messages")
      .insert({ sender_id: currentUserId, receiver_id: partner?.id, listing_id: listing?.id, text: text.trim(), is_read: false })
      .select().single();
    if (msg) setMessages((prev: any[]) => [...prev, msg]);
    setText("");
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#F5F5F8]">
      <div className="flex-1 flex max-w-6xl mx-auto w-full bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden relative">
        
        {/* LEFT COLUMN: Conversation List (Desktop Only) */}
        <div className="hidden md:flex flex-col w-80 shrink-0 border-r border-gray-100 bg-white h-full overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-extrabold text-gray-900 text-sm">Conversations</h2>
            <p className="text-gray-400 text-[10px] mt-0.5 font-bold uppercase tracking-wider">{conversations.length} Active chats</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {conversations.map((conv) => {
              const other = conv.sender_id === currentUserId ? conv.receiver : conv.sender;
              const isUnread = !conv.is_read && conv.receiver_id === currentUserId;
              const listingImage = conv.listing?.images?.[0];
              const isCurrent = conv.listing_id === listing?.id && other?.id === partner?.id;

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.listing_id}?partner=${other?.id}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors",
                    isCurrent ? "bg-purple-50/50 border-r-2 border-[#7B2FBE]" : ""
                  )}
                >
                  <div className="relative h-11 w-11 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                    {listingImage && <Image src={listingImage} alt="" fill className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-bold truncate leading-none mb-1", isUnread ? "text-gray-950 font-black" : "text-gray-700")}>
                      {other?.name ?? "Unknown"}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate leading-none">{conv.listing?.title ?? ""}</p>
                  </div>
                  {isUnread && <span className="h-2 w-2 rounded-full bg-[#FF6A00]" />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat (Mobile: full-width) */}
        <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
          
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-3 shrink-0">
            <Link href="/messages" className="text-gray-600 p-1 -ml-1 md:hidden"><ArrowLeft size={20} /></Link>
            <Avatar src={partner?.avatar_url} size={38} style={{ background: "#FF6A00", flexShrink: 0 }}>
              {getInitials(partner?.name ?? "A")}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-gray-900 text-sm leading-tight">{partner?.name}</p>
              {listing?.title && <p className="text-[11px] text-gray-400 truncate">{listing.title}</p>}
            </div>
            {partner?.phone && (
              <a href={getWhatsAppLink(partner.phone)} target="_blank" rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:scale-105 transition-transform">
                <Phone size={16} />
              </a>
            )}
          </div>

          {/* Listing snippet card */}
          {listing && (
            <Link href={`/listings/${listing.id}`}
              className="mx-4 mt-3 flex items-center gap-3 bg-gray-50/60 hover:bg-gray-100 transition-colors rounded-2xl p-3 border border-gray-100/50 shrink-0">
              {listing.images?.[0] && (
                <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0">
                  <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{listing.title}</p>
                <p className="text-[10px] text-[#FF6A00] font-bold">View listing detail →</p>
              </div>
            </Link>
          )}

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#F9FAFB]/50">
            {messages.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-8 font-semibold">Say hello to start the conversation!</p>
            )}
            {messages.map((msg: any) => {
              const isMe = msg.sender_id === currentUserId;
              return (
                <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[75%] px-4 py-2.5 rounded-2xl text-xs",
                    isMe ? "bg-[#7B2FBE] text-white rounded-br-sm shadow-2xs" : "bg-white text-gray-800 shadow-2xs rounded-bl-sm border border-gray-100"
                  )}>
                    <p className="leading-relaxed font-medium">{msg.text}</p>
                    <p className={cn("text-[9px] mt-1 font-bold", isMe ? "text-white/60 text-right" : "text-gray-400")}>
                      {formatDate(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={sendMessage} className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 h-11 rounded-full bg-gray-50 border border-gray-100 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-[#7B2FBE]/60 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="h-11 w-11 rounded-full bg-[#7B2FBE] text-white flex items-center justify-center disabled:opacity-40 active:scale-90 transition-transform shadow-sm"
            >
              <Send size={16} />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
