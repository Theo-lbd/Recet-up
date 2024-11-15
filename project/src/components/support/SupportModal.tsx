import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { createSupportConversation } from '../../services/firebase/support';

interface SupportModalProps {
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ onClose }) => {
  const { user } = useUser();
  const [type, setType] = useState<'improvement' | 'bug' | 'other'>('improvement');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await createSupportConversation(
        user,
        type === 'improvement' ? 'Suggestion' : type === 'bug' ? 'Bug Report' : 'Support Request',
        message,
        type
      );
      onClose();
    } catch (error) {
      console.error('Error creating support conversation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">Aide et support</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de demande
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'improvement' | 'bug' | 'other')}
              className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-accent focus:ring-accent dark:bg-gray-700 dark:text-white"
            >
              <option value="improvement">Suggérer une amélioration</option>
              <option value="bug">Signaler un bug</option>
              <option value="other">Autre demande</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-accent focus:ring-accent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-dark rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};