import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Platform } from 'react-native';

// Types
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  profilePictureUrl: string;
  isLocationSharingEnabled: boolean;
  createdAt: Date;
}

// Create a new user with email and password
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await createUserProfile(userCredential.user, displayName);
    
    return userCredential;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential | null> => {
  if (Platform.OS !== 'web') {
    console.error('Google Sign-In is only available on web platform');
    throw new Error('Google Sign-In is only available on web platform');
  }
  
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Check if user profile exists, if not create it
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      await createUserProfile(
        userCredential.user,
        userCredential.user.displayName || 'User'
      );
    }
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Create user profile in Firestore
export const createUserProfile = async (
  user: User,
  displayName: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    
    await setDoc(userRef, {
      uid: user.uid,
      displayName: displayName,
      email: user.email,
      profilePictureUrl: user.photoURL || '',
      isLocationSharingEnabled: true,
      createdAt: serverTimestamp(),
      lastKnownLocation: null,
      locationGeohash: null,
      lastLocationUpdateTimestamp: null,
      fcmToken: null
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Sign out
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};