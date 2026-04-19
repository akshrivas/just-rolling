import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDBoqgMWH3a4ANC-XLt1iUsbpVIVG-U6Eo',
  authDomain: 'just-rolliing.firebaseapp.com',
  projectId: 'just-rolliing',
  storageBucket: 'just-rolliing.firebasestorage.app',
  messagingSenderId: '291022624815',
  appId: '1:291022624815:web:49a14d7c1bce500fa8ceda',
};

// Prevent re-initialization (VERY IMPORTANT in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export const auth = getAuth(app);
