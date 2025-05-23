import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-splash-screen';
import { Platform } from 'react-native';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
  });
  
  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);
  
  // Wait for fonts to load before rendering
  if (!fontsLoaded && !fontError) {
    return null;
  }
  
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="chat/[id]" options={{ 
          headerShown: true,
          headerTitle: 'Chat',
          headerBackTitle: 'Back',
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        }} />
        <Stack.Screen name="profile/edit" options={{ 
          headerShown: true,
          headerTitle: 'Edit Profile',
          headerBackTitle: 'Back',
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}