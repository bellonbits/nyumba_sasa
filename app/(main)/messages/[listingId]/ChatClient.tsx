"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input, Avatar, App } from "antd";
import { ArrowLeft, Send, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDate, getInitials, getWhatsAppLink } from "@/lib/utils";

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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
        <Link href="/messages" className="text-gray-600 p-1 -ml-1"><ArrowLeft size={20} /></Link>
        <Avatar src={partner?.avatar_url} size={38} style={{ background: "#FF6A00", flexShrink: 0 }}>
          {getInitials(partner?.name ?? "A")}
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">{partner?.name}</p>
          {listing?.title && <p className="text-xs text-gray-400 truncate">{listing.title}</p>}
        </div>
        {partner?.phone && (
          <a href={getWhatsAppLink(partner.phone)} target="_blank" rel="noopener noreferrer"
            className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <Phone size={18} />
          </a>
        )}
      </div>

      {/* Listing card */}
      {listing && (
        <Link href={`/listings/${listing.id}`}
          className="mx-4 mt-3 flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 shrink-0">
          {listing.images?.[0] && (
            <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0">
              <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
            <p className="text-xs text-[#FF6A00]">View listing →</p>
          </div>
        </Link>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">Say hello to start the conversation!</p>
        )}
        {messages.map((msg: any) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[78%] px-4 py-2.5 rounded-2xl text-sm",
                isMe ? "bg-[#FF6A00] text-white rounded-br-sm" : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
              )}>
                <p>{msg.text}</p>
                <p className={cn("text-[10px] mt-1", isMe ? "text-white/60 text-right" : "text-gray-400")}>
                  {formatDate(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 h-11 rounded-2xl bg-gray-100 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="h-11 w-11 rounded-full bg-[#FF6A00] text-white flex items-center justify-center disabled:opacity-40 active:scale-90 transition-transform"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
