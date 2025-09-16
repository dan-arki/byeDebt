import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { HapticService } from '../services/hapticService';

interface SignOutButtonProps {
  style?: any;
  textStyle?: any;
  showIcon?: boolean;
  confirmationRequired?: boolean;
}

export default function SignOutButton({ 
  style, 
  textStyle, 
  showIcon = true,
  confirmationRequired = true 
}: SignOutButtonProps) {
  const { logout, isLoading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    const performSignOut = async () => {
      try {
        setIsSigningOut(true);
        HapticService.medium();
        
        await logout();
        
        // Success feedback
        HapticService.success();
        
        // Optional success message
        setTimeout(() => {
          Alert.alert('Success', 'You have been signed out successfully.');
        }, 100);
        
      } catch (error) {
        // Error handling
        HapticService.error();
        Alert.alert(
          'Sign Out Error',
          'There was an issue signing you out. You have been logged out locally for security.',
          [{ text: 'OK', onPress: () => HapticService.light() }]
        );
      } finally {
        setIsSigningOut(false);
      }
    };

    if (confirmationRequired) {
      HapticService.warning();
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out? You will need to sign in again to access your synced data.',
        [
          { 
            text: 'Cancel', 
            style: 'cancel', 
            onPress: () => HapticService.light() 
          },
          { 
            text: 'Sign Out', 
            style: 'destructive', 
            onPress: performSignOut 
          }
        ]
      );
    } else {
      await performSignOut();
    }
  };

  const isDisabled = isSigningOut || isLoading;

  return (
    <TouchableOpacity
      style={[styles.button, style, isDisabled && styles.disabledButton]}
      onPress={handleSignOut}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {isSigningOut ? (
        <ActivityIndicator size="small" color="#FF4747" />
      ) : (
        <>
          {showIcon && (
            <LogOut size={20} color="#FF4747" strokeWidth={2} />
          )}
          <Text style={[styles.buttonText, textStyle]}>
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4747',
  },
});