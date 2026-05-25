import BottomNav from "@/components/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#F5F5F8] w-full flex flex-col items-center">
      <main className="safe-bottom w-full max-w-7xl">{children}</main>
      <BottomNav />
    </div>
  );
}
