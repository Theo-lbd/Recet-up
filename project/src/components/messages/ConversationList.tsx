import React from 'react';
import { useMessages } from '../../contexts/MessageContext';
import { formatDistanceToNow } from '../../utils/date';

interface ConversationListProps {
  onSelect: (conversationId: string) => void;
  selectedId?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelect,
  selectedId
}) => {
  const { conversations } = useMessages();

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
            selectedId === conversation.id ? 'bg-gray-50 dark:bg-gray-700' : ''
          }`}
        >
          <h3 className="font-medium text-gray-900 dark:text-white">
            {conversation.subject}
          </h3>
          {conversation.lastMessage && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
              {conversation.lastMessage}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {formatDistanceToNow(conversation.lastMessageAt)}
          </p>
        </button>
      ))}
      {conversations.length === 0 && (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Aucune conversation
        </div>
      )}
    </div>
  );
};