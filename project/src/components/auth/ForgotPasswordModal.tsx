import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus('success');
    } catch (err: any) {
      console.error('Error sending reset email:', err);
      setStatus('error');
      switch (err.code) {
        case 'auth/user-not-found':
          setError('Aucun compte associé à cet email');
          break;
        case 'auth/invalid-email':
          setError('Email invalide');
          break;
        default:
          setError('Une erreur est survenue. Veuillez réessayer.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">
            Réinitialiser le mot de passe
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="text-green-500 dark:text-green-400 mb-2">
                Email envoyé !
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Consultez votre boîte mail pour réinitialiser votre mot de passe.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Entrez votre adresse email pour recevoir un lien de réinitialisation.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-accent focus:border-accent bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark disabled:opacity-50"
                >
                  {status === 'loading' ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};