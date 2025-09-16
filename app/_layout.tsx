import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';
import { AccessibilityService } from '../utils/accessibility';
import { router } from 'expo-router';

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated, hasSkippedAuth, isLoading } = useAuth();

  useEffect(() => {
    // Initialize accessibility settings
    AccessibilityService.initialize();
  }, []);

  // Handle navigation when authentication state changes
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !hasSkippedAuth) {
        // User is not authenticated and hasn't skipped - show onboarding
        router.replace('/(onboarding)/intro');
      } else if (!isAuthenticated && hasSkippedAuth) {
        // User has skipped auth - show main app
        router.replace('/(tabs)');
      } else if (isAuthenticated) {
        // User is authenticated - show main app
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, hasSkippedAuth, isLoading]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1652F0" />
      </View>
    );
  }

  // Determine which flow to show
  const shouldShowOnboarding = !isAuthenticated && !hasSkippedAuth;
  const shouldShowAuth = false; // We'll handle auth within onboarding if needed

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {shouldShowOnboarding ? (
          <Stack.Screen name="(onboarding)" />
        ) : !isAuthenticated && hasSkippedAuth ? (
          <Stack.Screen name="(tabs)" />
        ) : isAuthenticated ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});