import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ContentHeader from "@/components/content-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "@/types/chat";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

const ChatScreen = () => {
  const { leagueAdmin, leagueAdminLoading } = useAuthLeagueAdmin();

  const userId = leagueAdmin?.user_id || null;

  const { recipientId, recipientName } = useParams<{
    recipientId: string;
    recipientName?: string;
  }>();
  const navigate = useNavigate();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  useEffect(() => {
    if (!userId) {
      setConnectionError("User ID missing. Please log in.");
      return;
    }
    const newSocket = io(SOCKET_URL, {
      autoConnect: false,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    const onConnect = () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      newSocket.emit("join_user_room", { user_id: userId });
    };

    const onDisconnect = (reason: string) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    };

    const onConnectError = (err: Error) => {
      console.error("Socket connection error:", err);
      setConnectionError("Failed to connect to chat server.");
      setIsConnected(false);
    };

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);
    newSocket.on("connect_error", onConnectError);

    newSocket.connect();
    setSocket(newSocket);

    return () => {
      console.log("Cleaning up socket");
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.off("connect_error", onConnectError);
      newSocket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (!socket || !recipientId) return;
    const onConversations = (data: any) => {
      const list = data.conversations || [];
      const currentConv = list.find(
        (c: any) => String(c.conversation_with.user_id) === String(recipientId)
      );
      if (currentConv && currentConv.messages) {
        setMessages(currentConv.messages);
      }
    };

    socket.on("conversations", onConversations);
    if (userId) {
      socket.emit("get_conversations", { user_id: userId });
    }

    return () => {
      socket.off("conversations", onConversations);
    };
  }, [socket, recipientId, userId]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (msg: any) => {
      const newMessage = msg as Message;
      const isRelevant =
        String(newMessage.sender_id) === String(recipientId) &&
        String(newMessage.receiver_id) === String(userId);

      if (isRelevant) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              (m.message_id && m.message_id === newMessage.message_id) ||
              (m.content === newMessage.content &&
                m.sent_at === newMessage.sent_at)
          );
          if (!exists) return [...prev, newMessage];
          return prev;
        });
      }
    };

    const handleMessageSent = (msg: any) => {
      const newMessage = msg as Message;
      const isRelevant =
        String(newMessage.sender_id) === String(userId) &&
        String(newMessage.receiver_id) === String(recipientId);

      if (isRelevant) {
        setMessages((prev) => {
          const tempIndex = prev.findIndex(
            (m) =>
              !m.message_id &&
              m.content === newMessage.content &&
              m.sender_id === userId
          );

          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = newMessage;
            return updated;
          } else {
            const exists = prev.some(
              (m) => m.message_id === newMessage.message_id
            );
            if (!exists) return [...prev, newMessage];
            return prev;
          }
        });
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_sent", handleMessageSent);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_sent", handleMessageSent);
    };
  }, [socket, recipientId, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket || !userId) return;

    const content = messageInput.trim();

    const tempMessage: Message = {
      sender_id: userId,
      receiver_id: recipientId!,
      content: content,
      sent_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setMessageInput("");

    setTimeout(scrollToBottom, 10);

    socket.emit("send_message", {
      sender_id: userId,
      receiver_id: recipientId,
      content: content,
    });
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center p-6 bg-card rounded-lg shadow-sm border border-destructive/20">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground">
            Authentication Error
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            User ID not found. Please log in again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ContentShell>
      <ContentHeader title={recipientName || `User ${recipientId}`}>
        <Button
          className="size-7"
          size={"icon"}
          variant={"ghost"}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-3 h-3" />
        </Button>
      </ContentHeader>

      <ContentBody>
        {leagueAdminLoading && (
          <div className="flex flex-col items-center justify-center h-40 space-y-2 text-muted-foreground">
            <Spinner className="w-6 h-6" />
            <span className="text-xs">Loading conversations...</span>
          </div>
        )}

        <ScrollArea className="flex-1 px-2 pb-12 overflow-hidden">
          {connectionError && (
            <div className="w-full flex justify-center mb-4">
              <span className="bg-destructive/10 text-destructive text-xs px-3 py-1 rounded-full flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {connectionError}
              </span>
            </div>
          )}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
              <MessageSquare className="w-12 h-12 mb-2" />
              <p className="text-sm">Start your conversation</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = String(msg.sender_id) === String(userId);
              const isPending = msg.message_id === null;
              const isSeq =
                idx > 0 &&
                messages[idx - 1] &&
                String(messages[idx - 1].sender_id) === String(msg.sender_id);

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex w-full",
                    isMe ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "flex max-w-[80%] md:max-w-[60%] items-end gap-2",
                      isMe ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {!isMe && !isSeq && (
                      <div className="w-8 h-8 rounded-full bg-muted shrink-0 mb-1 overflow-hidden flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {recipientName
                          ? recipientName.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                    )}
                    {!isMe && isSeq && <div className="w-10" /> /* spacer */}

                    <div
                      className={cn(
                        "px-4 py-2 text-[14px] shadow-sm wrap-break-word rounded-2xl relative",
                        isMe
                          ? cn(
                              isPending ? "bg-primary/80" : "bg-primary",
                              "text-primary-foreground",
                              "rounded-tr-none"
                            )
                          : cn(
                              "bg-card text-card-foreground border border-border",
                              "rounded-tl-none"
                            ),
                        isSeq && "mt-1"
                      )}
                    >
                      {msg.content}

                      {isMe && isPending && (
                        <Loader2 className="w-4 h-4 animate-spin absolute -left-6 bottom-1 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3 max-w-4xl mx-auto"
          >
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected}
              className="flex-1"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!messageInput.trim() || !isConnected}
              size="icon"
              className="shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </ContentBody>
    </ContentShell>
  );
};

export default ChatScreen;
