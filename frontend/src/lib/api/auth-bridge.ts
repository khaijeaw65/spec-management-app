import type { Session } from "next-auth";

/**
 * Registers NextAuth `update()` so the axios client can persist tokens after refresh.
 * Set from a client component inside `<SessionProvider>`.
 */
type SessionUpdater = (data?: Record<string, unknown>) => Promise<Session | null>;

let sessionUpdate: SessionUpdater | null = null;

export function registerSessionUpdate(fn: SessionUpdater | null): void {
  sessionUpdate = fn;
}

export async function persistRefreshedTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  if (!sessionUpdate) return;
  await sessionUpdate({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
}
