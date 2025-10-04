import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcHsT4Ka7omMClp9PcxhAF99joccRwHLQ",
  authDomain: "harachi.firebaseapp.com",
  projectId: "harachi",
  storageBucket: "harachi.firebasestorage.app",
  messagingSenderId: "820003029377",
  appId: "1:820003029377:web:1c7eed417216de80f06880",
  measurementId: "G-0VVM69P31M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

export default app;
