import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ChatClient from "./ChatClient";

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ listingId: string }>;
  searchParams: Promise<{ partner?: string }>;
}) {
  const { listingId } = await params;
  const { partner } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const partnerId = partner ?? "";

  if (!partnerId) notFound();

  // Fetch listing info
  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, images")
    .eq("id", listingId)
    .single();

  // Fetch partner profile
  const { data: partnerProfile } = await supabase
    .from("users")
    .select("id, name, phone, avatar_url")
    .eq("id", partnerId)
    .single();

  // Mark incoming messages as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("listing_id", listingId)
    .eq("sender_id", partnerId)
    .eq("receiver_id", user.id);

  // Fetch messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("listing_id", listingId)
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
    .order("created_at", { ascending: true });

  return (
    <ChatClient
      listing={listing}
      partner={partnerProfile}
      messages={messages ?? []}
      currentUserId={user.id}
    />
  );
}
