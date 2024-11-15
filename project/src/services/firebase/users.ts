import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../lib/firebase';
import type { User } from '../../contexts/UserContext';

const USERS_COLLECTION = 'users';

export const createUser = async (user: Omit<User, 'id' | 'followers' | 'following'>) => {
  const userRef = doc(db, USERS_COLLECTION, auth.currentUser!.uid);
  await setDoc(userRef, {
    ...user,
    followers: [],
    following: [],
    createdAt: serverTimestamp(),
  });
};

export const getUser = async (userId: string) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as User;
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const followUser = async (userId: string, targetUserId: string) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const targetUserRef = doc(db, USERS_COLLECTION, targetUserId);

  await updateDoc(userRef, {
    following: arrayUnion(targetUserId)
  });

  await updateDoc(targetUserRef, {
    followers: arrayUnion(userId)
  });
};

export const unfollowUser = async (userId: string, targetUserId: string) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const targetUserRef = doc(db, USERS_COLLECTION, targetUserId);

  await updateDoc(userRef, {
    following: arrayRemove(targetUserId)
  });

  await updateDoc(targetUserRef, {
    followers: arrayRemove(userId)
  });
};

export const uploadUserAvatar = async (file: File) => {
  const storageRef = ref(storage, `avatars/${auth.currentUser!.uid}/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};