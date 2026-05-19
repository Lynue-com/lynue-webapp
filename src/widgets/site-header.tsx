"use client";

import Image from "next/image";
import Link from "next/link";

const LOGO_URL =
  "https://storage.googleapis.com/lynue-public-assets/lynue%20logo/lynue.com_logo_word.avif";


import { usePathname, useRouter } from "next/navigation";
import { Bell, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useLogout, useMe } from "@/queries/use-auth";
import { useNotificationCount } from "@/queries/use-notifications";
import { ProfileAvatar } from "@/shared/ui/profile-avatar";
import { SearchBar } from "@/shared/ui/search-bar";

const primaryNav = [
  { label: "Rent", href: "/rent" },
  { label: "Buy", href: "/buy" },
  { label: "List", href: "/list" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const meQuery = useMe();
  const logoutMutation = useLogout();
  const user = meQuery.data;
  const countQuery = useNotificationCount(!!user);
  const unreadCount = countQuery.data ?? 0;
  const showSearch = !!user || ["/listings", "/rent", "/buy"].includes(pathname);
  const isHomepage = pathname === "/";

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Signed out");
        router.push("/");
      },
      onError: (err) => {
        toast.error(err.message || "Unable to sign out");
      },
    });
  }

  return (
    <>
      {/* Mobile header */}
      <header className={`fixed left-0 right-0 top-0 z-50 flex h-15 items-center gap-3 bg-white px-4 lg:hidden ${isHomepage ? "justify-center" : "justify-between"}`}>
        <Link href="/" className="shrink-0">
          <Image src={LOGO_URL} alt="Lynue" width={90} height={26} className="h-7 w-auto object-contain" priority />
        </Link>
        {!isHomepage && showSearch ? (
          <div className="min-w-0 flex-1">
            <SearchBar size="sm" />
          </div>
        ) : null}

      </header>

      {/* Desktop header */}
      <header className="fixed left-0 right-0 top-0 z-50 hidden h-17.5 items-center justify-between bg-white/95 px-8 backdrop-blur-lg lg:flex xl:px-26">
        <Link href="/" className="shrink-0">
          <Image src={LOGO_URL} alt="Lynue" width={110} height={30} className="h-8 w-auto object-contain" priority />
        </Link>

        <nav className="flex items-center gap-1">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-3xl px-4 py-2 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "font-semibold text-zinc-900"
                  : "text-[#7D7D7D] hover:text-zinc-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {showSearch ? (
          <div className="w-80 xl:w-96">
            <SearchBar size="md" />
          </div>
        ) : (
          <div />
        )}

        <div className="flex shrink-0 items-center gap-3">
          {user ? (
            <>
              <Link href="/messages" className="relative rounded-full p-2 text-zinc-600 hover:bg-zinc-100" aria-label="Messages">
                <MessageCircle size={20} />
              </Link>
              <Link href="/notifications" className="relative rounded-full p-2 text-zinc-600 hover:bg-zinc-100" aria-label="Notifications">
                <Bell size={20} />
                {unreadCount > 0 ? (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Link>
              <Link href="/dashboard" aria-label="Dashboard">
                <ProfileAvatar
                  src={user.profileImage}
                  alt={`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Profile"}
                  initials={`${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`}
                  className="h-9 w-9 border-2 border-white shadow"
                />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="rounded-full border border-zinc-900 px-5 py-1.5 text-xs font-medium text-zinc-900 transition hover:bg-zinc-50"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-zinc-900 px-5 py-1.5 text-xs font-medium text-white transition hover:bg-[#FFE380] hover:text-zinc-900"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Spacer so content doesn't hide behind fixed header */}
      <div className="h-15 lg:h-17.5" />
    </>
  );
}
