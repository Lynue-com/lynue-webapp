"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/queries/use-notifications";

function timeAgo(value: string) {
  const elapsed = Math.floor((Date.now() - new Date(value).getTime()) / 60_000);
  if (elapsed < 1) return "Just now";
  if (elapsed < 60) return `${elapsed}m ago`;
  if (elapsed < 1440) return `${Math.floor(elapsed / 60)}h ago`;
  return `${Math.floor(elapsed / 1440)}d ago`;
}

export default function NotificationsPage() {
  const notificationsQuery = useNotifications();
  const markOneMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const notifications = notificationsQuery.data ?? [];
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Notifications</h1>
          {unread > 0 ? (
            <p className="mt-0.5 text-sm text-zinc-500">
              <span className="font-semibold text-zinc-900">{unread}</span> unread
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-zinc-400">All caught up</p>
          )}
        </div>
        {unread > 0 ? (
          <button
            type="button"
            className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50"
            disabled={markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <Bell size={36} className="mb-3 text-zinc-300" />
          <p className="font-semibold text-zinc-600">No notifications yet</p>
          <p className="mt-1 text-sm text-zinc-400">You&apos;re all caught up. Check back later.</p>
        </div>
      ) : null}

      {/* List */}
      <div className="space-y-2">
        {notifications.map((item) => {
          const inner = (
            <div
              className={`flex gap-3 rounded-2xl border p-4 transition ${
                item.isRead
                  ? "border-zinc-100 bg-white hover:border-zinc-200"
                  : "border-zinc-200 bg-white shadow-sm"
              }`}
            >
              {/* Unread dot */}
              <div className="mt-1.5 flex w-2 shrink-0 items-start">
                {!item.isRead ? <span className="h-2 w-2 rounded-full bg-zinc-900" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-sm font-semibold ${item.isRead ? "text-zinc-700" : "text-zinc-900"}`}
                  >
                    {item.title}
                  </p>
                  <span className="shrink-0 text-[11px] text-zinc-400">
                    {timeAgo(item.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-zinc-500">{item.message}</p>
              </div>
            </div>
          );

          const markRead = () => {
            if (!item.isRead) markOneMutation.mutate(item.id);
          };

          if (item.link) {
            return (
              <Link key={item.id} href={item.link} onClick={markRead}>
                {inner}
              </Link>
            );
          }
          return (
            <button key={item.id} type="button" onClick={markRead} className="w-full text-left">
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}
