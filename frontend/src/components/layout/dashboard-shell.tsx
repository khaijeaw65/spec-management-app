"use client";

import { Menu } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";

const SIDEBAR_ID = "dashboard-sidebar";

export function DashboardShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
      <Sidebar
        mobileNavOpen={mobileNavOpen}
        onMobileNavClose={() => setMobileNavOpen(false)}
        sidebarId={SIDEBAR_ID}
      />
      <div className="lg:pl-[240px]">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 lg:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-expanded={mobileNavOpen}
            aria-controls={SIDEBAR_ID}
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <Menu className="size-6" aria-hidden />
          </button>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            SpecBuilder
          </span>
        </header>
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
