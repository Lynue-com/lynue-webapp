"use client";

import { useState } from "react";
import { ShieldCheck, BellRing, Eye, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/shared/lib/http";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  async function onChangePassword(formData: FormData) {
    setSaving(true);

    try {
      await apiRequest("/api/users/me/password", {
        method: "POST",
        credentials: "include",
        json: {
          currentPassword: String(formData.get("currentPassword") ?? ""),
          newPassword: String(formData.get("newPassword") ?? ""),
        },
      });

      toast.success("Password updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
        <h1 className="text-3xl font-black text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600 sm:text-base">Manage account security, visibility, and notifications.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-full bg-zinc-100 p-2 text-zinc-600">
              <LockKeyhole size={16} />
            </span>
            <div>
              <h2 className="font-bold text-zinc-900">Change Password</h2>
              <p className="text-xs text-zinc-500">Use at least 8 characters and avoid reused passwords.</p>
            </div>
          </div>

          <form action={onChangePassword} className="space-y-3">
            <Input name="currentPassword" type="password" placeholder="Current password" required />
            <Input name="newPassword" type="password" placeholder="New password" minLength={8} required />
            <Button disabled={saving} className="rounded-full px-5">
              {saving ? "Updating..." : "Change password"}
            </Button>
          </form>
        </section>

        <section className="space-y-4">
          <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-zinc-500" />
              <h3 className="font-semibold text-zinc-900">Security status</h3>
            </div>
            <p className="mt-2 text-sm text-zinc-600">Your account is protected. Keep your credentials private and rotate your password regularly.</p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <BellRing size={16} className="text-zinc-500" />
              <h3 className="font-semibold text-zinc-900">Notification preferences</h3>
            </div>
            <p className="mt-2 text-sm text-zinc-600">In-app alerts are enabled for messages, listing updates, and saved listing activity.</p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-zinc-500" />
              <h3 className="font-semibold text-zinc-900">Privacy</h3>
            </div>
            <p className="mt-2 text-sm text-zinc-600">Your personal data is handled according to Lynue privacy policies and can be updated anytime.</p>
          </article>
        </section>
      </div>
    </div>
  );
}
