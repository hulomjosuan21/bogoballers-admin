export interface Message {
  message_id?: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  sent_at: string;
  sender_name?: string;
  receiver_name?: string;
  sender_entity_id?: string;
  receiver_entity_id?: string;
}

export interface ConversationWith {
  user_id: string;
  entity_id?: string;
  name: string;
  image_url?: string;
}
export interface Conversation {
  conversation_with: ConversationWith;
  messages: Message[];
}
