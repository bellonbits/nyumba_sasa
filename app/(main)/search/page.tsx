import type { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Search Houses, Apartments & Vetted Properties",
  description: "Search and filter high-quality vetted real estate listings across Africa. Find houses for rent and sale with structural audits and verified ownership.",
  keywords: ["search properties", "vetted apartments", "houses for rent", "homes for sale", "real estate search", "nyumba sasa search"],
  alternates: {
    canonical: "https://nyumba-sasa.vercel.app/search",
  },
  openGraph: {
    title: "Search Vetted Houses & Properties | Nyumba Sasa",
    description: "Search and filter high-quality vetted real estate listings across Africa. Find houses for rent and sale with structural audits and verified ownership.",
    url: "https://nyumba-sasa.vercel.app/search",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search Vetted Houses & Properties | Nyumba Sasa",
    description: "Search and filter high-quality vetted real estate listings across Africa. Find houses for rent and sale with structural audits and verified ownership.",
  },
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5F8] flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
