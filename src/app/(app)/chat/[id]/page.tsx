import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";

export default function ChatPage({ params }: { params: { id: string } }) {
  const chatId = params.id;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1">
        <MessageList chatId={chatId} />
      </div>
      <ChatInput chatId={chatId} />
    </div>
  );
}
