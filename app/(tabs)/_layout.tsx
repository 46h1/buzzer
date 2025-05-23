import { Tabs } from 'expo-router';
import { Map, MessageSquare, User } from 'lucide-react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../utils/constants';

export default function TabLayout() {
  const { user, initialized } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (initialized && !user) {
      // User is not logged in, redirect to auth
      router.replace('/(auth)');
    }
  }, [user, initialized, router]);
  
  if (!initialized || !user) {
    // Still checking auth state or user is not logged in
    return null;
  }
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarStyle: {
          borderTopColor: COLORS.gray200,
        },
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Find',
          headerTitle: 'Find Friends',
          tabBarIcon: ({ color, size }) => (
            <Map size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          headerTitle: 'My Chats',
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}