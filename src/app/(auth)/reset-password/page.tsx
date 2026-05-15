"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/shared/ui/auth-shell";
import { useResetPassword } from "@/queries/use-auth";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const resetMutation = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");

    resetMutation.mutate(
      { token, password },
      {
        onSuccess: () => toast.success("Password reset successful. You can now sign in."),
        onError: (error) => toast.error(error.message || "Unable to reset password"),
      },
    );
  }

  return (
    <AuthShell>
      <h1 className="mb-1 text-center text-2xl font-bold md:text-3xl">Reset Password</h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Choose a new secure password for your account.
      </p>

      {!token ? (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">Invalid or expired reset link.</p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input id="password" name="password" type={showPassword ? "text" : "password"} required
              autoComplete="new-password" placeholder="Min 8 characters" minLength={8}
              className="h-11 w-full rounded-full border border-gray-300 bg-white pl-10 pr-10 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={resetMutation.isPending || !token}
          className="flex h-11 w-full items-center justify-center rounded-full bg-black text-sm font-medium text-white transition-colors hover:bg-gray-900 disabled:opacity-50">
          {resetMutation.isPending ? "Updating…" : "Reset Password"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link href="/signin" className="font-medium text-black hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
