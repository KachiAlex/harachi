import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Ensure user profile exists
          const userRef = doc(db, 'users', firebaseUser.uid);
          let profileSnap = await getDoc(userRef);

          if (!profileSnap.exists()) {
            await setDoc(userRef, {
              email: firebaseUser.email,
              firstName: '',
              lastName: '',
              companyId: null,
              roles: ['Super Admin'],
              isActive: true,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            });
            profileSnap = await getDoc(userRef);
          } else {
            await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
          }

          const profile: any = profileSnap.data();

          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            firstName: profile?.firstName || '',
            lastName: profile?.lastName || '',
            company: { id: profile?.companyId ?? '', name: '', code: '', isActive: true },
            roles: (profile?.roles || []).map((name: string) => ({ id: name, name, permissions: [], isActive: true })),
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
