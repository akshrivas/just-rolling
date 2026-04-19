// /lib/auth.ts

import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';

export const loginAnonymously = async () => {
  const res = await signInAnonymously(auth);
  return res.user;
};
