import React, { useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import { formatDistanceToNow } from '../../utils/date';
import type { Message } from '../../types/support';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessage = (message: Message) => {
    const isCurrentUser = message.senderId === user?.uid;
    
    return (
      <div
        key={message.id}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className="flex items-end">
          {!isCurrentUser && (
            <img
              src={message.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderId}`}
              alt="Avatar"
              className="w-8 h-8 rounded-full mr-2"
            />
          )}
          <div
            className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
              isCurrentUser
                ? 'bg-accent text-white rounded-br-none'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
            }`}
          >
            {!isCurrentUser && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {message.senderName}
              </p>
            )}
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            <p className="text-xs mt-1 opacity-70">
              {formatDistanceToNow(message.createdAt)}
            </p>
          </div>
          {isCurrentUser && (
            <img
              src={message.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderId}`}
              alt="Avatar"
              className="w-8 h-8 rounded-full ml-2"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {messages.map(renderMessage)}
      <div ref={messagesEndRef} />
    </div>
  );
};