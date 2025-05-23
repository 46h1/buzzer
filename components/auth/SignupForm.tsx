import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Mail, Lock, User } from 'lucide-react-native';
import { InputField } from '../common/InputField';
import { Button } from '../common/Button';
import { COLORS, SPACING, FONT_SIZE } from '../../utils/constants';
import { registerWithEmail } from '../../services/auth';

interface SignupFormProps {
  onSuccess: () => void;
  onLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onLogin,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const validate = (): boolean => {
    const newErrors: {
      displayName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (!displayName) {
      newErrors.displayName = 'Name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[a-z])/.test(password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[0-9])/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
      newErrors.password = 'Password must contain at least one special character (!@#$%^&*)';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSignup = async () => {
    if (!validate()) return;
    
    try {
      setLoading(true);
      await registerWithEmail(email, password, displayName);
      onSuccess();
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const getErrorMessage = (error: any): string => {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/weak-password':
        return 'The password is too weak.';
      default:
        return 'An error occurred during registration. Please try again.';
    }
  };
  
  return (
    <View style={styles.container}>
      <InputField
        label="Name"
        placeholder="Enter your name"
        value={displayName}
        onChangeText={setDisplayName}
        leftIcon={<User size={20} color={COLORS.gray400} />}
        error={errors.displayName}
      />
      
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
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        leftIcon={<Lock size={20} color={COLORS.gray400} />}
        error={errors.password}
      />
      
      <InputField
        label="Confirm Password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        leftIcon={<Lock size={20} color={COLORS.gray400} />}
        error={errors.confirmPassword}
      />
      
      <Button
        title="Create Account"
        onPress={handleSignup}
        loading={loading}
        style={styles.button}
        fullWidth
      />
      
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={onLogin}>
          <Text style={styles.loginLink}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    marginTop: SPACING.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  loginText: {
    color: COLORS.gray600,
    fontSize: FONT_SIZE.md,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
});