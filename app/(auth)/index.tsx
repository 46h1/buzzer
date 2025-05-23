import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { Button } from '../../components/common/Button';
import { COLORS, SPACING, FONT_SIZE } from '../../utils/constants';

export default function WelcomeScreen() {
  const router = useRouter();
  
  const handleLogin = () => {
    router.push('/(auth)/login');
  };
  
  const handleSignUp = () => {
    router.push('/(auth)/signup');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/6457577/pexels-photo-6457577.jpeg' }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>FriendFinder</Text>
          <Text style={styles.subtitle}>
            Connect with friends nearby and make new connections
          </Text>
        </View>
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Create Account"
            onPress={handleSignUp}
            variant="primary"
            style={styles.button}
            fullWidth
          />
          <Button
            title="Login"
            onPress={handleLogin}
            variant="outline"
            style={styles.button}
            fullWidth
          />
        </View>
        
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.black,
    opacity: 0.3,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  button: {
    marginBottom: SPACING.md,
  },
  termsText: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray100,
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
});