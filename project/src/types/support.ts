export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  subject: string;
  type: 'bug' | 'improvement' | 'other';
  status: 'open' | 'closed';
  createdAt: Date;
  lastMessageAt: Date;
  lastMessage: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  createdAt: Date;
}

export interface SupportFormData {
  subject: string;
  content: string;
  type: 'bug' | 'improvement' | 'other';
}