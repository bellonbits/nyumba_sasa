import type { Metadata, Viewport } from "next";
import "@ant-design/v5-patch-for-react-19";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import AntdProvider from "@/components/AntdProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nyumba Sasa — Find Your Home in Africa",
  description: "Africa's housing marketplace. Find houses for rent and sale near you.",
  manifest: "/manifest.json",
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  openGraph: {
    title: "Nyumba Sasa — Find Your Home",
    description: "Africa's mobile-first housing marketplace",
    type: "website",
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
      </head>
      <body>
        <AntdRegistry>
          <AntdProvider>
            <div className="min-h-screen md:flex md:items-start md:justify-center md:bg-gray-100">
              <div className="w-full md:max-w-[430px] md:min-h-screen md:shadow-2xl bg-[#f5f5f5]">
                {children}
              </div>
            </div>
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
