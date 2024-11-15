import React from 'react';
import { MessageCircle, Clock, Users } from 'lucide-react';
import type { AdminDashboardStats } from '../../types/admin';

interface MessageStatsProps {
  stats: AdminDashboardStats;
}

export const MessageStats: React.FC<MessageStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-accent mb-2">
          <MessageCircle size={20} />
          <h3 className="font-medium">Total Conversations</h3>
        </div>
        <p className="text-2xl font-bold dark:text-white">
          {stats.totalConversations}
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-orange-500 mb-2">
          <MessageCircle size={20} />
          <h3 className="font-medium">Unread Messages</h3>
        </div>
        <p className="text-2xl font-bold dark:text-white">
          {stats.unreadMessages}
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-green-500 mb-2">
          <Users size={20} />
          <h3 className="font-medium">Active Users</h3>
        </div>
        <p className="text-2xl font-bold dark:text-white">
          {stats.activeUsers}
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-purple-500 mb-2">
          <Clock size={20} />
          <h3 className="font-medium">Avg. Response Time</h3>
        </div>
        <p className="text-2xl font-bold dark:text-white">
          {stats.averageResponseTime}m
        </p>
      </div>
    </div>
  );
};