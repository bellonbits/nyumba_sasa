import BottomNav from "@/components/BottomNav";
import DesktopHeader from "@/components/DesktopHeader";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#F5F5F8] w-full flex flex-col items-center">
      <DesktopHeader />
      <main className="safe-bottom w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12 md:pt-20">
        {children}
      </main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

