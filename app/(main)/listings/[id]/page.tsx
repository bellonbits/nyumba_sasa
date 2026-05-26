import type { Metadata } from "next";
import ListingDetailPageClient from "./ListingDetailPageClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getListing(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://api.guri24.com:8000";
  try {
    const res = await fetch(`${baseUrl}/api/listings/${id}`, {
      next: { revalidate: 3600 }, // Cache dynamic data for 1 hour
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error(`Error fetching listing ${id} for SEO:`, err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const listing = await getListing(resolvedParams.id);
  
  if (!listing) {
    return {
      title: "Property Detail | Nyumba Sasa",
      description: "Africa's housing marketplace. Find houses for rent and sale near you.",
    };
  }

  const listingTypeName = listing.listing_type === "rent" ? "Rent" : "Sale";
  const title = `${listing.title} | ${listing.bedrooms} Bed for ${listingTypeName} in ${listing.location}, ${listing.city}`;
  const description = `${listing.description ? listing.description.slice(0, 150) : "Vetted and verified housing listings in Africa."}... Price: ${listing.price.toLocaleString()} KES. Find out structural audits and water/power uptime.`;
  const imageUrl = listing.images && listing.images.length > 0 ? listing.images[0] : "https://nyumbasasa.com/logo.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://nyumbasasa.com/listings/${resolvedParams.id}`,
      images: [
        {
          url: imageUrl,
          alt: listing.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://nyumbasasa.com/listings/${resolvedParams.id}`,
    },
  };
}

export async function generateStaticParams() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://api.guri24.com:8000";
  const paths = [{ id: "1" }]; // Always return a fallback ID to prevent Next.js build crash when DB is empty in static export
  try {
    const res = await fetch(`${baseUrl}/api/listings/`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        const dbPaths = json.data.map((l: any) => ({ id: String(l.id) }));
        return [...paths, ...dbPaths];
      }
    }
  } catch (err) {
    console.error("Failed to generate static params in build:", err);
  }
  return paths;
}


export default async function ListingDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const listing = await getListing(resolvedParams.id);

  let schemaJson = null;
  if (listing) {
    schemaJson = {
      "@context": "https://schema.org",
      "@type": "SingleFamilyResidence",
      "name": listing.title,
      "description": listing.description,
      "image": listing.images || [],
      "numberOfRooms": listing.bedrooms,
      "numberOfBathroomsTotal": listing.bathrooms,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": listing.city,
        "addressRegion": listing.location,
        "addressCountry": "KE"
      },
      "geo": listing.gps_lat && listing.gps_lng ? {
        "@type": "GeoCoordinates",
        "latitude": listing.gps_lat,
        "longitude": listing.gps_lng
      } : undefined,
      "offers": {
        "@type": "Offer",
        "price": listing.price,
        "priceCurrency": "KES",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": listing.price,
          "priceCurrency": "KES",
          "unitText": listing.listing_type === "rent" ? "MONTH" : "EACH"
        }
      }
    };
  }

  return (
    <>
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      )}
      <ListingDetailPageClient id={resolvedParams.id} />
    </>
  );
}

