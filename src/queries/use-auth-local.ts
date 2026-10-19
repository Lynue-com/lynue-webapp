import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Auth operations proxied through this Next.js app's API routes to the
 * backend. Email delivery (verification, password reset) is owned by the
 * backend — these routes only forward requests, so the emailed token never
 * passes through an API response.
 */

export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { firstName: string; lastName: string; email: string; password: string }) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return res.json();
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (payload: { token: string }) => {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return res.json();
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return res.json();
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: { token: string; password: string }) => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return res.json();
    },
  });
}
