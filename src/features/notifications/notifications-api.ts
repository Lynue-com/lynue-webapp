import { z } from "zod";
import { apiRequest } from "@/shared/lib/http";

const notificationSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    message: z.string(),
    type: z.string(),
    isRead: z.boolean(),
    link: z.string().nullable().optional(),
    createdAt: z.string(),
  })
  .passthrough();

const notificationsResponseSchema = z.object({
  status: z.boolean(),
  notifications: z.array(notificationSchema),
});

const countResponseSchema = z.object({
  status: z.boolean(),
  count: z.number(),
});

export async function getNotifications() {
  const response = await apiRequest<unknown>("/api/notifications", {
    credentials: "include",
  });
  return notificationsResponseSchema.parse(response).notifications;
}

export async function getUnreadNotificationCount() {
  const response = await apiRequest<unknown>("/api/notifications/count", {
    credentials: "include",
  });
  return countResponseSchema.parse(response).count;
}

export async function markNotificationRead(id: string) {
  return apiRequest("/api/notifications/" + id + "/read", {
    method: "PATCH",
    credentials: "include",
  });
}

export async function markAllNotificationsRead() {
  return apiRequest("/api/notifications/read-all", {
    method: "PATCH",
    credentials: "include",
  });
}
