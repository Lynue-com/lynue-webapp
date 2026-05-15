"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserRound, PlusCircle, ListChecks, Bell, MessageSquare, Settings } from "lucide-react";
import { AuthGuard } from "@/widgets/auth-guard";

const NAV = [
  { href: "/dashboard",          label: "Overview",    icon: LayoutDashboard, exact: true  },
  { href: "/dashboard/profile",  label: "Profile",     icon: UserRound },
  { href: "/dashboard/listings", label: "Listings",    icon: ListChecks },
  { href: "/list/new",           label: "New Listing", icon: PlusCircle },
  { href: "/messages",           label: "Messages",    icon: MessageSquare },
  { href: "/notifications",      label: "Alerts",      icon: Bell },
  { href: "/settings",           label: "Settings",    icon: Settings },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function active(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <AuthGuard>
      {/* Mobile: horizontal scrollable tab strip */}
      <nav className="sticky top-0 z-20 flex gap-1 overflow-x-auto border-b border-zinc-100 bg-white px-4 py-2 scrollbar-hide lg:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              active(item.href, "exact" in item ? item.exact : undefined)
                ? "bg-zinc-900 text-white"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <item.icon size={14} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Desktop: sidebar + content */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8 lg:py-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-zinc-100 bg-white p-2 shadow-sm">
            <p className="mb-2 px-3 pt-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">My Account</p>
            <nav className="space-y-0.5">
              {NAV.map((item) => {
                const isActive = active(item.href, "exact" in item ? item.exact : undefined);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <item.icon size={15} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </AuthGuard>
  );
}
