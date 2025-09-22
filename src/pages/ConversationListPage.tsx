import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocket } from "@/providers/SocketProvider";
import type { Conversation } from "@/types/chat";

function ConversationListPage(): React.ReactElement {
  const { conversations, isLoading } = useSocket();

  if (isLoading) {
    return <div className="p-4">Loading conversations...</div>;
  }

  const getLastMessage = (conv: Conversation) => {
    return conv.messages.length > 0
      ? conv.messages[conv.messages.length - 1]
      : null;
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Chats</h1>
      {conversations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No conversations yet.</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => {
            const lastMessage = getLastMessage(conv);
            return (
              <Link
                key={conv.conversation_with.user_id}
                to={`/portal/league-administrator/chat/${conv.conversation_with.user_id}`}
                className="block"
              >
                <Card className="hover:bg-accent transition-colors">
                  <CardHeader className="flex flex-row items-center space-x-4 p-4">
                    <Avatar>
                      <AvatarImage
                        src={conv.conversation_with.image_url}
                        alt={conv.conversation_with.name}
                      />
                      <AvatarFallback>
                        {conv.conversation_with.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate">
                      <CardTitle>{conv.conversation_with.name}</CardTitle>
                      <CardDescription className="truncate">
                        {lastMessage ? lastMessage.content : "No messages yet"}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ConversationListPage;
