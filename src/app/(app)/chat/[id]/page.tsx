"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
}

export default function ChatView() {
  const { id } = useParams();
  const supabase = createPagesBrowserClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", id)
        .order("created_at", { ascending: true });

      if (error) console.error(error);
      else setMessages(data || []);
      setLoading(false);
    };

    loadMessages();
  }, [id]);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold mb-4">Conversation</h2>

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      )}

      {!loading && messages.length === 0 && (
        <p className="text-muted-foreground">No messages in this chat.</p>
      )}
      <div className="flex flex-col gap-2 h-[calc(100vh-100px)]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[80%] px-4 py-2 rounded-lg",
              msg.role === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-muted text-gray-900 self-start"
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
