"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  forgotPassword,
  getMe,
  logout,
  resendVerification,
  resetPassword,
  signin,
  signup,
  verifyEmail,
} from "@/features/auth/api/auth-api";

export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
  });
}

export function useSignin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signin,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signup,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword });
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: verifyEmail });
}

export function useResendVerification() {
  return useMutation({ mutationFn: resendVerification });
}
