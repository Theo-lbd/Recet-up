import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSend(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t dark:border-gray-700 p-4">
      <div className="flex items-end space-x-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 resize-none border-gray-300 dark:border-gray-600 rounded-lg focus:border-accent focus:ring-accent dark:bg-gray-700 dark:text-white min-h-[80px]"
          disabled={disabled || isSubmitting}
        />
        <button
          type="submit"
          disabled={disabled || isSubmitting || !message.trim()}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
};