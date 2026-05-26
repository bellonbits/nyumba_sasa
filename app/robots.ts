import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/home", "/search", "/listings/"],
      disallow: ["/api/", "/admin/", "/messages/", "/profile/", "/favorites/"],
    },
    sitemap: "https://nyumba-sasa.vercel.app/sitemap.xml",
  };
}
