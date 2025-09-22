import React, { useEffect, useRef } from "react"; // Import useRef
import { useLocation, Navigate } from "react-router-dom";
import type { ConversationWith } from "@/types/chat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/providers/SocketProvider";

interface LocationState {
  partner: ConversationWith;
  currentUserId: string;
  // We no longer need to pass initial messages here
}

function ChatScreen(): React.ReactElement {
  const location = useLocation();
  const state = location.state as LocationState | null;

  // 2. Get live conversations directly from the context
  const { conversations } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling

  // 3. Find the current conversation from the global list on every render
  const currentConversation = conversations.find(
    (conv) => conv.conversation_with.user_id === state?.partner.user_id
  );

  // The messages to display are now always sourced from the provider
  const messages = currentConversation?.messages || [];

  // 4. Remove the local useState and useEffect for messages. They are no longer needed.

  // Automatically scroll to the bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!state) {
    return <Navigate to="/" />;
  }

  const { partner, currentUserId } = state;

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 border-b bg-background sticky top-0">
        <h2 className="text-xl font-semibold">{partner.name}</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={msg.message_id || `msg-${index}`}
            className={`flex ${
              msg.sender_id === currentUserId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                msg.sender_id === currentUserId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {/* Add a div at the end of the list to scroll to */}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 border-t bg-background sticky bottom-0">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button>Send</Button>
        </div>
      </footer>
    </div>
  );
}

export default ChatScreen;
