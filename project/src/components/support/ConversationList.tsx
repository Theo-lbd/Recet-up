import React from 'react';
import { formatDistanceToNow } from '../../utils/date';
import type { Conversation } from '../../types/support';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Aucune conversation
      </div>
    );
  }

  return (
    <div className="divide-y dark:divide-gray-700">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
            selectedId === conversation.id ? 'bg-gray-50 dark:bg-gray-700' : ''
          }`}
        >
          <img
            src={conversation.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.userId}`}
            alt={conversation.userName}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {conversation.subject || 'Sans titre'}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(conversation.lastMessageAt)}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {conversation.lastMessage}
            </p>
            <div className="flex items-center mt-1 space-x-2">
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  conversation.status === 'open'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {conversation.status === 'open' ? 'En cours' : 'Terminé'}
              </span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  conversation.type === 'bug'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    : conversation.type === 'improvement'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {conversation.type === 'bug'
                  ? 'Bug'
                  : conversation.type === 'improvement'
                  ? 'Amélioration'
                  : 'Autre'}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};