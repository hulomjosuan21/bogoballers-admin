import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ContentHeader from "@/components/content-header";
import { Input } from "@/components/ui/input";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";
import { PendingLeagueAlert } from "@/components/LeagueStatusAlert";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

const formatConversationTimestamp = (timestamp?: string) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};

interface Message {
  message_id?: string | null;
  sender_id: string;
  receiver_id: string;
  content: string;
  sent_at?: string;
  sender_name?: string;
  receiver_name?: string;
}

interface ConversationWith {
  user_id: string;
  name: string;
  entity_id?: string;
  image_url?: string;
}

interface Conversation {
  conversation_with: ConversationWith;
  messages: Message[];
}
const ConversationPage = () => {
  const { leagueAdmin, leagueAdminLoading } = useAuthLeagueAdmin();
  const { league_status, isActive } = useActiveLeagueMeta();
  const userId = leagueAdmin?.user_id || null;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io(SOCKET_URL, {
      autoConnect: false,
      reconnectionAttempts: 5,
    });

    const onConnect = () => {
      setIsConnected(true);
      setIsLoading(false);
      newSocket.emit("get_conversations", { user_id: userId });
    };

    const onDisconnect = () => setIsConnected(false);

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);
    newSocket.on("reconnect", onConnect);

    newSocket.connect();
    newSocket.emit("join_user_room", { user_id: userId });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (!socket || !userId) return;

    const handleIncomingMessageForList = (msg: any, isSentByMe: boolean) => {
      const messageData = msg as Message;
      const otherId = isSentByMe
        ? messageData.receiver_id
        : messageData.sender_id;
      const otherName = isSentByMe
        ? messageData.receiver_name
        : messageData.sender_name;

      setConversations((prev) => {
        const existingIndex = prev.findIndex(
          (c) => c.conversation_with.user_id === otherId
        );
        let updatedList = [...prev];
        let targetConv: Conversation;

        if (existingIndex !== -1) {
          targetConv = { ...updatedList[existingIndex] };
          const msgs = [...targetConv.messages];

          // Simple deduplication
          const exists = msgs.some(
            (m) =>
              (m.message_id && m.message_id === messageData.message_id) ||
              (m.content === messageData.content &&
                m.sent_at === messageData.sent_at)
          );

          if (!exists) {
            msgs.push(messageData);
          }
          targetConv.messages = msgs;
          updatedList.splice(existingIndex, 1);
        } else {
          targetConv = {
            conversation_with: {
              user_id: otherId,
              name: otherName || "Unknown User",
            },
            messages: [messageData],
          };
        }
        updatedList.unshift(targetConv);
        return updatedList;
      });
    };

    const onConversations = (data: any) => {
      setConversations(data.conversations || []);
      setIsLoading(false);
    };

    socket.on("conversations", onConversations);
    socket.on("new_message", (d: any) =>
      handleIncomingMessageForList(d, false)
    );
    socket.on("message_sent", (d: any) =>
      handleIncomingMessageForList(d, true)
    );

    return () => {
      socket.off("conversations", onConversations);
      socket.off("new_message");
      socket.off("message_sent");
    };
  }, [socket, userId]);

  return (
    <ContentShell>
      <ContentHeader title="Chats" />
      <ContentBody>
        {isActive && league_status == "Pending" && (
          <PendingLeagueAlert onContentBody={false} />
        )}
        {!isConnected && !isLoading && (
          <div className="bg-destructive/10 p-2 text-xs text-destructive text-center flex items-center justify-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Connection lost. Reconnecting...
          </div>
        )}
        <div className="p-4">
          <Input type="text" placeholder="Search messages" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading || leagueAdminLoading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-2 text-muted-foreground">
              <Spinner className="w-6 h-6" />
              <span className="text-xs">Loading conversations...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No chats yet
            </div>
          ) : (
            conversations.map((conv) => {
              const partner = conv.conversation_with;
              const lastMsg =
                conv.messages.length > 0
                  ? conv.messages[conv.messages.length - 1]
                  : null;

              const linkPath = `/portal/league-administrator/start-chat/${
                partner.user_id
              }/${encodeURIComponent(partner.name)}`;

              return (
                <Link
                  key={partner.user_id}
                  to={linkPath}
                  className="block hover:bg-muted/50 transition-colors rounded-md"
                >
                  <div className="px-3 py-2 flex items-center space-x-3">
                    {partner.image_url ? (
                      <img
                        src={partner.image_url}
                        alt={partner.name}
                        className="w-8 h-8 rounded-full object-cover bg-muted"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 font-bold text-lg">
                        {partner.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-semibold text-xs text-foreground truncate">
                          {partner.name}
                        </span>
                        {lastMsg && (
                          <span className="text-[11px] text-muted-foreground ml-2 shrink-0">
                            {formatConversationTimestamp(lastMsg.sent_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate pr-4">
                        {lastMsg ? lastMsg.content : "Start chatting"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </ContentBody>
    </ContentShell>
  );
};

export default ConversationPage;
