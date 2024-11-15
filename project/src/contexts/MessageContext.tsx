import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useUser } from './UserContext';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessageAt: Date;
  subject: string;
  type: 'support' | 'general';
  lastMessage?: string;
}

interface MessageContextType {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (subject: string, message: string) => Promise<string>;
  loadMessages: (conversationId: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    // Subscribe to conversations without complex queries
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date(),
      })) as Conversation[];

      // Sort conversations client-side
      convs.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
      setConversations(convs);
    });

    return () => unsubscribe();
  }, [user]);

  const loadMessages = async (conversationId: string) => {
    if (!user) return;

    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId)
      );

      const snapshot = await getDocs(q);
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Message[];

      // Sort messages client-side
      msgs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      setMessages(prev => ({
        ...prev,
        [conversationId]: msgs
      }));

      // Subscribe to new messages
      return onSnapshot(q, (snapshot) => {
        const updatedMsgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Message[];

        updatedMsgs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        setMessages(prev => ({
          ...prev,
          [conversationId]: updatedMsgs
        }));
      });
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) return;

    try {
      // Add message
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        conversationId,
        senderId: user.uid,
        content,
        createdAt: serverTimestamp()
      });

      // Update conversation
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessageAt: serverTimestamp(),
        lastMessage: content
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const createConversation = async (subject: string, message: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const adminEmail = 'theo.labadie@outlook.com';
      const conversationsRef = collection(db, 'conversations');
      
      const conversationDoc = await addDoc(conversationsRef, {
        participants: [user.uid, adminEmail],
        subject,
        type: 'support',
        lastMessageAt: serverTimestamp(),
        lastMessage: message
      });

      // Add initial message
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        conversationId: conversationDoc.id,
        senderId: user.uid,
        content: message,
        createdAt: serverTimestamp()
      });

      return conversationDoc.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  return (
    <MessageContext.Provider value={{
      conversations,
      messages,
      sendMessage,
      createConversation,
      loadMessages
    }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};