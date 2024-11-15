import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy,
  Query,
  DocumentData,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAD_KizCwatRLLdqJFImEhMPMwUEkTR-3g",
  authDomain: "recet-up.firebaseapp.com",
  projectId: "recet-up",
  storageBucket: "recet-up.firebasestorage.app",
  messagingSenderId: "448988440440",
  appId: "1:448988440440:web:3fb31057e5702c8ac40a8d",
  measurementId: "G-6VEW0Y1VE8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with persistence enabled
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const storage = getStorage(app);

export const getConversationsQuery = (type: 'user' | 'admin', userId?: string): Query<DocumentData> => {
  const conversationsRef = collection(db, 'conversations');
  
  if (type === 'admin') {
    // For admin, get all conversations ordered by lastMessageAt
    return query(
      conversationsRef,
      orderBy('lastMessageAt', 'desc')
    );
  } else {
    // For users, get only their conversations
    return query(
      conversationsRef,
      where('userId', '==', userId),
      orderBy('lastMessageAt', 'desc')
    );
  }
};

export const getMessagesQuery = (conversationId: string) => {
  const messagesRef = collection(db, 'messages');
  return query(
    messagesRef,
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );
};

export default app;