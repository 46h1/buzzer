import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SignupForm } from '../../components/auth/SignupForm';
import { COLORS, SPACING, FONT_SIZE } from '../../utils/constants';

export default function SignupScreen() {
  const router = useRouter();
  
  const handleSignupSuccess = () => {
    router.replace('/(tabs)');
  };
  
  const handleLogin = () => {
    router.push('/(auth)/login');
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            Sign up to start finding friends nearby
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <SignupForm
            onSuccess={handleSignupSuccess}
            onLogin={handleLogin}
          />
        </View>
        
        <Text style={styles.termsText}>
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
  },
  header: {
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.gray800,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.gray600,
  },
  formContainer: {
    width: '100%',
  },
  termsText: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xl,
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
});