"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/shared/ui/auth-shell";
import { useSignup } from "@/queries/use-auth";

export default function SignupPage() {
  const router = useRouter();
  const signupMutation = useSignup();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const firstName = String(fd.get("firstName") ?? "").trim();
    const lastName = String(fd.get("lastName") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");

    signupMutation.mutate(
      { firstName, lastName, email, password },
      {
        onSuccess: () => {
          toast.success("Account created");
          router.push("/dashboard");
        },
        onError: (error) => {
          toast.error(error.message || "Unable to create account");
        },
      },
    );
  }

  return (
    <AuthShell>
      <h1 className="mb-1 text-center text-2xl font-bold md:text-3xl">Create Account</h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-black hover:underline">Sign in</Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input id="firstName" name="firstName" type="text" required autoComplete="given-name" placeholder="First name"
                className="h-11 w-full rounded-full border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input id="lastName" name="lastName" type="text" required autoComplete="family-name" placeholder="Last name"
                className="h-11 w-full rounded-full border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
          </div>
        </div>

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
              autoComplete="new-password" placeholder="Min 8 characters" minLength={8}
              className="h-11 w-full rounded-full border border-gray-300 bg-white pl-10 pr-10 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={signupMutation.isPending}
          className="flex h-11 w-full items-center justify-center rounded-full bg-black text-sm font-medium text-white transition-colors hover:bg-gray-900 disabled:opacity-50">
          {signupMutation.isPending ? "Creating account…" : "Create Account"}
        </button>
      </form>
    </AuthShell>
  );
}
