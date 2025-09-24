// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
// Uses environment variables when available; falls back to known project values
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyBcHsT4Ka7omMClp9PcxhAF99joccRwHLQ',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'harachi.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'harachi',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'harachi.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '820003029377',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:820003029377:web:1c7eed417216de80f06880',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-0VVM69P31M'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
