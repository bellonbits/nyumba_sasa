import BottomNav from "@/components/BottomNav";
import DesktopHeader from "@/components/DesktopHeader";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#F5F5F8] w-full">
      {/* Desktop sticky header — hidden on mobile */}
      <DesktopHeader />

      {/* Page content — on desktop adds top padding to clear the fixed header */}
      <main className="w-full md:pt-16">
        {children}
      </main>

      {/* Mobile bottom navigation — hidden on md+ */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
