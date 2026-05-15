import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/lib/http";

let refreshPromise: Promise<boolean> | null = null;

async function silentRefresh(): Promise<boolean> {
  refreshPromise ??= fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function redirectToSignin() {
  if (typeof window !== "undefined") {
    window.location.href = `/signin?next=${encodeURIComponent(window.location.pathname)}`;
  }
}

let browserQueryClient: QueryClient | undefined;

function createQueryClient() {
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: async (error, query) => {
        if (!(error instanceof ApiError) || error.status !== 401) return;
        const ok = await silentRefresh();
        if (ok) {
          client.invalidateQueries({ queryKey: query.queryKey });
        } else {
          client.clear();
          redirectToSignin();
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: async (error) => {
        if (!(error instanceof ApiError) || error.status !== 401) return;
        const ok = await silentRefresh();
        if (!ok) {
          client.clear();
          redirectToSignin();
        }
        // Token is now refreshed; the user retries the action
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
  return client;
}

export function getQueryClient() {
  if (typeof window === "undefined") {
    return createQueryClient();
  }

  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}
