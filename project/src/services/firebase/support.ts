import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { User } from '../../contexts/UserContext';

export const createSupportConversation = async (
  user: User,
  title: string,
  initialMessage: string,
  type: 'improvement' | 'bug' | 'other'
) => {
  try {
    // Create the conversation
    const conversationRef = await addDoc(collection(db, 'conversations'), {
      userId: user.uid,
      userName: user.displayName,
      userAvatar: user.photoURL,
      title,
      type,
      status: 'open',
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      lastMessage: initialMessage
    });

    // Add the initial message
    await addDoc(collection(db, 'messages'), {
      conversationId: conversationRef.id,
      senderId: user.uid,
      senderName: user.displayName,
      senderAvatar: user.photoURL,
      content: initialMessage,
      createdAt: serverTimestamp()
    });

    return conversationRef.id;
  } catch (error) {
    console.error('Error creating support conversation:', error);
    throw error;
  }
};

export const addMessageToConversation = async (
  conversationId: string,
  user: User,
  content: string
) => {
  try {
    // Add the message
    await addDoc(collection(db, 'messages'), {
      conversationId,
      senderId: user.uid,
      senderName: user.displayName,
      senderAvatar: user.photoURL,
      content,
      createdAt: serverTimestamp()
    });

    // Update conversation's last message
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: content,
      lastMessageAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

export const updateConversationStatus = async (
  conversationId: string,
  status: 'open' | 'closed'
) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, { status });
  } catch (error) {
    console.error('Error updating conversation status:', error);
    throw error;
  }
};

export const getConversation = async (conversationId: string) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (!conversationSnap.exists()) {
      throw new Error('Conversation not found');
    }

    return {
      id: conversationSnap.id,
      ...conversationSnap.data()
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};