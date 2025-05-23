import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Edit,
  LogOut,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { logOut } from '../../services/auth';
import { toggleLocationSharing } from '../../services/users';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { Card } from '../../components/common/Card';
import { GhostModeToggle } from '../../components/profile/GhostModeToggle';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { COLORS, SPACING, FONT_SIZE } from '../../utils/constants';

export default function ProfileScreen() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleEditProfile = () => {
    router.push('/profile/edit');
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await logOut();
              router.replace('/(auth)');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };
  
  const handleToggleLocationSharing = async (value: boolean) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await toggleLocationSharing(user.uid, value);
      await refreshUserProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to update location sharing settings.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenPermissions = () => {
    Alert.alert(
      'App Permissions',
      'Please go to your device settings to manage permissions for FriendFinder.',
      [{ text: 'OK' }]
    );
  };
  
  if (!userProfile) {
    return <LoadingIndicator message="Loading profile..." fullScreen />;
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Avatar
            uri={userProfile.profilePictureUrl}
            name={userProfile.displayName}
            size={100}
          />
          
          <TouchableOpacity
            style={styles.editImageButton}
            onPress={handleEditProfile}
          >
            <Edit size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.displayName}>{userProfile.displayName}</Text>
        <Text style={styles.email}>{userProfile.email}</Text>
        
        <Button
          title="Edit Profile"
          variant="outline"
          size="small"
          onPress={handleEditProfile}
          style={styles.editButton}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Location Sharing</Text>
        <GhostModeToggle
          value={!userProfile.isLocationSharingEnabled}
          onValueChange={handleToggleLocationSharing}
          disabled={loading}
        />
        
        <Text style={styles.sectionTitle}>App Settings</Text>
        <Card>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleOpenPermissions}
          >
            <View style={styles.settingIconContainer}>
              <ExternalLink size={20} color={COLORS.gray600} />
            </View>
            <Text style={styles.settingText}>App Permissions</Text>
          </TouchableOpacity>
        </Card>
        
        <Text style={styles.sectionTitle}>About</Text>
        <Card>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <ExternalLink size={20} color={COLORS.gray600} />
            </View>
            <Text style={styles.settingText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <ExternalLink size={20} color={COLORS.gray600} />
            </View>
            <Text style={styles.settingText}>Terms of Service</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <AlertTriangle size={20} color={COLORS.gray600} />
            </View>
            <Text style={styles.settingText}>Report a Problem</Text>
          </TouchableOpacity>
        </Card>
        
        <Button
          title="Logout"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
          fullWidth
          icon={<LogOut size={20} color={COLORS.error} />}
          textStyle={{ color: COLORS.error }}
        />
      </View>
      
      {loading && <LoadingIndicator fullScreen />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray100,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  displayName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
  },
  editButton: {
    paddingHorizontal: SPACING.lg,
  },
  content: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.gray700,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  settingIconContainer: {
    marginRight: SPACING.md,
  },
  settingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray800,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
  },
  logoutButton: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
    borderColor: COLORS.error,
  },
});