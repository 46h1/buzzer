import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function AuthLayout() {
  const { user, initialized } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (initialized && user) {
      // User is logged in, redirect to main app
      router.replace('/(tabs)');
    }
  }, [user, initialized, router]);
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}