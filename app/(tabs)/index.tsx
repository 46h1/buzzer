import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { RefreshCw, Navigation, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { useNearbyUsers } from '../../hooks/useNearbyUsers';
import { useBuzz } from '../../hooks/useBuzz';
import { useChat } from '../../hooks/useChat';
import { FriendMarker } from '../../components/map/FriendMarker';
import { RadiusSelector } from '../../components/map/RadiusSelector';
import { Button } from '../../components/common/Button';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { BuzzNotification } from '../../components/buzz/BuzzNotification';
import { COLORS, SPACING, MAP_DEFAULTS } from '../../utils/constants';
import { RadiusOptions } from '../../services/location';

export default function MapScreen() {
  const { user, userProfile } = useAuth();
  const { location, errorMsg, permissionStatus, updateLocation, selectedRadius, setSelectedRadius } = useLocation();
  const { nearbyUsers, loading: loadingUsers, refreshNearbyUsers } = useNearbyUsers();
  const { pendingBuzzes, sendBuzzToUser, respondToBuzz } = useBuzz();
  const { startChatWithUser } = useChat();
  const router = useRouter();
  
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(MAP_DEFAULTS.initialRegion);
  
  // Center map on user's location when location changes
  useEffect(() => {
    if (location) {
      const newRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      
      // Animate map to new region
      mapRef.current?.animateToRegion(newRegion, 500);
    }
  }, [location]);
  
  const handleRefresh = async () => {
    const updatedLocation = await updateLocation();
    if (updatedLocation) {
      await refreshNearbyUsers();
    }
  };
  
  const handleRadiusChange = (radius: RadiusOptions) => {
    setSelectedRadius(radius);
  };
  
  const handleBuzzUser = async (userId: string) => {
    if (!user) return;
    
    try {
      const buzzId = await sendBuzzToUser(userId);
      if (buzzId) {
        Alert.alert('Buzz Sent', 'Your buzz was sent successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send buzz. Please try again.');
    }
  };
  
  const handleStartChat = async (userId: string) => {
    if (!user) return;
    
    try {
      const chatId = await startChatWithUser(userId);
      if (chatId) {
        router.push(`/chat/${chatId}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    }
  };
  
  const handleAcceptBuzz = async (buzzId: string) => {
    try {
      const success = await respondToBuzz(buzzId, true);
      
      if (success) {
        const buzz = pendingBuzzes.find(b => b.id === buzzId);
        if (buzz) {
          const chatId = await startChatWithUser(buzz.senderID);
          if (chatId) {
            router.push(`/chat/${chatId}`);
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept buzz. Please try again.');
    }
  };
  
  const handleDeclineBuzz = async (buzzId: string) => {
    try {
      await respondToBuzz(buzzId, false);
    } catch (error) {
      Alert.alert('Error', 'Failed to decline buzz. Please try again.');
    }
  };
  
  const centerOnUserLocation = () => {
    if (location) {
      const userRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      mapRef.current?.animateToRegion(userRegion, 500);
    }
  };
  
  if (!permissionStatus) {
    return <LoadingIndicator message="Loading..." fullScreen />;
  }
  
  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={60} color={COLORS.error} />
        <View style={styles.errorTextContainer}>
          <Text style={styles.errorTitle}>Location Permission Required</Text>
          <Text style={styles.errorMessage}>
            FriendFinder needs access to your location to find friends nearby.
            Please enable location permissions in your device settings.
          </Text>
        </View>
        <Button
          title="Open Settings"
          onPress={() => {
            if (Platform.OS === 'web') {
              Alert.alert(
                'Permission Required',
                'Please allow location access in your browser.'
              );
            } else {
              // On native platforms, would open settings
              // But this functionality is limited in Expo web
              Alert.alert(
                'Permission Required',
                'Please allow location access for this app in your device settings.'
              );
            }
          }}
          style={{ marginTop: SPACING.lg }}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {nearbyUsers.map((user) => (
          <FriendMarker
            key={user.uid}
            user={user}
            onBuzzPress={handleBuzzUser}
            onChatPress={handleStartChat}
          />
        ))}
      </MapView>
      
      <View style={styles.radiusSelectorContainer}>
        <RadiusSelector
          selectedRadius={selectedRadius}
          onSelectRadius={handleRadiusChange}
        />
      </View>
      
      {pendingBuzzes.length > 0 && (
        <View style={styles.notificationsContainer}>
          {pendingBuzzes.map((buzz) => (
            <BuzzNotification
              key={buzz.id}
              buzz={buzz}
              onAccept={handleAcceptBuzz}
              onDecline={handleDeclineBuzz}
            />
          ))}
        </View>
      )}
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={centerOnUserLocation}
        >
          <Navigation size={24} color={COLORS.gray800} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleRefresh}
        >
          <RefreshCw size={24} color={COLORS.gray800} />
        </TouchableOpacity>
      </View>
      
      {loadingUsers && <LoadingIndicator fullScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  radiusSelectorContainer: {
    position: 'absolute',
    top: SPACING.md,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  notificationsContainer: {
    position: 'absolute',
    bottom: 100,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.md,
    zIndex: 1,
  },
  button: {
    backgroundColor: COLORS.white,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  errorTextContainer: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray800,
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 24,
  },
});