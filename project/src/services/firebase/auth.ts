import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { createUser } from './users';

export const signUp = async (email: string, password: string, name: string) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await createUser({
    name,
    email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
    bio: '',
  });
  return user;
};

export const signIn = async (email: string, password: string) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};

export const signOut = () => firebaseSignOut(auth);

export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};