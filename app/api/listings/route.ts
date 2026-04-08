import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(`
      *,
      agent:users!listings_agent_id_fkey(id, name, phone, avatar_url)
    `)
    .eq("status", "approved");

  const q = searchParams.get("q");
  if (q) {
    query = query.or(`title.ilike.%${q}%,location.ilike.%${q}%,city.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const type = searchParams.get("type");
  if (type && type !== "all") {
    query = query.eq("listing_type", type);
  }

  const city = searchParams.get("city");
  if (city) {
    query = query.ilike("city", `%${city}%`);
  }

  const minPrice = searchParams.get("min_price");
  if (minPrice) {
    query = query.gte("price", Number(minPrice));
  }

  const maxPrice = searchParams.get("max_price");
  if (maxPrice) {
    query = query.lte("price", Number(maxPrice));
  }

  const bedrooms = searchParams.get("bedrooms");
  if (bedrooms) {
    query = query.gte("bedrooms", Number(bedrooms));
  }

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { data, total: count ?? 0, page, limit },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } }
  );
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  // Only agents and admins can create listings
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || !["agent", "admin"].includes(profile.role)) {
    return NextResponse.json({ data: null, error: "Only agents can create listings" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, price, listing_type, location, city, bedrooms, bathrooms, area_sqm, images, amenities } = body;

  if (!title || !description || !price || !listing_type || !location || !city || !bedrooms || !bathrooms) {
    return NextResponse.json({ data: null, error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({
      title,
      description,
      price: Number(price),
      listing_type,
      location,
      city,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      area_sqm: area_sqm ? Number(area_sqm) : null,
      images: images ?? [],
      amenities: amenities ?? [],
      agent_id: user.id,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null }, { status: 201 });
}
