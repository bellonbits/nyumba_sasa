import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get all conversations: latest message per listing+counterparty
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      sender:users!messages_sender_id_fkey(id, name, avatar_url),
      receiver:users!messages_receiver_id_fkey(id, name, avatar_url),
      listing:listings(id, title, images)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // Deduplicate: one entry per listing conversation
  const seen = new Set<string>();
  const conversations = (messages ?? []).filter((msg) => {
    const key = `${msg.listing_id}-${
      msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
    }`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return <MessagesClient conversations={conversations} currentUserId={user.id} />;
}
