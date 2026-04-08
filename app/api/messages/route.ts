import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const listingId = searchParams.get("listing_id");
  const partnerId = searchParams.get("partner_id");

  if (listingId && partnerId) {
    // Fetch single conversation
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("listing_id", listingId)
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, error: null });
  }

  // List all conversations for the user
  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:users!messages_sender_id_fkey(id, name, avatar_url),
      receiver:users!messages_receiver_id_fkey(id, name, avatar_url),
      listing:listings(id, title, images)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { receiver_id, listing_id, text } = body;

  if (!receiver_id || !listing_id || !text?.trim()) {
    return NextResponse.json({ data: null, error: "receiver_id, listing_id, and text are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id,
      listing_id,
      text: text.trim(),
      is_read: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null }, { status: 201 });
}
