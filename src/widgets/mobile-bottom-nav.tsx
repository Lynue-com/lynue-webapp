"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Bookmark, MessageCircle } from "lucide-react";
import { useMe } from "@/queries/use-auth";
import { ProfileAvatar } from "@/shared/ui/profile-avatar";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/listings", icon: Search },
  { label: "List", href: "/list", icon: PlusCircle },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Messages", href: "/messages", icon: MessageCircle },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const meQuery = useMe();
  const user = meQuery.data;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-zinc-200 bg-white lg:hidden">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 py-2 text-xs text-zinc-600"
          >
            <Icon
              size={22}
              className={active ? "text-zinc-900" : "text-zinc-400"}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span className={active ? "font-semibold text-zinc-900" : ""}>{label}</span>
          </Link>
        );
      })}
      <Link href="/dashboard" className="flex flex-col items-center gap-1 py-2 text-xs text-zinc-600">
        <ProfileAvatar
          src={user?.profileImage}
          alt={user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "Account"}
          initials={`${user?.firstName?.charAt(0) ?? ""}${user?.lastName?.charAt(0) ?? ""}`}
          className="h-6 w-6"
        />
        <span className={pathname === "/dashboard" ? "font-semibold text-zinc-900" : ""}>Account</span>
      </Link>
    </nav>
  );
}
