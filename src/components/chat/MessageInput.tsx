"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "../ui/button";

interface Props {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function MessageInput({ onSend, isLoading }: Props) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSend(message.trim());
        setMessage("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // grow height
    }
  };

  return (
    <div className="border-t px-4 py-3 bg-white">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type your message..."
          className="w-full resize-none overflow-hidden text-sm px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <Button
          onClick={() => {
            if (message.trim()) {
              onSend(message.trim());
              setMessage("");
              if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
              }
            }
          }}
          disabled={!message.trim() || isLoading}
          className="p-2"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Optional Step 11 loading indicator placeholder */}
      {isLoading && (
        <p className="text-xs text-zinc-500 mt-2 ml-1">Thinking...</p>
      )}
    </div>
  );
}
