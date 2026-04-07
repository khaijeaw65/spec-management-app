import { DashboardToastRegion } from "@/components/providers/dashboard-toast-region";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <DashboardToastRegion />
      <div className="min-h-screen bg-zinc-50">
        <Sidebar />
        <div className="pl-[240px]">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </>
  );
}
