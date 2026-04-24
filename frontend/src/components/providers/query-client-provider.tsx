"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";

/** Align with axios: no RQ retries when the server returned a status (non-401 handled there). */
function defaultReactQueryRetry(failureCount: number, error: unknown) {
  if (isAxiosError(error) && error.response) {
    return false;
  }
  return failureCount < 1;
}

export function QueryClientProviderWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            // Axios retries only 401 (refresh + one replay). Do not re-run queries for
            // other HTTP errors. Allow one attempt for errors with no response (network).
            retry: defaultReactQueryRetry,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: defaultReactQueryRetry,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
