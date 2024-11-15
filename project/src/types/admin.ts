export interface AdminMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'support' | 'direct' | 'system';
}

export interface AdminConversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  type: 'support' | 'direct' | 'system';
  status: 'active' | 'archived';
  subject?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardStats {
  totalConversations: number;
  unreadMessages: number;
  activeUsers: number;
  averageResponseTime: number;
}