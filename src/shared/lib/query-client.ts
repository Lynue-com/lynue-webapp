import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/lib/api-error";

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

const AUTH_PAGES = ["/signin", "/signup"];

function redirectToSignin() {
  if (typeof window === "undefined") return;
  const current = window.location.pathname;
  if (AUTH_PAGES.some((p) => current.startsWith(p))) return;
  window.location.href = `/signin?next=${encodeURIComponent(current)}`;
}

let browserQueryClient: QueryClient | undefined;

function createQueryClient() {
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: async (error, query) => {
        if (!(error instanceof ApiError) || error.status !== 401) return;
        // The auth/me query returning 401 simply means the user is not logged in.
        // This is expected on public pages — do not redirect.
        if (Array.isArray(query.queryKey) && query.queryKey[0] === "auth") return;
        // If auth/me has already failed with 401, the user is definitively not
        // logged in — no token to refresh, no redirect needed.
        // If auth/me hasn't settled yet (pending/undefined), also skip: the
        // middleware already guards protected routes server-side.
        const meState = client.getQueryState(["auth", "me"]);
        const userIsLoggedIn = meState?.status === "success" && !!meState.data;
        if (!userIsLoggedIn) return;
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
