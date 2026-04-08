import BottomNav from "@/components/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gray-50">
      <main className="safe-bottom">{children}</main>
      <BottomNav />
    </div>
  );
}
