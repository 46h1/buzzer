import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Mail, Lock } from 'lucide-react-native';
import { InputField } from '../common/InputField';
import { Button } from '../common/Button';
import { COLORS, SPACING, FONT_SIZE } from '../../utils/constants';
import { signInWithEmail, resetPassword } from '../../services/auth';

interface LoginFormProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onForgotPassword,
  onCreateAccount,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleLogin = async () => {
    if (!validate()) return;
    
    try {
      setLoading(true);
      await signInWithEmail(email, password);
      onSuccess();
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const getErrorMessage = (error: any): string => {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      default:
        return 'An error occurred during login. Please try again.';
    }
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ ...errors, email: 'Please enter your email first' });
      return;
    }
    
    try {
      setLoading(true);
      await resetPassword(email);
      Alert.alert(
        'Password Reset',
        'If an account exists with this email, you will receive a password reset link.'
      );
      onForgotPassword();
    } catch (error) {
      Alert.alert('Error', 'Unable to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <InputField
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={<Mail size={20} color={COLORS.gray400} />}
        error={errors.email}
      />
      
      <InputField
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        leftIcon={<Lock size={20} color={COLORS.gray400} />}
        error={errors.password}
      />
      
      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={handleForgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>
      
      <Button
        title="Login"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
        fullWidth
      />
      
      <View style={styles.createAccountContainer}>
        <Text style={styles.createAccountText}>Don't have an account?</Text>
        <TouchableOpacity onPress={onCreateAccount}>
          <Text style={styles.createAccountLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
  },
  button: {
    marginTop: SPACING.md,
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  createAccountText: {
    color: COLORS.gray600,
    fontSize: FONT_SIZE.md,
  },
  createAccountLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
});