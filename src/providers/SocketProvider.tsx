import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import type { Conversation, Message, ConversationWith } from "@/types/chat";
import { toast } from "sonner"; // 1. Import the toast function directly from sonner
import { socket } from "@/service/socketioService";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";

interface AppSocketContextType {
  conversations: Conversation[];
  isLoading: boolean;
}

const SocketContext = createContext<AppSocketContextType | undefined>(
  undefined
);

export const useSocket = (): AppSocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { leagueAdmin } = useAuthLeagueAdmin(true);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    const userId = leagueAdmin?.account.user_id;
    if (!userId) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("Socket connected!");
      socket.emit("get_conversations", { user_id: userId });
    };

    const handleConversations = (data: unknown) => {
      let conversationList: Conversation[] = Array.isArray(data)
        ? data
        : (data as any)?.conversations || (data as any)?.data || [];
      setConversations(conversationList);
      setIsLoading(false);
    };

    const handleNewMessage = (newMessage: Message) => {
      setConversations((prev) => {
        const newConvs = [...prev];
        const convIndex = newConvs.findIndex(
          (c) => c.conversation_with.user_id === newMessage.sender_id
        );
        if (convIndex !== -1) {
          const updatedConv = { ...newConvs[convIndex] };
          updatedConv.messages.push(newMessage);
          newConvs.splice(convIndex, 1);
          newConvs.unshift(updatedConv);
        } else {
          const newConv: Conversation = {
            conversation_with: {
              user_id: newMessage.sender_id,
              name: newMessage.sender_name || "New Chat",
            } as ConversationWith,
            messages: [newMessage],
          };
          newConvs.unshift(newConv);
        }
        return newConvs;
      });

      toast.message(`New message from ${newMessage.sender_name || "Unknown"}`, {
        description: newMessage.content,
        action: {
          label: "View",
          onClick: () =>
            navigate(
              `/portal/league-administrator/start-chat/${
                newMessage.sender_id
              }/${encodeURIComponent(newMessage.sender_name || "Chat")}`
            ),
        },
      });
    };

    socket.on("connect", handleConnect);
    socket.on("conversations", handleConversations);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("conversations", handleConversations);
      socket.off("new_message", handleNewMessage);
    };
  }, [leagueAdmin?.account.user_id, navigate]);

  const value = { conversations, isLoading };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
