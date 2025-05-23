import { useState, useEffect } from 'react';
import {
  sendBuzz,
  updateBuzzStatus,
  getPendingBuzzes,
  subscribeToPendingBuzzes,
  Buzz,
  BuzzStatus,
} from '../services/buzz';
import { useAuth } from './useAuth';

export function useBuzz() {
  const { user } = useAuth();
  const [pendingBuzzes, setPendingBuzzes] = useState<Buzz[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Subscribe to pending buzzes
  useEffect(() => {
    if (!user) {
      setPendingBuzzes([]);
      return;
    }
    
    const unsubscribe = subscribeToPendingBuzzes(user.uid, (buzzes) => {
      setPendingBuzzes(buzzes);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  // Send a buzz to another user
  const sendBuzzToUser = async (receiverId: string) => {
    if (!user) {
      setError('You must be logged in to send a buzz');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const buzzId = await sendBuzz(user.uid, receiverId);
      return buzzId;
    } catch (err) {
      console.error('Error sending buzz:', err);
      setError('Failed to send buzz');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Respond to a buzz (accept or decline)
  const respondToBuzz = async (buzzId: string, accept: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const status = accept ? BuzzStatus.ACCEPTED : BuzzStatus.DECLINED;
      await updateBuzzStatus(buzzId, status);
      
      // Update local state to remove the responded buzz
      setPendingBuzzes((prev) => prev.filter((buzz) => buzz.id !== buzzId));
      
      return true;
    } catch (err) {
      console.error('Error responding to buzz:', err);
      setError('Failed to respond to buzz');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Load pending buzzes
  const loadPendingBuzzes = async () => {
    if (!user) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const buzzes = await getPendingBuzzes(user.uid);
      setPendingBuzzes(buzzes);
    } catch (err) {
      console.error('Error loading pending buzzes:', err);
      setError('Failed to load pending buzzes');
    } finally {
      setLoading(false);
    }
  };
  
  return {
    pendingBuzzes,
    loading,
    error,
    sendBuzzToUser,
    respondToBuzz,
    loadPendingBuzzes,
  };
}