import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';
import { AccessibilityService } from '../utils/accessibility';
import { router } from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated, hasSkippedAuth, isLoading: isAuthLoading } = useAuth();
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const isAppReady = !isAuthLoading && fontsLoaded;

  useEffect(() => {
    // Initialize accessibility settings
    AccessibilityService.initialize();
  }, []);

  // Handle navigation when authentication state changes
  useEffect(() => {
    if (isAppReady) {
      // Hide splash screen once auth state is determined
      SplashScreen.hideAsync();
      
      if (!isAuthenticated && !hasSkippedAuth) {
        // User is not authenticated and hasn't skipped - show onboarding
        router.replace('/(onboarding)/intro');
      } else {
        // User has skipped auth OR is authenticated - show main app
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, hasSkippedAuth, isAppReady]);

  // Show loading screen while checking auth state
  if (!isAppReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1652F0" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="debt-detail" />
        <Stack.Screen name="person-detail" />
        <Stack.Screen name="settings" />
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