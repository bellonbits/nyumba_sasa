import type { Metadata, Viewport } from "next";
import "@ant-design/v5-patch-for-react-19";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import AntdProvider from "@/components/AntdProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nyumba Sasa — Find Your Home in Africa",
    template: "%s | Nyumba Sasa",
  },
  description: "Africa's leading vetted real estate marketplace. Find high-quality, verified houses for rent and sale with structural audits and neighborhood reliability scores.",
  keywords: ["real estate", "africa", "houses for rent", "homes for sale", "apartments", "nyumba sasa", "nairobi", "property", "vetted landlords"],
  manifest: "/manifest.json",
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  openGraph: {
    title: "Nyumba Sasa — Africa's Vetted Housing Marketplace",
    description: "Find high-quality, verified houses for rent and sale with structural audits and neighborhood reliability scores.",
    type: "website",
    url: "https://nyumbasasa.com",
    siteName: "Nyumba Sasa",
    images: [
      {
        url: "https://nyumbasasa.com/logo.png",
        width: 512,
        height: 512,
        alt: "Nyumba Sasa Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nyumba Sasa — Africa's Vetted Housing Marketplace",
    description: "Find high-quality, verified houses for rent and sale with structural audits and neighborhood reliability scores.",
    images: ["https://nyumbasasa.com/logo.png"],
  },
  alternates: {
    canonical: "https://nyumbasasa.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF6A00",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Nyumba Sasa",
    "url": "https://nyumbasasa.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://nyumbasasa.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nyumba Sasa",
    "url": "https://nyumbasasa.com",
    "logo": "https://nyumbasasa.com/logo.png",
    "sameAs": [
      "https://facebook.com/nyumbasasa",
      "https://twitter.com/nyumbasasa",
      "https://instagram.com/nyumbasasa"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nyumba Sasa" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>
        <AntdRegistry>
          <AntdProvider>
            <div className="min-h-screen bg-[#F5F5F8] text-gray-900 antialiased">
              {children}
            </div>
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

