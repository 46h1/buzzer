import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { LocationData, RadiusOptions, updateUserLocation } from '../services/location';
import { useAuth } from './useAuth';

interface LocationState {
  location: LocationData | null;
  errorMsg: string | null;
  permissionStatus: Location.PermissionStatus | null;
  loading: boolean;
}

export function useLocation(autoUpdate = true, interval = 60000) {
  const { user } = useAuth();
  const [state, setState] = useState<LocationState>({
    location: null,
    errorMsg: null,
    permissionStatus: null,
    loading: true,
  });
  const [selectedRadius, setSelectedRadius] = useState<RadiusOptions>(
    RadiusOptions.MEDIUM
  );
  
  // Use a ref to track the interval
  const locationInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Request permission and get initial location
  useEffect(() => {
    let mounted = true;
    
    const getPermissionAndLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          if (mounted) {
            setState({
              location: null,
              errorMsg: 'Permission to access location was denied',
              permissionStatus: status,
              loading: false,
            });
          }
          return;
        }
        
        if (mounted) {
          setState((prev) => ({
            ...prev,
            permissionStatus: status,
            loading: true,
          }));
        }
        
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
        };
        
        if (mounted) {
          setState({
            location: locationData,
            errorMsg: null,
            permissionStatus: status,
            loading: false,
          });
        }
        
        // Update user location in Firestore if user is authenticated
        if (user) {
          try {
            await updateUserLocation(user.uid, locationData);
          } catch (error) {
            console.error('Error updating user location:', error);
          }
        }
      } catch (error) {
        console.error('Error getting location:', error);
        if (mounted) {
          setState((prev) => ({
            ...prev,
            errorMsg: 'Error getting location',
            loading: false,
          }));
        }
      }
    };
    
    getPermissionAndLocation();
    
    return () => {
      mounted = false;
    };
  }, [user]);
  
  // Set up periodic location updates
  useEffect(() => {
    // Clear any existing interval
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }
    
    // If not authenticated or autoUpdate is false, don't set up updates
    if (!user || !autoUpdate || state.permissionStatus !== 'granted') {
      return;
    }
    
    // Set up new interval
    locationInterval.current = setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
        };
        
        setState((prev) => ({
          ...prev,
          location: locationData,
          errorMsg: null,
        }));
        
        // Update user location in Firestore
        if (user) {
          try {
            await updateUserLocation(user.uid, locationData);
          } catch (error) {
            console.error('Error updating user location:', error);
          }
        }
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }, interval);
    
    // Clean up on unmount
    return () => {
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, [user, autoUpdate, interval, state.permissionStatus]);
  
  // Function to manually update location
  const updateLocation = async () => {
    if (state.permissionStatus !== 'granted') {
      return;
    }
    
    try {
      setState((prev) => ({ ...prev, loading: true }));
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };
      
      setState((prev) => ({
        ...prev,
        location: locationData,
        errorMsg: null,
        loading: false,
      }));
      
      // Update user location in Firestore if user is authenticated
      if (user) {
        try {
          await updateUserLocation(user.uid, locationData);
        } catch (error) {
          console.error('Error updating user location:', error);
        }
      }
      
      return locationData;
    } catch (error) {
      console.error('Error manually updating location:', error);
      setState((prev) => ({
        ...prev,
        errorMsg: 'Error getting location',
        loading: false,
      }));
      return null;
    }
  };
  
  return {
    location: state.location,
    errorMsg: state.errorMsg,
    permissionStatus: state.permissionStatus,
    loading: state.loading,
    updateLocation,
    selectedRadius,
    setSelectedRadius,
  };
}