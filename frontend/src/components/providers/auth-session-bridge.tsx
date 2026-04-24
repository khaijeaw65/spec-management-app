"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { registerSessionUpdate } from "@/lib/api/auth-bridge";

/**
 * Bridges NextAuth `session.update()` to the axios layer so refreshed tokens
 * persist in the JWT cookie after `POST /auth/refresh`.
 */
export function AuthSessionBridge({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { update } = useSession();

  useEffect(() => {
    registerSessionUpdate(update);
    return () => {
      registerSessionUpdate(null);
    };
  }, [update]);

  return <>{children}</>;
}
