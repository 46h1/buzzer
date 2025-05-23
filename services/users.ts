import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  orderBy,
  startAt,
  endAt,
  GeoPoint,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { generateGeohash } from './location';

// User profile interface
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  profilePictureUrl: string;
  isLocationSharingEnabled: boolean;
  lastKnownLocation?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
}

// Convert Firestore document to UserProfile
export const convertToUserProfile = (
  doc: QueryDocumentSnapshot<DocumentData>
): UserProfile => {
  const data = doc.data();
  const lastKnownLocation = data.lastKnownLocation as GeoPoint;
  
  return {
    uid: doc.id,
    displayName: data.displayName || 'Unknown User',
    email: data.email || '',
    profilePictureUrl: data.profilePictureUrl || '',
    isLocationSharingEnabled: data.isLocationSharingEnabled ?? true,
    lastKnownLocation: lastKnownLocation
      ? {
          latitude: lastKnownLocation.latitude,
          longitude: lastKnownLocation.longitude,
        }
      : undefined,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

// Get user by ID
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return convertToUserProfile(userDoc);
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Get nearby users based on geohash and radius
export const getNearbyUsers = async (
  currentUserId: string,
  latitude: number,
  longitude: number,
  radiusInMeters: number
): Promise<UserProfile[]> => {
  try {
    // Generate geohash for current location
    const geohash = generateGeohash(latitude, longitude);
    
    // For simplicity, we'll use a prefix search
    // In a production app, you would calculate precision based on radius
    const prefix = geohash.substring(0, 4);
    
    // Query users with matching geohash prefix
    const usersQuery = query(
      collection(db, 'users'),
      where('locationGeohash', '>=', prefix),
      where('locationGeohash', '<=', prefix + '\uf8ff'),
      where('isLocationSharingEnabled', '==', true)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    const users: UserProfile[] = [];
    
    // Filter users by actual distance and exclude current user
    querySnapshot.forEach((doc) => {
      if (doc.id === currentUserId) return;
      
      const user = convertToUserProfile(doc);
      
      if (user.lastKnownLocation) {
        // Calculate actual distance using Haversine formula
        const distance = calculateDistance(
          latitude,
          longitude,
          user.lastKnownLocation.latitude,
          user.lastKnownLocation.longitude
        );
        
        if (distance <= radiusInMeters) {
          users.push({ ...user, distance });
        }
      }
    });
    
    return users;
  } catch (error) {
    console.error('Error getting nearby users:', error);
    throw error;
  }
};

// Calculate distance using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in meters
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Toggle location sharing (Ghost Mode)
export const toggleLocationSharing = async (
  userId: string,
  isEnabled: boolean
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isLocationSharingEnabled: isEnabled });
  } catch (error) {
    console.error('Error toggling location sharing:', error);
    throw error;
  }
};

// Upload profile picture
export const uploadProfilePicture = async (
  userId: string,
  uri: string
): Promise<string> => {
  try {
    // Create storage reference
    const storageRef = ref(storage, `profile_pictures/${userId}`);
    
    // Fetch the image data
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Upload to Firebase Storage
    await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update user profile with new picture URL
    await updateUserProfile(userId, { profilePictureUrl: downloadURL });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};