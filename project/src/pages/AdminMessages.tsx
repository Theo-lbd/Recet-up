import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { ConversationList } from '../components/support/ConversationList';
import { MessageList } from '../components/support/MessageList';
import { MessageInput } from '../components/support/MessageInput';
import { getConversationsQuery, getMessagesQuery } from '../lib/firebase';
import { addMessageToConversation, updateConversationStatus } from '../services/firebase/support';
import type { Conversation, Message } from '../types/support';
import { onSnapshot } from 'firebase/firestore';

export const AdminMessages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(getConversationsQuery('admin'), (snapshot) => {
      const conversationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastMessageAt: doc.data().lastMessageAt?.toDate(),
      })) as Conversation[];

      setConversations(conversationsData);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = onSnapshot(getMessagesQuery(selectedConversation), (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Message[];

      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  const handleSendMessage = async (content: string) => {
    if (!user || !selectedConversation) return;
    await addMessageToConversation(selectedConversation, user, content);
  };

  const handleStatusChange = async () => {
    if (!selectedConversation) return;
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    await updateConversationStatus(
      selectedConversation,
      conversation.status === 'open' ? 'closed' : 'open'
    );
  };

  return (
    <div className="fixed inset-0 pt-16 pb-16 flex">
      {/* Conversation List */}
      <div className="w-80 border-r dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation}
            onSelect={setSelectedConversation}
          />
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="border-b dark:border-gray-700 p-4 flex items-center justify-between">
              <button
                onClick={() => setSelectedConversation(null)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={handleStatusChange}
                className="px-3 py-1 rounded-full text-sm font-medium bg-accent text-white hover:bg-accent-dark"
              >
                Marquer comme {conversations.find(c => c.id === selectedConversation)?.status === 'open' ? 'terminé' : 'en cours'}
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto">
                <MessageList messages={messages} />
              </div>
              
              {/* Message Input */}
              <div className="border-t dark:border-gray-700">
                <MessageInput onSend={handleSendMessage} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Sélectionnez une conversation
          </div>
        )}
      </div>
    </div>
  );
};