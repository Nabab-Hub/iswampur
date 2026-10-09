'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PermissionKey, UserRole } from '@/types';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase/client';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User } from 'firebase/auth';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  permissions: PermissionKey[];
  eventScope?: string[];
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  simulateSignIn: (email: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: PermissionKey) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync role and permissions with server session endpoint
  const syncUserWithServer = async (email: string, uid: string, displayName: string, photoURL?: string) => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, uid, displayName, photoURL }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          uid,
          email,
          displayName: displayName || email.split('@')[0],
          photoURL,
          role: data.role || 'team_user',
          permissions: data.permissions || [],
          eventScope: data.eventScope || [],
        });
      } else {
        setUser({
          uid,
          email,
          displayName: displayName || email.split('@')[0],
          photoURL,
          role: 'team_user',
          permissions: [],
        });
      }
    } catch {
      setUser({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        photoURL,
        role: 'team_user',
        permissions: [],
      });
    }
  };

  useEffect(() => {
    // Check local storage for simulation or session persistence
    const savedSimulatedUser = localStorage.getItem('iswampur_sim_user');
    if (savedSimulatedUser) {
      try {
        const parsed = JSON.parse(savedSimulatedUser);
        syncUserWithServer(parsed.email, parsed.uid, parsed.displayName, parsed.photoURL).finally(() => {
          setLoading(false);
        });
        return;
      } catch {
        localStorage.removeItem('iswampur_sim_user');
      }
    }

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: User | null) => {
        if (fbUser && fbUser.email) {
          await syncUserWithServer(
            fbUser.email,
            fbUser.uid,
            fbUser.displayName || '',
            fbUser.photoURL || undefined
          );
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user.email) {
          await syncUserWithServer(
            result.user.email,
            result.user.uid,
            result.user.displayName || '',
            result.user.photoURL || undefined
          );
        }
      } catch (err) {
        console.error('Google Sign-in failed:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      // In demo/offline mode, open quick prompt or use default team owner account
      const promptEmail = window.prompt(
        'Firebase keys not set in .env.local yet. Enter Google email to test (e.g. skahidulla568@gmail.com for Super Admin, jonsknabab@gmail.com for Admin, or your email):',
        'skahidulla568@gmail.com'
      );
      if (promptEmail) {
        await simulateSignIn(promptEmail);
      } else {
        setLoading(false);
      }
    }
  };

  const simulateSignIn = async (email: string, name?: string) => {
    setLoading(true);
    const uid = `sim_${Math.random().toString(36).substring(2, 10)}`;
    const displayName = name || email.split('@')[0];
    localStorage.setItem(
      'iswampur_sim_user',
      JSON.stringify({ email, uid, displayName })
    );
    await syncUserWithServer(email, uid, displayName);
    setLoading(false);
  };

  const signOut = async () => {
    localStorage.removeItem('iswampur_sim_user');
    if (isFirebaseConfigured && auth) {
      try {
        await fbSignOut(auth);
      } catch {
        // Ignore
      }
    }
    setUser(null);
  };

  const hasPermission = (permission: PermissionKey): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.permissions?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        simulateSignIn,
        signOut,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
