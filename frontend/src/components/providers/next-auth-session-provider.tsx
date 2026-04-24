"use client";

import { SessionProvider } from "next-auth/react";

import { AuthSessionBridge } from "@/components/providers/auth-session-bridge";

export function NextAuthSessionProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <AuthSessionBridge>{children}</AuthSessionBridge>
    </SessionProvider>
  );
}

