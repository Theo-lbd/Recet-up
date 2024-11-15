import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  startAfter,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useUser } from './UserContext';
import type { AdminMessage, AdminConversation, AdminDashboardStats } from '../types/admin';

interface AdminContextType {
  conversations: AdminConversation[];
  messages: AdminMessage[];
  stats: AdminDashboardStats;
  unreadCount: number;
  loading: boolean;
  loadMoreMessages: () => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  searchMessages: (query: string) => Promise<AdminMessage[]>;
  archiveConversation: (conversationId: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const MESSAGES_PER_PAGE = 50;

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalConversations: 0,
    unreadMessages: 0,
    activeUsers: 0,
    averageResponseTime: 0,
  });
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (!user?.uid) return;

    // Subscribe to conversations
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AdminConversation[];

      setConversations(conversationData);
      
      // Update stats
      const unreadCount = conversationData.reduce(
        (acc, conv) => acc + conv.unreadCount,
        0
      );
      
      setStats(prev => ({
        ...prev,
        totalConversations: conversationData.length,
        unreadMessages: unreadCount,
      }));
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const loadMoreMessages = async () => {
    if (!user?.uid || loading) return;

    try {
      setLoading(true);
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('participants', 'array-contains', user.uid),
        orderBy('timestamp', 'desc'),
        startAfter(lastMessage || new Date()),
        limit(MESSAGES_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AdminMessage[];

      setMessages(prev => [...prev, ...messageData]);
      setLastMessage(snapshot.docs[snapshot.docs.length - 1]);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user?.uid) throw new Error('Must be logged in to send messages');

    const messageRef = collection(db, 'messages');
    const conversationRef = doc(db, 'conversations', conversationId);

    try {
      // Add new message
      await addDoc(messageRef, {
        conversationId,
        senderId: user.uid,
        content,
        timestamp: serverTimestamp(),
        read: false,
        type: 'admin',
      });

      // Update conversation
      await updateDoc(conversationRef, {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async (messageIds: string[]) => {
    try {
      const updatePromises = messageIds.map(id =>
        updateDoc(doc(db, 'messages', id), { read: true })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  };

  const searchMessages = async (searchQuery: string) => {
    if (!searchQuery.trim()) return [];

    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('content', '>=', searchQuery),
        where('content', '<=', searchQuery + '\uf8ff'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AdminMessage[];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  };

  const archiveConversation = async (conversationId: string) => {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        status: 'archived',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        conversations,
        messages,
        stats,
        unreadCount: stats.unreadMessages,
        loading,
        loadMoreMessages,
        sendMessage,
        markAsRead,
        searchMessages,
        archiveConversation,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};