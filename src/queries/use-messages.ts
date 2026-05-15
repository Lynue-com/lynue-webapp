"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getConversationMessages, getConversations, sendMessage } from "@/features/messages/messages-api";

export function useConversations() {
  return useQuery({
    queryKey: ["messages", "conversations"],
    queryFn: getConversations,
    retry: false,
    refetchInterval: 8_000,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getConversationMessages(conversationId as string),
    enabled: Boolean(conversationId),
    retry: false,
    refetchInterval: 8_000,
  });
}

export function useSendMessage(activeConversationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["messages", "conversations"] });
      if (activeConversationId) {
        await queryClient.invalidateQueries({ queryKey: ["messages", activeConversationId] });
      }
    },
  });
}
