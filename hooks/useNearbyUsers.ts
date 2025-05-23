import { useState, useEffect } from 'react';
import { getNearbyUsers, UserProfile } from '../services/users';
import { useAuth } from './useAuth';
import { useLocation } from './useLocation';
import { RadiusOptions } from '../services/location';

export function useNearbyUsers() {
  const { user } = useAuth();
  const { location, selectedRadius } = useLocation();
  const [nearbyUsers, setNearbyUsers] = useState<(UserProfile & { distance?: number })[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch nearby users when location or radius changes
  useEffect(() => {
    if (!user || !location) {
      return;
    }
    
    const fetchNearbyUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const users = await getNearbyUsers(
          user.uid,
          location.latitude,
          location.longitude,
          selectedRadius
        );
        
        setNearbyUsers(users);
      } catch (err) {
        console.error('Error fetching nearby users:', err);
        setError('Failed to fetch nearby users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNearbyUsers();
  }, [user, location, selectedRadius]);
  
  // Function to manually refresh nearby users
  const refreshNearbyUsers = async () => {
    if (!user || !location) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const users = await getNearbyUsers(
        user.uid,
        location.latitude,
        location.longitude,
        selectedRadius
      );
      
      setNearbyUsers(users);
      return users;
    } catch (err) {
      console.error('Error refreshing nearby users:', err);
      setError('Failed to refresh nearby users');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  return {
    nearbyUsers,
    loading,
    error,
    refreshNearbyUsers,
  };
}