"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

interface PageShellProps {
  title: string;
  /** Optional right-side action slot in the header */
  headerRight?: ReactNode;
  /** Page content */
  children: ReactNode;
  /** Max width class, defaults to max-w-2xl */
  maxWidth?: string;
  /** Whether to show the back button (default: true) */
  showBack?: boolean;
}

/**
 * Shared shell for secondary pages (profile sub-pages, settings, etc.)
 * Provides:
 *  - Sticky header with back button + title on mobile
 *  - Clean max-width centered container on desktop
 *  - Safe-area-aware padding on mobile
 *  - Mobile bottom-nav safe-bottom padding
 */
export default function PageShell({
  title,
  headerRight,
  children,
  maxWidth = "max-w-2xl",
  showBack = true,
}: PageShellProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F5F8]">
      {/* Sticky header — shown on mobile, hidden on desktop (DesktopHeader handles it) */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 flex items-center gap-3 h-14"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        {showBack && (
          <button
            onClick={() => router.back()}
            className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-base font-bold text-gray-900 flex-1 leading-none">{title}</h1>
        {headerRight}
      </div>

      {/* Page content — centered with max-width on desktop */}
      <div className={`${maxWidth} mx-auto w-full px-4 sm:px-6 pt-5 md:pt-8 safe-bottom`}>
        {/* Desktop page title */}
        <div className="hidden md:flex items-center gap-3 mb-6">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="h-9 w-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
          )}
          <h1 className="text-2xl font-extrabold text-gray-900 leading-none">{title}</h1>
          {headerRight && <div className="ml-auto">{headerRight}</div>}
        </div>

        {children}
      </div>
    </div>
  );
}
