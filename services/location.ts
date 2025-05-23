import * as Location from 'expo-location';
import { doc, updateDoc, GeoPoint, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Define available radius options
export enum RadiusOptions {
  SMALL = 100,
  MEDIUM = 1000,
  LARGE = 10000,
}

// Type for location data
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

// Request location permissions
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

// Get current location
export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      console.warn('Location permission not granted');
      return null;
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

// Update user location in Firestore
export const updateUserLocation = async (
  userId: string,
  location: LocationData
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      lastKnownLocation: new GeoPoint(location.latitude, location.longitude),
      locationGeohash: generateGeohash(location.latitude, location.longitude),
      lastLocationUpdateTimestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user location:', error);
    throw error;
  }
};

// Generate a geohash for location-based queries
export const generateGeohash = (latitude: number, longitude: number): string => {
  // This is a simplified geohash implementation
  // In a production app, use a proper geohash library
  const precision = 7;
  
  // Simple encoding function (for illustration - use a proper library in production)
  const encodeGeohash = (lat: number, lng: number, precision: number): string => {
    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let geohash = '';
    let latMin = -90;
    let latMax = 90;
    let lngMin = -180;
    let lngMax = 180;
    let bit = 0;
    let ch = 0;
    
    while (geohash.length < precision) {
      if (bit % 2 === 0) {
        const mid = (lngMin + lngMax) / 2;
        if (lng >= mid) {
          ch = ch * 2 + 1;
          lngMin = mid;
        } else {
          ch = ch * 2;
          lngMax = mid;
        }
      } else {
        const mid = (latMin + latMax) / 2;
        if (lat >= mid) {
          ch = ch * 2 + 1;
          latMin = mid;
        } else {
          ch = ch * 2;
          latMax = mid;
        }
      }
      
      bit++;
      
      if (bit === 5) {
        geohash += base32[ch];
        bit = 0;
        ch = 0;
      }
    }
    
    return geohash;
  };
  
  return encodeGeohash(latitude, longitude, precision);
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
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