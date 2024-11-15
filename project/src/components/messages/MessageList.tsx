import React, { useEffect, useRef } from 'react';
import { useMessages } from '../../contexts/MessageContext';
import { useUser } from '../../contexts/UserContext';
import { formatDistanceToNow } from '../../utils/date';

interface MessageListProps {
  conversationId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ conversationId }) => {
  const { messages, loadMessages } = useMessages();
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = loadMessages(conversationId);
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [conversationId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[conversationId]]);

  const conversationMessages = messages[conversationId] || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {conversationMessages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.senderId === user?.uid
                ? 'bg-accent text-white'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <span className="text-xs opacity-75 mt-1 block">
              {formatDistanceToNow(message.createdAt)}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};