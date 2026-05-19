"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { useMe, useUpdateAvatar, useUpdateProfile } from "@/queries/use-auth";
import { apiRequest } from "@/shared/lib/http";
import { ProfileAvatar } from "@/shared/ui/profile-avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

// ── Personal Details ──────────────────────────────────────────────
function PersonalDetailsSection() {
  const meQuery = useMe();
  const user = meQuery.data;
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhoneNumber(user.phoneNumber ?? "");
  }, [user]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    updateAvatar.mutate(file, {
      onSuccess: () => toast.success("Profile photo updated"),
      onError: (err) => toast.error(err.message || "Failed to upload photo"),
    });
    e.target.value = "";
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate(
      { firstName: firstName.trim(), lastName: lastName.trim(), phoneNumber: phoneNumber.trim() },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: (err) => toast.error(err.message || "Failed to update profile"),
      },
    );
  }

  const initials =
    `${user?.firstName?.charAt(0) ?? ""}${user?.lastName?.charAt(0) ?? ""}`.toUpperCase() || "?";

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-zinc-900">Personal Details</h2>
      <p className="mt-1 text-sm text-zinc-500">Manage your profile information.</p>

      {/* Avatar */}
      <div className="mt-6">
        <div className="relative inline-block">
          <ProfileAvatar
            src={user?.profileImage}
            initials={initials}
            alt={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Profile"}
            className="h-20 w-20 text-lg"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={updateAvatar.isPending}
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white shadow-md transition hover:bg-zinc-700 disabled:opacity-60"
            aria-label="Change profile photo"
          >
            <Camera size={13} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          {updateAvatar.isPending ? "Uploading…" : "Click the camera icon to change your photo"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">First Name</label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              autoComplete="given-name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Last Name</label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Email</label>
            <Input value={user?.email ?? ""} disabled readOnly autoComplete="email" />
            <p className="mt-1 text-xs text-zinc-400">Email cannot be changed</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Phone Number</label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              type="tel"
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={updateProfile.isPending} className="rounded-full px-8">
            {updateProfile.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </section>
  );
}

// ── Change Password ───────────────────────────────────────────────
function ChangePasswordSection() {
  const [saving, setSaving] = useState(false);

  async function onChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await apiRequest("/api/users/me/password", {
        method: "POST",
        json: {
          currentPassword: String(formData.get("currentPassword") ?? ""),
          newPassword: String(formData.get("newPassword") ?? ""),
        },
      });
      toast.success("Password updated");
      e.currentTarget.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update password");
    } finally {
      setSaving(false);
    }
  }

  return (
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
      <form onSubmit={onChangePassword} className="space-y-3">
        <Input name="currentPassword" type="password" placeholder="Current password" required />
        <Input name="newPassword" type="password" placeholder="New password" minLength={8} required />
        <Button disabled={saving} className="rounded-full px-5">
          {saving ? "Updating…" : "Change password"}
        </Button>
      </form>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PersonalDetailsSection />
      <ChangePasswordSection />
    </div>
  );
}
