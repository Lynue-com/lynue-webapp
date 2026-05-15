"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send, MessageSquare } from "lucide-react";
import { useMe } from "@/queries/use-auth";
import { useConversationMessages, useConversations, useSendMessage } from "@/queries/use-messages";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

function initials(first?: string | null, last?: string | null) {
  return [(first?.[0] ?? ""), (last?.[0] ?? "")].join("").toUpperCase() || "?";
}

function timeAgo(value: string) {
  const elapsed = Math.floor((Date.now() - new Date(value).getTime()) / 60_000);
  if (elapsed < 1) return "Just now";
  if (elapsed < 60) return `${elapsed}m`;
  if (elapsed < 1440) return `${Math.floor(elapsed / 60)}h`;
  return `${Math.floor(elapsed / 1440)}d`;
}

export default function MessagesPage() {
  const meQuery = useMe();
  const conversationsQuery = useConversations();
  const searchParams = useSearchParams();
  const deepLinkUserId = searchParams.get("userId");
  const bottomRef = useRef<HTMLDivElement>(null);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [text, setText] = useState("");

  const deepLinkedConversationId = useMemo(() => {
    if (!deepLinkUserId) return null;
    return (
      (conversationsQuery.data ?? []).find((c) => c.otherUser?.id === deepLinkUserId)?.id ?? null
    );
  }, [conversationsQuery.data, deepLinkUserId]);

  const activeId = selectedConversationId ?? deepLinkedConversationId;
  const messagesQuery = useConversationMessages(activeId);
  const sendMutation = useSendMessage(activeId);

  const activeConversation = useMemo(
    () => (conversationsQuery.data ?? []).find((c) => c.id === activeId),
    [activeId, conversationsQuery.data],
  );

  const recipientId = activeConversation?.otherUser?.id ?? deepLinkUserId ?? null;
  const conversations = conversationsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (meQuery.isError) {
    return (
      <div className="grid min-h-[60vh] place-items-center p-10 text-center">
        <div>
          <MessageSquare size={40} className="mx-auto mb-3 text-zinc-300" />
          <p className="font-semibold text-zinc-700">Sign in to access messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-7xl overflow-hidden md:h-[calc(100vh-5rem)]">
      {/* Conversations sidebar */}
      <aside
        className={`flex w-full shrink-0 flex-col border-r border-zinc-100 bg-white md:w-[300px] lg:w-[320px] ${
          activeId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="border-b border-zinc-100 px-4 py-4">
          <h1 className="text-lg font-black text-zinc-900">Messages</h1>
          <p className="text-xs text-zinc-400">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="grid place-items-center p-10 text-center">
              <MessageSquare size={32} className="mb-2 text-zinc-300" />
              <p className="text-sm text-zinc-500">No conversations yet</p>
            </div>
          ) : null}
          {conversations.map((conv) => {
            const isActive = conv.id === activeId;
            const other = conv.otherUser;
            return (
              <button
                type="button"
                key={conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isActive ? "bg-zinc-900" : "hover:bg-zinc-50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {initials(other?.firstName, other?.lastName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-semibold ${isActive ? "text-white" : "text-zinc-900"}`}
                  >
                    {other?.firstName} {other?.lastName}
                  </p>
                  <p className={`truncate text-xs ${isActive ? "text-zinc-300" : "text-zinc-500"}`}>
                    {conv.lastMessage?.text ?? "No messages yet"}
                  </p>
                </div>
                {conv.lastMessage?.createdAt ? (
                  <span
                    className={`shrink-0 text-xs ${isActive ? "text-zinc-300" : "text-zinc-400"}`}
                  >
                    {timeAgo(conv.lastMessage.createdAt)}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Chat panel */}
      <section
        className={`flex min-w-0 flex-1 flex-col bg-zinc-50 ${
          activeId ? "flex" : "hidden md:flex"
        }`}
      >
        <header className="flex items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3">
          {activeId ? (
            <button
              type="button"
              className="mr-1 rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 md:hidden"
              onClick={() => setSelectedConversationId(null)}
            >
              ←
            </button>
          ) : null}
          {activeConversation?.otherUser ? (
            <>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                {initials(
                  activeConversation.otherUser.firstName,
                  activeConversation.otherUser.lastName,
                )}
              </div>
              <p className="text-sm font-semibold text-zinc-900">
                {activeConversation.otherUser.firstName} {activeConversation.otherUser.lastName}
              </p>
            </>
          ) : deepLinkUserId ? (
            <p className="text-sm font-semibold text-zinc-700">New conversation</p>
          ) : (
            <p className="text-sm text-zinc-400">Select a conversation</p>
          )}
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
          {messages.map((msg) => {
            const mine = msg.senderId === meQuery.data?.id;
            return (
              <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%]">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      mine ? "bg-zinc-900 text-white" : "bg-white text-zinc-900 shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.createdAt ? (
                    <p className={`mt-1 text-[10px] text-zinc-400 ${mine ? "text-right" : ""}`}>
                      {timeAgo(msg.createdAt)}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
          {!activeId ? (
            <div className="grid place-items-center py-20 text-center">
              <MessageSquare size={40} className="mb-3 text-zinc-300" />
              <p className="text-sm text-zinc-500">Choose a conversation to start chatting</p>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <form
          className="flex gap-2 border-t border-zinc-100 bg-white px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = text.trim();
            if (!trimmed || !recipientId) return;
            sendMutation.mutate({ recipientId, text: trimmed });
            setText("");
          }}
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={recipientId ? "Type a message…" : "Select a conversation first"}
            disabled={!recipientId}
          />
          <Button type="submit" disabled={!recipientId || !text.trim() || sendMutation.isPending}>
            <Send size={14} />
          </Button>
        </form>
      </section>
    </div>
  );
}
