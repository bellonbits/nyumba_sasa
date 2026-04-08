import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`*, agent:users!listings_agent_id_fkey(id, name, phone, avatar_url)`)
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ data: null, error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json({ data, error: null });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  // Check ownership or admin
  const { data: listing } = await supabase.from("listings").select("agent_id").eq("id", id).single();
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (!listing) {
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  }

  const isOwner = listing.agent_id === user.id;
  const isAdmin = profile?.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  // Admins can update status; agents can update listing details
  const allowedFields = isAdmin
    ? ["title", "description", "price", "listing_type", "location", "city", "bedrooms", "bathrooms", "area_sqm", "images", "amenities", "status"]
    : ["title", "description", "price", "listing_type", "location", "city", "bedrooms", "bathrooms", "area_sqm", "images", "amenities"];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }

  const { data, error } = await supabase
    .from("listings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { data: listing } = await supabase.from("listings").select("agent_id").eq("id", id).single();
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (!listing) {
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  }

  if (listing.agent_id !== user.id && profile?.role !== "admin") {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id }, error: null });
}
