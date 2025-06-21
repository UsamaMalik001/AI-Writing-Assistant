"use client";

import { useState, useRef } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";

export function ChatInput({ chatId }: { chatId: string }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [supabase] = useState(() => createPagesBrowserClient());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = async () => {
    const trimmed = prompt.trim();

    if (!trimmed || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          chat_id: chatId,
          tone: "Formal",
        }),
      });

      if (!res.ok) {
        console.error("AI API failed:", await res.text());
      } else {
        setPrompt("");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border-t px-4 py-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
          className="flex-1 resize-none border rounded px-3 py-2 text-sm focus:outline-none max-h-[200px] overflow-y-auto"
        />
        <Button onClick={sendMessage} disabled={loading || !prompt.trim()}>
          {loading ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
