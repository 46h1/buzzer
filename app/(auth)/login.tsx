import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LoginForm } from '../../components/auth/LoginForm';
import { COLORS, SPACING, FONT_SIZE } from '../../utils/constants';

export default function LoginScreen() {
  const router = useRouter();
  
  const handleLoginSuccess = () => {
    router.replace('/(tabs)');
  };
  
  const handleForgotPassword = () => {
    // Password reset email is sent in the form component
    // Could navigate to a dedicated reset password screen in a more complex app
  };
  
  const handleCreateAccount = () => {
    router.push('/(auth)/signup');
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Log in to continue finding friends nearby
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <LoginForm
            onSuccess={handleLoginSuccess}
            onForgotPassword={handleForgotPassword}
            onCreateAccount={handleCreateAccount}
          />
        </View>
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
});