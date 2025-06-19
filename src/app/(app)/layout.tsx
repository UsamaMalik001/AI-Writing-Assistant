// src/app/(app)/layout.tsx
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Header } from "@/components/component/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        {children}
      </main>
    </div>
  );
}
