"use client";

import { useEffect, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export function ChatSidebar() {
  const [supabase] = useState(() => createPagesBrowserClient());
  const [chats, setChats] = useState<any[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch chats:", error.message);
      } else {
        setChats(data || []);
      }
    };

    fetchChats();
  }, [supabase]);

  const handleDelete = async (chatId: string) => {
    const { error } = await supabase.from("chats").delete().eq("id", chatId);

    if (error) {
      toast.error("Failed to delete chat.");
      return;
    }

    setChats((prev) => prev.filter((chat) => chat.id !== chatId));

    // If currently viewing this chat, redirect
    if (pathname === `/chat/${chatId}`) {
      router.push("/");
    }

    toast.success("Chat deleted");
  };

  return (
    <aside className="w-[250px] border-r h-full p-4 bg-white overflow-y-auto">
      <h2 className="text-lg font-semibold mb-14 mt-2">Your Chats</h2>
      <ul className="space-y-2">
        {chats.map((chat) => (
          <li key={chat.id} className="flex items-center justify-between">
            <Link
              href={`/chat/${chat.id}`}
              className="flex-1 truncate text-sm hover:underline"
            >
              Chat – {new Date(chat.created_at).toLocaleDateString()}
            </Link>
            <Button
              variant="ghost"
              onClick={() => handleDelete(chat.id)}
              className="ml-2 p-1 text-red-500 hover:text-red-600"
              title="Delete chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
