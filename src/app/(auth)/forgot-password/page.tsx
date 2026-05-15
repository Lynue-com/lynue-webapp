"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/shared/ui/auth-shell";
import { useForgotPassword } from "@/queries/use-auth";

export default function ForgotPasswordPage() {
  const forgotMutation = useForgotPassword();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim().toLowerCase();

    forgotMutation.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success("If your email exists, a reset link has been sent.");
        },
        onError: (error) => {
          toast.error(error.message || "Unable to submit request");
        },
      },
    );
  }

  return (
    <AuthShell>
      <h1 className="mb-1 text-center text-2xl font-bold md:text-3xl">Forgot Password</h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Enter your email and we&apos;ll send reset instructions.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com"
              className="h-11 w-full rounded-full border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
          </div>
        </div>

        <button type="submit" disabled={forgotMutation.isPending}
          className="flex h-11 w-full items-center justify-center rounded-full bg-black text-sm font-medium text-white transition-colors hover:bg-gray-900 disabled:opacity-50">
          {forgotMutation.isPending ? "Sending…" : "Send Reset Instructions"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link href="/signin" className="font-medium text-black hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
