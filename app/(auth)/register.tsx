import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import AnimatedButton from '../../components/AnimatedButton';
import { HapticService, HapticType } from '../../services/hapticService';

export default function RegisterScreen() {
  const { register, skipAuth } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      return 'Please fill in all required fields';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    return null;
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      HapticService.error();
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      setIsLoading(true);
      await register(email, password, name);
      HapticService.success();
    } catch (error) {
      HapticService.error();
      Alert.alert('Registration Failed', (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAuth = async () => {
    try {
      HapticService.light();
      await skipAuth();
    } catch (error) {
      console.error('Skip auth error:', error);
    }
  };

  const handleLoginPress = () => {
    HapticService.light();
    router.replace('/(auth)/login');
  };

  const isFormValid = email && password && confirmPassword && password === confirmPassword;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Back Button */}
          <Animated.View style={styles.backContainer} entering={FadeIn.duration(300)}>
            <TouchableOpacity style={styles.backButton} onPress={handleLoginPress}>
              <ArrowLeft size={24} color="#050F19" strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>

          {/* Header */}
          <Animated.View style={styles.header} entering={FadeIn.delay(100).duration(600)}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Join thousands managing their finances with confidence</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={styles.form} entering={SlideInUp.delay(200).duration(500)}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name (optional)</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#5B616E" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholderTextColor="#C1C8CD"
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email *</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#5B616E" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#C1C8CD"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password *</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#5B616E" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#C1C8CD"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => {
                    HapticService.light();
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#5B616E" strokeWidth={2} />
                  ) : (
                    <Eye size={20} color="#5B616E" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password *</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#5B616E" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#C1C8CD"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => {
                    HapticService.light();
                    setShowConfirmPassword(!showConfirmPassword);
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#5B616E" strokeWidth={2} />
                  ) : (
                    <Eye size={20} color="#5B616E" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <AnimatedButton
              title={isLoading ? 'Creating account...' : 'Create account'}
              style={[styles.registerButton, (!isFormValid || isLoading) && styles.disabledButton]}
              onPress={handleRegister}
              disabled={!isFormValid || isLoading}
              hapticType={HapticType.MEDIUM}
            >
              <View style={styles.buttonContent}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>Create account</Text>
                    <ArrowRight size={20} color="#FFFFFF" strokeWidth={2} />
                  </>
                )}
              </View>
            </AnimatedButton>

            {/* Login Link */}
            <TouchableOpacity style={styles.loginLink} onPress={handleLoginPress}>
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLinkText}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Skip Authentication */}
          <Animated.View style={styles.skipSection} entering={FadeIn.delay(400).duration(500)}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipAuth}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
              <Text style={styles.skipSubtext}>You can create an account anytime</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backContainer: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#050F19',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#050F19',
  },
  eyeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#1652F0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  disabledButton: {
    backgroundColor: '#C1C8CD',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loginText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  loginLinkText: {
    fontFamily: 'Inter-SemiBold',
    color: '#1652F0',
  },
  skipSection: {
    paddingBottom: 48,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  skipButton: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 4,
  },
  skipSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
});