import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nyumbasasa.com";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://api.guri24.com:8000";

  // Base static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/home`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/onboarding`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Try to fetch active approved listings from FastAPI backend for dynamic listing paths
  try {
    const res = await fetch(`${apiUrl}/api/listings`, {
      next: { revalidate: 3600 }, // Cache dynamic paths list for up to 1 hour
    });
    
    if (res.ok) {
      const json = await res.json();
      const listings = json.data || [];
      
      if (Array.isArray(listings)) {
        listings.forEach((listing: any) => {
          routes.push({
            url: `${baseUrl}/listings/${listing.id}`,
            lastModified: listing.updated_at ? new Date(listing.updated_at) : new Date(listing.created_at || Date.now()),
            changeFrequency: "daily",
            priority: 0.8,
          });
        });
      }
    }
  } catch (err) {
    console.error("Failed to generate dynamic listing sitemaps inside build:", err);
  }

  return routes;
}
