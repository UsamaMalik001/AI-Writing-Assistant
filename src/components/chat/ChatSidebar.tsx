"use client";

import { useEffect, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Trash2, Plus, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export function ChatSidebar() {
  const [supabase] = useState(() => createPagesBrowserClient());
  const [chats, setChats] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserEmail(session?.user?.email ?? null);
    };

    const fetchChats = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("id, created_at, messages(content)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch chats:", error.message);
      } else {
        setChats(data || []);
      }
    };

    getUser();
    fetchChats();
  }, [supabase]);

  const handleDelete = async (chatId: string) => {
    const { error } = await supabase.from("chats").delete().eq("id", chatId);

    if (error) {
      toast.error("Failed to delete chat.");
      return;
    }

    setChats((prev) => prev.filter((chat) => chat.id !== chatId));

    if (pathname === `/chat/${chatId}`) {
      router.push("/");
    }

    toast.success("Chat deleted");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="h-screen flex flex-col justify-between w-64 px-4 py-5 bg-[#1c1c1c] text-white">
      {/* Top section */}
      <div>
        <div className="text-lg font-semibold mb-12 pl-1">
          <Link href="/">AI Assistant</Link>
        </div>

        <Button
          onClick={() => router.push("/")}
          className="w-full flex items-center gap-2 justify-center bg-zinc-800 hover:bg-zinc-700"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>

        <ul className="space-y-2 mt-6 overflow-y-auto max-h-[65vh] pr-1">
          {chats.map((chat) => (
            <li
              key={chat.id}
              className="flex items-center justify-between text-sm rounded px-2"
            >
              <Link
                href={`/chat/${chat.id}`}
                className={`truncate p-2 rounded w-full text-left hover:bg-zinc-800 transition ${
                  pathname === `/chat/${chat.id}`
                    ? "bg-zinc-800 font-semibold"
                    : "text-zinc-300"
                }`}
              >
                {chat.messages?.[0]?.content.slice(0, 25) ||
                  `Chat – ${new Date(chat.created_at).toLocaleDateString()}`}
              </Link>
              <Button
                variant="ghost"
                onClick={() => handleDelete(chat.id)}
                className="ml-1 p-1 text-red-400 hover:text-red-600"
                title="Delete chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom section */}
      <div className="border-t border-zinc-700 pt-4 mt-6 text-sm">
        {userEmail && (
          <p className="mb-2 truncate text-zinc-400">{userEmail}</p>
        )}
        {/* <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 justify-start text-red-400 hover:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </Button> */}
      </div>
    </aside>
  );
}
