import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RequireAuthProvider } from "@/components/providers/require-auth-provider";

export default function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuthProvider>
  );
}
