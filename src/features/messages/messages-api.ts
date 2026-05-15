import { z } from "zod";
import { apiRequest } from "@/shared/lib/http";

const userSchema = z
  .object({
    id: z.string(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    profileImage: z.string().nullable().optional(),
  })
  .passthrough();

const conversationSchema = z
  .object({
    id: z.string(),
    otherUser: userSchema.nullable().optional(),
    lastMessage: z
      .object({
        text: z.string(),
        createdAt: z.string(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

const messageSchema = z
  .object({
    id: z.string(),
    text: z.string(),
    senderId: z.string(),
    createdAt: z.string(),
    isRead: z.boolean().optional(),
  })
  .passthrough();

const conversationsResponseSchema = z.object({
  status: z.boolean(),
  conversations: z.array(conversationSchema),
});

const messagesResponseSchema = z.object({
  status: z.boolean(),
  messages: z.array(messageSchema),
});

const sentResponseSchema = z.object({
  status: z.boolean(),
  message: messageSchema,
});

export async function getConversations() {
  const response = await apiRequest<unknown>("/api/messages", {
    credentials: "include",
  });
  return conversationsResponseSchema.parse(response).conversations;
}

export async function getConversationMessages(conversationId: string) {
  const response = await apiRequest<unknown>(`/api/messages/${conversationId}`, {
    credentials: "include",
  });
  return messagesResponseSchema.parse(response).messages;
}

export async function sendMessage(payload: { recipientId: string; text: string }) {
  const response = await apiRequest<unknown>("/api/messages", {
    method: "POST",
    json: payload,
    credentials: "include",
  });
  return sentResponseSchema.parse(response).message;
}
