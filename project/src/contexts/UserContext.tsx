import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { User } from '../types';

interface UserContextType {
  user: User | null;
  users: User[];
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const userData = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();
          
          const userInfo = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: userData?.displayName || firebaseUser.displayName,
            photoURL: userData?.photoURL || firebaseUser.photoURL,
            bio: userData?.bio || '',
            phone: userData?.phone || '',
            location: userData?.location || '',
            following: userData?.following || [],
            followers: userData?.followers || [],
          };
          
          setUser(userInfo);
          localStorage.setItem('user', JSON.stringify(userInfo));
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;

      await updateFirebaseProfile(firebaseUser, {
        displayName: name,
      });

      const userInfo = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: name,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
        bio: '',
        phone: '',
        location: '',
        following: [],
        followers: [],
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userInfo);
      setUser(userInfo);
      setUsers(prev => [...prev, userInfo]);
      localStorage.setItem('user', JSON.stringify(userInfo));

    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();
      
      const userInfo = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: userData?.displayName || firebaseUser.displayName,
        photoURL: userData?.photoURL || firebaseUser.photoURL,
        bio: userData?.bio || '',
        phone: userData?.phone || '',
        location: userData?.location || '',
        following: userData?.following || [],
        followers: userData?.followers || [],
      };
      
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user?.uid) throw new Error('No authenticated user');

    try {
      const userRef = doc(db, 'users', user.uid);
      
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      if (auth.currentUser && (updates.displayName || updates.photoURL)) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: updates.displayName || undefined,
          photoURL: updates.photoURL || undefined,
        });
      }

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      setUsers(prev => prev.map(u => u.uid === user.uid ? updatedUser : u));
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const followUser = async (targetUserId: string) => {
    if (!user?.uid) throw new Error('Must be logged in to follow users');

    try {
      const userRef = doc(db, 'users', user.uid);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Update current user's following list
      await updateDoc(userRef, {
        following: arrayUnion(targetUserId)
      });

      // Update target user's followers list
      await updateDoc(targetUserRef, {
        followers: arrayUnion(user.uid)
      });

      // Update local state
      const updatedUser = {
        ...user,
        following: [...(user.following || []), targetUserId]
      };
      setUser(updatedUser);
      setUsers(prev => prev.map(u => {
        if (u.uid === user.uid) {
          return updatedUser;
        }
        if (u.uid === targetUserId) {
          return {
            ...u,
            followers: [...(u.followers || []), user.uid]
          };
        }
        return u;
      }));
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user?.uid) throw new Error('Must be logged in to unfollow users');

    try {
      const userRef = doc(db, 'users', user.uid);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Update current user's following list
      await updateDoc(userRef, {
        following: arrayRemove(targetUserId)
      });

      // Update target user's followers list
      await updateDoc(targetUserRef, {
        followers: arrayRemove(user.uid)
      });

      // Update local state
      const updatedUser = {
        ...user,
        following: (user.following || []).filter(id => id !== targetUserId)
      };
      setUser(updatedUser);
      setUsers(prev => prev.map(u => {
        if (u.uid === user.uid) {
          return updatedUser;
        }
        if (u.uid === targetUserId) {
          return {
            ...u,
            followers: (u.followers || []).filter(id => id !== user.uid)
          };
        }
        return u;
      }));
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      users, 
      loading, 
      signUp, 
      signIn, 
      signOut, 
      updateProfile,
      followUser,
      unfollowUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};