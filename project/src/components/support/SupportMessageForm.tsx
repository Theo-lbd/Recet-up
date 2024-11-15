import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';

interface SupportMessageFormProps {
  onSubmit: (subject: string, content: string, type: string) => Promise<void>;
  onCancel: () => void;
}

const SUPPORT_CATEGORIES = [
  { value: 'improvement', label: 'Suggérer une amélioration' },
  { value: 'bug', label: 'Signaler un bug' },
  { value: 'other', label: 'Autre' },
] as const;

export const SupportMessageForm: React.FC<SupportMessageFormProps> = ({ onSubmit, onCancel }) => {
  const { user } = useUser();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<string>(SUPPORT_CATEGORIES[0].value);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !message.trim() || !subject.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(subject, message, category);
    } catch (error) {
      console.error('Error submitting message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nom
        </label>
        <input
          type="text"
          value={user.displayName || ''}
          disabled
          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sujet
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-accent focus:border-accent"
          placeholder="Résumé de votre demande"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Catégorie
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-accent focus:border-accent"
        >
          {SUPPORT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
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
          required
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-accent focus:border-accent resize-none"
          placeholder="Comment pouvons-nous vous aider ?"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !message.trim() || !subject.trim()}
          className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </form>
  );
};