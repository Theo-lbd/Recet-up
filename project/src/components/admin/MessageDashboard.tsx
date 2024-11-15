import React, { useState, useEffect } from 'react';
import { Search, Archive, Filter } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';
import { MessageStats } from './MessageStats';

export const MessageDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const { conversations, stats, searchMessages } = useAdmin();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const results = await searchMessages(searchQuery);
    if (results.length > 0) {
      setActiveConversation(results[0].conversationId);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'unread') return conv.unreadCount > 0;
    if (filter === 'archived') return conv.status === 'archived';
    return conv.status === 'active';
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold dark:text-white mb-4">
          Messages Dashboard
        </h2>
        <MessageStats stats={stats} />
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="w-80 border-r dark:border-gray-700 flex flex-col">
          {/* Search and filters */}
          <div className="p-4 border-b dark:border-gray-700">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
            </form>

            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded text-sm ${
                  filter === 'all'
                    ? 'bg-accent text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded text-sm ${
                  filter === 'unread'
                    ? 'bg-accent text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('archived')}
                className={`px-3 py-1.5 rounded text-sm ${
                  filter === 'archived'
                    ? 'bg-accent text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Archive size={16} className="inline-block mr-1" />
                Archived
              </button>
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={filteredConversations}
              activeConversation={activeConversation}
              onSelect={setActiveConversation}
            />
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeConversation ? (
            <MessageThread conversationId={activeConversation} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
};