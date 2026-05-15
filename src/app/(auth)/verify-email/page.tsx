"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MailWarning, RefreshCcw, Mail } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/shared/ui/auth-shell";
import { useResendVerification, useVerifyEmail } from "@/queries/use-auth";

export default function VerifyEmailPage() {
  const token = useSearchParams().get("token") ?? "";
  const [email, setEmail] = useState("");
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();
  const { mutate } = verifyMutation;

  useEffect(() => {
    if (!token) return;
    mutate(
      { token },
      {
        onSuccess: () => toast.success("Email verified successfully"),
        onError: (error) => toast.error(error.message || "Unable to verify email"),
      },
    );
  }, [token, mutate]);

  return (
    <AuthShell>
      {verifyMutation.isSuccess ? (
        <div className="text-center">
          <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
          <h1 className="mt-4 text-2xl font-bold">Email Verified</h1>
          <p className="mt-2 text-sm text-gray-500">Your account is ready for full access.</p>
          <Link href="/signin"
            className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-black text-sm font-medium text-white hover:bg-gray-900">
            Sign In
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center">
            <MailWarning className="mx-auto text-amber-500" size={48} />
            <h1 className="mt-4 text-2xl font-bold">Verify Your Email</h1>
            <p className="mt-2 text-sm text-gray-500">
              {token ? "Verifying your email…" : "If your link expired, request a new verification email."}
            </p>
          </div>

          {!token ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="resend-email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input id="resend-email" type="email" value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-full border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
              </div>
              <button
                disabled={resendMutation.isPending || !email}
                onClick={() => {
                  resendMutation.mutate(email, {
                    onSuccess: () => toast.success("Verification email sent"),
                    onError: (error) => toast.error(error.message || "Unable to resend email"),
                  });
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-colors hover:bg-gray-900 disabled:opacity-50">
                <RefreshCcw size={14} />
                {resendMutation.isPending ? "Sending…" : "Resend Verification Email"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </AuthShell>
  );
}
