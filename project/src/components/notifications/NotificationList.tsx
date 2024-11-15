import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from '../../utils/date';

interface NotificationListProps {
  onClose: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const { notifications, markAllAsRead } = useNotifications();
  const [hasMarkedAsRead, setHasMarkedAsRead] = React.useState(false);

  useEffect(() => {
    const markRead = async () => {
      if (!hasMarkedAsRead) {
        await markAllAsRead();
        setHasMarkedAsRead(true);
      }
    };

    markRead();
  }, [hasMarkedAsRead, markAllAsRead]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">Notifications</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Aucune notification
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 ${
                    notification.read 
                      ? 'bg-white dark:bg-gray-800' 
                      : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <p className="text-gray-900 dark:text-white">{notification.message}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};