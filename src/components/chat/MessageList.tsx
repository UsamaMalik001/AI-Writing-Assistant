"use client";
import { useEffect, useRef, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export function MessageList({ chatId }: { chatId: string }) {
  const [supabase] = useState(() => createPagesBrowserClient());
  const [messages, setMessages] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load messages initially
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (!error) setMessages(data || []);
    };

    load();
  }, [chatId]);

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("messages-listener")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          supabase
            .from("messages")
            .select("*")
            .eq("chat_id", chatId)
            .order("created_at", { ascending: true })
            .then(({ data }) => {
              if (data) setMessages(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // 👇 Scroll to latest message whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 px-4 py-4 overflow-y-auto">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        const timestamp = new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={msg.id}
            className={`flex ${
              isUser ? "justify-end" : "justify-start"
            } text-sm`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 shadow-sm whitespace-pre-wrap ${
                isUser
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-zinc-100 text-zinc-800 rounded-bl-none"
              }`}
            >
              <p>{msg.content}</p>
              <div className="text-xs mt-1 opacity-70 text-right">
                {timestamp}
              </div>
            </div>
          </div>
        );
      })}
      {/* 🔽 Auto-scroll target */}
      <div ref={bottomRef} />
    </div>
  );
}
