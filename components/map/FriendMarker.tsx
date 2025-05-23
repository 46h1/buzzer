import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { UserProfile } from '../../services/users';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../utils/constants';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

interface FriendMarkerProps {
  user: UserProfile & { distance?: number };
  onBuzzPress?: (userId: string) => void;
  onChatPress?: (userId: string) => void;
  isFriend?: boolean;
}

export const FriendMarker: React.FC<FriendMarkerProps> = ({
  user,
  onBuzzPress,
  onChatPress,
  isFriend = false,
}) => {
  const [isCalloutVisible, setIsCalloutVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handleMarkerPress = () => {
    setIsCalloutVisible(true);
    
    // Pulse animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handleBuzzPress = () => {
    if (onBuzzPress) {
      onBuzzPress(user.uid);
    }
  };
  
  const handleChatPress = () => {
    if (onChatPress) {
      onChatPress(user.uid);
    }
  };
  
  // Format distance string
  const formatDistance = (meters?: number): string => {
    if (!meters) return 'Unknown distance';
    
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    } else {
      return `${(meters / 1000).toFixed(1)}km away`;
    }
  };
  
  if (!user.lastKnownLocation) {
    return null;
  }
  
  return (
    <Marker
      coordinate={{
        latitude: user.lastKnownLocation.latitude,
        longitude: user.lastKnownLocation.longitude,
      }}
      onPress={handleMarkerPress}
    >
      <Animated.View
        style={[
          styles.markerContainer,
          { transform: [{ scale: scaleAnim }] },
          isFriend ? styles.friendMarker : {},
        ]}
      >
        <Avatar uri={user.profilePictureUrl} name={user.displayName} size={40} />
      </Animated.View>
      
      <Callout tooltip onClose={() => setIsCalloutVisible(false)}>
        <View style={styles.calloutContainer}>
          <View style={styles.calloutContent}>
            <Avatar
              uri={user.profilePictureUrl}
              name={user.displayName}
              size={56}
            />
            <Text style={styles.calloutName}>{user.displayName}</Text>
            <Text style={styles.calloutDistance}>
              {formatDistance(user.distance)}
            </Text>
            
            <View style={styles.calloutActions}>
              {!isFriend ? (
                <Button
                  title="Buzz"
                  onPress={handleBuzzPress}
                  variant="primary"
                  size="small"
                  style={styles.calloutButton}
                />
              ) : (
                <Button
                  title="Chat"
                  onPress={handleChatPress}
                  variant="primary"
                  size="small"
                  style={styles.calloutButton}
                />
              )}
            </View>
          </View>
          <View style={styles.calloutArrow} />
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    }),
  },
  friendMarker: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary,
  },
  calloutContainer: {
    width: 200,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  calloutContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    }),
  },
  calloutName: {
    fontWeight: '600',
    fontSize: FONT_SIZE.lg,
    marginTop: SPACING.sm,
    color: COLORS.gray800,
  },
  calloutDistance: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  calloutActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    justifyContent: 'center',
  },
  calloutButton: {
    marginHorizontal: SPACING.xs,
  },
  calloutArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.white,
    alignSelf: 'center',
  },
});