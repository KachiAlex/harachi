import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'manager' | 'operator' | 'auditor';
  companyId: string;
  countryId?: string;
  branchId?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication functions
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signUp = async (
  email: string,
  password: string,
  displayName: string,
  role: UserProfile['role'] = 'operator',
  companyId: string
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile
    await updateProfile(user, {
      displayName: displayName
    });

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: displayName,
      role: role,
      companyId: companyId,
      permissions: getDefaultPermissions(role),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    // Send email verification
    await sendEmailVerification(user);

    return userCredential;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Helper function to get default permissions based on role
const getDefaultPermissions = (role: UserProfile['role']): string[] => {
  const permissions: Record<UserProfile['role'], string[]> = {
    admin: [
      'users:read', 'users:write', 'users:delete',
      'companies:read', 'companies:write', 'companies:delete',
      'inventory:read', 'inventory:write', 'inventory:delete',
      'production:read', 'production:write', 'production:delete',
      'procurement:read', 'procurement:write', 'procurement:delete',
      'quality:read', 'quality:write', 'quality:delete',
      'reports:read', 'reports:write',
      'settings:read', 'settings:write'
    ],
    manager: [
      'inventory:read', 'inventory:write',
      'production:read', 'production:write',
      'procurement:read', 'procurement:write',
      'quality:read', 'quality:write',
      'reports:read',
      'users:read'
    ],
    operator: [
      'inventory:read', 'inventory:write',
      'production:read', 'production:write',
      'procurement:read',
      'quality:read', 'quality:write'
    ],
    auditor: [
      'inventory:read',
      'production:read',
      'procurement:read',
      'quality:read',
      'reports:read'
    ]
  };

  return permissions[role] || [];
};

// Permission checking helper
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export const hasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};
