import { DashboardToastRegion } from "@/components/providers/dashboard-toast-region";
import { Sidebar } from "@/components/layout/sidebar";
import { RequireAuthProvider } from "@/components/providers/require-auth-provider";

export default function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuthProvider>
      <DashboardToastRegion />
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Sidebar />
        <div className="pl-[240px]">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </RequireAuthProvider>
  );
}
