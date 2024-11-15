import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useUser } from '../../contexts/UserContext';
import { formatDistanceToNow } from '../../utils/date';
import type { Message, Conversation } from '../../types/support';

interface ConversationViewProps {
  conversationId: string;
  onBack: () => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  conversationId,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.email === 'theo.labadie@outlook.com';

  useEffect(() => {
    const fetchConversation = async () => {
      const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
      if (conversationDoc.exists()) {
        setConversation({
          id: conversationDoc.id,
          ...conversationDoc.data(),
          createdAt: conversationDoc.data().createdAt?.toDate(),
          lastMessageAt: conversationDoc.data().lastMessageAt?.toDate(),
        } as Conversation);
      }
    };

    fetchConversation();

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Message[];
      
      setMessages(messageData);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [conversationId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting || !newMessage.trim() || !conversation) return;

    // Don't allow non-admin users to send messages if conversation is closed
    if (!isAdmin && conversation.status === 'closed') return;

    setIsSubmitting(true);
    try {
      const messagesRef = collection(db, 'messages');
      const messageData = {
        conversationId,
        content: newMessage,
        senderId: user.uid,
        senderName: user.displayName,
        senderAvatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        createdAt: serverTimestamp(),
        read: false
      };

      await addDoc(messagesRef, messageData);

      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: newMessage,
        lastMessageAt: serverTimestamp(),
      });

      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!conversation) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b dark:border-gray-700 p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-medium text-gray-900 dark:text-white">
            {conversation.subject}
          </h2>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(conversation.createdAt)}
            </p>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              conversation.status === 'open'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {conversation.status === 'open' ? 'En cours' : 'Terminé'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-end space-x-2">
              {message.senderId !== user?.uid && (
                <img
                  src={message.senderAvatar}
                  alt={message.senderName}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === user?.uid
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p>{message.content}</p>
                <div className="flex items-center justify-between mt-1 text-xs opacity-75">
                  <span>{message.senderName}</span>
                  <span>{formatDistanceToNow(message.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {(isAdmin || conversation.status === 'open') && (
        <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={conversation.status === 'closed' && !isAdmin ? 'Cette conversation est terminée' : 'Écrivez votre message...'}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white"
              disabled={conversation.status === 'closed' && !isAdmin}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newMessage.trim() || (conversation.status === 'closed' && !isAdmin)}
              className="p-2 bg-accent text-white rounded-lg hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};