import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, name, phone, role, avatar_url, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ data: null, error: "User not found" }, { status: 404 });
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
  if (!user || user.id !== id) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone, avatar_url } = body;

  const { data, error } = await supabase
    .from("users")
    .update({ name, phone, avatar_url })
    .eq("id", id)
    .select("id, name, phone, role, avatar_url")
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null });
}
