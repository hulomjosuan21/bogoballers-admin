import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ConversationWith } from "@/types/chat";
import { useSocket } from "@/providers/SocketProvider";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";

function ChatLoader(): React.ReactElement {
  const { leagueAdmin } = useAuthLeagueAdmin(true);
  const { conversations, isLoading } = useSocket();
  const navigate = useNavigate();

  const { partnerId, partnerName = "Chat" } = useParams<{
    partnerId: string;
    partnerName?: string;
  }>();

  const userId = leagueAdmin?.account.user_id ?? null;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!userId || !partnerId) {
      navigate("/", { replace: true });
      return;
    }

    const targetConversation = conversations?.find(
      (conv) => conv.conversation_with.user_id === partnerId
    );

    const partnerForState: ConversationWith = {
      user_id: partnerId,
      name: decodeURIComponent(partnerName),
      entity_id: partnerId,
    };

    navigate("/portal/league-administrator/chat", {
      state: {
        partner: targetConversation?.conversation_with || partnerForState,
        messages: targetConversation?.messages || [],
        currentUserId: userId,
      },
      replace: true,
    });
  }, [isLoading, conversations, partnerId, partnerName, userId, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      Loading conversation...
    </div>
  );
}

export default ChatLoader;
