import React from 'react';
import { formatDistanceToNow } from '../../utils/date';
import type { AdminConversation } from '../../types/admin';

interface ConversationListProps {
  conversations: AdminConversation[];
  activeConversation: string | null;
  onSelect: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  onSelect,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        No conversations found
      </div>
    );
  }

  return (
    <div className="divide-y dark:divide-gray-700">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
            activeConversation === conversation.id
              ? 'bg-gray-50 dark:bg-gray-700'
              : ''
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium dark:text-white">
              {conversation.subject || 'No subject'}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(conversation.lastMessageAt))}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {conversation.lastMessage}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              conversation.type === 'support'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                : conversation.type === 'direct'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {conversation.type}
            </span>

            {conversation.unreadCount > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};