import React, { useState, useEffect, useRef } from 'react';
import { Send, Archive } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { formatDistanceToNow } from '../../utils/date';
import type { AdminMessage, AdminConversation } from '../../types/admin';

interface MessageThreadProps {
  conversationId: string;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ conversationId }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    conversations,
    sendMessage,
    markAsRead,
    archiveConversation,
    loadMoreMessages,
  } = useAdmin();

  const conversation = conversations.find(c => c.id === conversationId);
  const threadMessages = messages.filter(m => m.conversationId === conversationId);

  useEffect(() => {
    const unreadMessages = threadMessages
      .filter(m => !m.read)
      .map(m => m.id);

    if (unreadMessages.length > 0) {
      markAsRead(unreadMessages);
    }
  }, [threadMessages, markAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [threadMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      await sendMessage(conversationId, newMessage);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    try {
      await archiveConversation(conversationId);
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  if (!conversation) return null;

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="font-medium dark:text-white">
            {conversation.subject || 'No subject'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {conversation.participants.length} participants
          </p>
        </div>
        <button
          onClick={handleArchive}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <Archive size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {threadMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === 'admin' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === 'admin'
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-75">
                {formatDistanceToNow(new Date(message.timestamp))}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-accent"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newMessage.trim()}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </>
  );
};