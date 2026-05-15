"use client";

import { useState } from "react";
import { MapPin, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useMe } from "@/queries/use-auth";
import { apiRequest } from "@/shared/lib/http";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export default function DashboardProfilePage() {
  const userQuery = useMe();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSaving(true);

    try {
      await apiRequest("/api/users/me", {
        method: "PATCH",
        json: {
          firstName: String(formData.get("firstName") ?? ""),
          lastName: String(formData.get("lastName") ?? ""),
          phoneNumber: String(formData.get("phoneNumber") ?? ""),
          city: String(formData.get("city") ?? ""),
          state: String(formData.get("state") ?? ""),
        },
        credentials: "include",
      });

      toast.success("Profile updated");
      await userQuery.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update profile");
    } finally {
      setSaving(false);
    }
  }

  const user = userQuery.data;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return (
    <div className="space-y-5">
      <header className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
        <h1 className="text-3xl font-black text-zinc-900">Profile</h1>
        <p className="mt-1 text-sm text-zinc-600">Manage your public user details.</p>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white">
            <UserRound size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">{fullName || "Lynue User"}</p>
            <p className="text-xs text-zinc-500">{user?.email ?? "No email available"}</p>
          </div>
        </div>
      </header>

      <form action={handleSubmit} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-zinc-900">Basic Information</h2>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input name="firstName" defaultValue={user?.firstName ?? ""} placeholder="First name" />
          <Input name="lastName" defaultValue={user?.lastName ?? ""} placeholder="Last name" />
        </div>

        <h2 className="mt-6 text-base font-bold text-zinc-900">Contact & Location</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative">
            <Phone size={14} className="pointer-events-none absolute left-3 top-3.5 text-zinc-400" />
            <Input name="phoneNumber" defaultValue={user?.phoneNumber ?? ""} placeholder="Phone number" className="pl-9" />
          </div>
          <div className="relative">
            <MapPin size={14} className="pointer-events-none absolute left-3 top-3.5 text-zinc-400" />
            <Input name="city" defaultValue={user?.city ?? ""} placeholder="City" className="pl-9" />
          </div>
          <Input name="state" defaultValue={user?.state ?? ""} placeholder="State" />
        </div>

        <div className="mt-6">
          <Button disabled={saving} className="rounded-full px-6">
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
