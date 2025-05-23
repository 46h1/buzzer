import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { InputField } from '../../components/common/InputField';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile, uploadProfilePicture } from '../../services/users';
import { COLORS, SPACING, FONT_SIZE } from '../../utils/constants';

export default function EditProfileScreen() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [profilePicture, setProfilePicture] = useState<string | null>(
    userProfile?.profilePictureUrl || null
  );
  const [tempProfilePicture, setTempProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSave = async () => {
    if (!user) return;
    
    if (!displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }
    
    try {
      setLoading(true);
      
      // Upload new profile picture if selected
      let pictureUrl = userProfile?.profilePictureUrl || null;
      
      if (tempProfilePicture) {
        pictureUrl = await uploadProfilePicture(user.uid, tempProfilePicture);
      }
      
      // Update user profile
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        profilePictureUrl: pictureUrl || '',
      });
      
      await refreshUserProfile();
      
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to change your profile picture.'
      );
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setTempProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };
  
  if (!userProfile) {
    return <LoadingIndicator message="Loading profile..." fullScreen />;
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Avatar
            uri={tempProfilePicture || profilePicture}
            name={displayName}
            size={120}
          />
          
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={handleSelectImage}
          >
            <Camera size={20} color={COLORS.white} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.form}>
          <InputField
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            leftIcon={<User size={20} color={COLORS.gray400} />}
            error={error}
          />
          
          <View style={styles.buttonContainer}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              fullWidth
            />
            
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
              style={styles.cancelButton}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
      
      {loading && <LoadingIndicator fullScreen />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    borderRadius: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  changePhotoText: {
    color: COLORS.white,
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: SPACING.xl,
  },
  cancelButton: {
    marginTop: SPACING.md,
  },
});