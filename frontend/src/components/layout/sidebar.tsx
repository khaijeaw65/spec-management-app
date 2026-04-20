"use client";

import {
  FileText,
  Layout,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { signOut, useSession } from "next-auth/react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/specifications", label: "Specifications", icon: FileText },
  { href: "/templates", label: "Templates", icon: Layout },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const { data: session } = useSession();

  const user = session?.user;

  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/login',
    });
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-zinc-800 bg-zinc-900 text-sm dark:bg-zinc-950">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 p-1.5">
          <Image
            alt=""
            className="size-6 object-contain"
            height={24}
            src="/app-icon.svg"
            width={24}
          />
        </div>
        <span className="font-semibold text-white">SpecBuilder</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
                active
                  ? "bg-zinc-800 font-medium text-white"
                  : "text-zinc-400 hover:bg-zinc-700 hover:text-white",
              )}
              href={href}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-2 border-t border-zinc-800 p-3">
        <button
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
          type="button"
          onClick={toggleTheme}
          suppressHydrationWarning
          aria-label={
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
          }
        >
          {theme === "dark" ? (
            <Sun className="size-4" aria-hidden />
          ) : (
            <Moon className="size-4" aria-hidden />
          )}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <div className="flex items-center gap-2 px-2 py-1 text-zinc-300">
          <div className="flex size-8 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-white">
            BA
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">{user?.name}</p>
            <p className="truncate text-[11px] text-zinc-500">{user?.email}</p>
          </div>
        </div>
        <button
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
          onClick={handleLogout}
          type="button"
        >
          <LogOut className="size-4" aria-hidden />
          Logout
        </button>
      </div>
    </aside>
  );
}
