import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { UserProfile } from '../services/auth';
import { getUserById } from '../services/users';

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  initialized: boolean;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    initialized: false,
    loading: true,
  });
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user profile from Firestore
          const profile = await getUserById(user.uid);
          
          setAuthState({
            user,
            userProfile: profile,
            initialized: true,
            loading: false,
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setAuthState({
            user,
            userProfile: null,
            initialized: true,
            loading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          userProfile: null,
          initialized: true,
          loading: false,
        });
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  const refreshUserProfile = async () => {
    if (!authState.user) return;
    
    try {
      setAuthState((prev) => ({ ...prev, loading: true }));
      const profile = await getUserById(authState.user!.uid);
      setAuthState((prev) => ({
        ...prev,
        userProfile: profile,
        loading: false,
      }));
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  };
  
  return {
    user: authState.user,
    userProfile: authState.userProfile,
    initialized: authState.initialized,
    loading: authState.loading,
    refreshUserProfile,
  };
}