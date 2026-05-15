"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/shared/ui/auth-shell";
import { useSignin } from "@/queries/use-auth";

function SigninContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  // Only allow relative paths to prevent open redirect
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";
  const signinMutation = useSignin();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");

    signinMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Signed in successfully");
          router.push(next);
        },
        onError: (error) => {
          toast.error(error.message || "Unable to sign in");
        },
      },
    );
  }

  return (
    <AuthShell>
      <h1 className="mb-1 text-center text-2xl font-bold md:text-3xl">Sign In</h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-black hover:underline">Sign up</Link>
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

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input id="password" name="password" type={showPassword ? "text" : "password"} required
              autoComplete="current-password" placeholder="••••••••"
              className="h-11 w-full rounded-full border border-gray-300 bg-white pl-10 pr-10 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <div className="mt-1.5 text-right">
            <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-black hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <button type="submit" disabled={signinMutation.isPending}
          className="flex h-11 w-full items-center justify-center rounded-full bg-black text-sm font-medium text-white transition-colors hover:bg-gray-900 disabled:opacity-50">
          {signinMutation.isPending ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function SigninPage() {
  return (
    <Suspense>
      <SigninContent />
    </Suspense>
  );
}
