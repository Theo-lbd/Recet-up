import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { ConversationList } from './ConversationList';
import { ConversationView } from './ConversationView';
import { SupportMessageForm } from './SupportMessageForm';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Conversation } from '../../types/support';

interface HelpSupportModalProps {
  onClose: () => void;
}

type ViewState = 'list' | 'conversation' | 'new';

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ onClose }) => {
  const [viewState, setViewState] = useState<ViewState>('list');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const conversationsRef = collection(db, 'conversations');
        const q = query(
          conversationsRef,
          where('userId', '==', user.uid)
        );

        const snapshot = await getDocs(q);
        const conversationData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          lastMessageAt: doc.data().lastMessageAt?.toDate(),
        })) as Conversation[];

        // Sort conversations by lastMessageAt date client-side
        conversationData.sort((a, b) => 
          (b.lastMessageAt?.getTime() || 0) - (a.lastMessageAt?.getTime() || 0)
        );

        setConversations(conversationData);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [user]);

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    setViewState('conversation');
  };

  const handleNewConversation = () => {
    setViewState('new');
  };

  const handleBack = () => {
    setViewState('list');
    setActiveConversation(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">Aide et support</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 min-h-0">
          {viewState === 'list' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b dark:border-gray-700">
                <button
                  onClick={handleNewConversation}
                  className="w-full px-4 py-2 text-white bg-accent rounded-lg hover:bg-accent-dark transition-colors"
                >
                  Nouvelle conversation
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ConversationList
                  conversations={conversations}
                  selectedId={activeConversation}
                  onSelect={handleSelectConversation}
                />
              </div>
            </div>
          )}

          {viewState === 'conversation' && activeConversation && (
            <ConversationView
              conversationId={activeConversation}
              onBack={handleBack}
            />
          )}

          {viewState === 'new' && (
            <div className="h-full overflow-y-auto p-4">
              <SupportMessageForm 
                onSubmit={async (subject, content, type) => {
                  if (!user) return;
                  
                  try {
                    const conversationsRef = collection(db, 'conversations');
                    const conversationDoc = await addDoc(conversationsRef, {
                      userId: user.uid,
                      userName: user.displayName,
                      userAvatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
                      subject,
                      type,
                      status: 'open',
                      createdAt: serverTimestamp(),
                      lastMessageAt: serverTimestamp(),
                      lastMessage: content
                    });

                    const messagesRef = collection(db, 'messages');
                    await addDoc(messagesRef, {
                      conversationId: conversationDoc.id,
                      content,
                      senderId: user.uid,
                      senderName: user.displayName,
                      senderAvatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
                      createdAt: serverTimestamp()
                    });

                    setActiveConversation(conversationDoc.id);
                    setViewState('conversation');
                  } catch (error) {
                    console.error('Error creating conversation:', error);
                  }
                }}
                onCancel={handleBack}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};