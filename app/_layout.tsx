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
  console.log('🚀 RootLayout: Component initialized');
  
  useFrameworkReady();
  console.log('⚡ RootLayout: Framework ready hook called');
  
  const { isAuthenticated, hasSkippedAuth, isLoading: isAuthLoading } = useAuth();
  console.log('🔐 RootLayout: Auth state -', { 
    isAuthenticated, 
    hasSkippedAuth, 
    isAuthLoading 
  });
  
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });
  console.log('🔤 RootLayout: Fonts loaded -', fontsLoaded);

  const isAppReady = !isAuthLoading && fontsLoaded;
  console.log('✅ RootLayout: App ready state -', { 
    isAppReady, 
    isAuthLoading, 
    fontsLoaded 
  });

  useEffect(() => {
    console.log('🎯 RootLayout: Accessibility initialization started');
    // Initialize accessibility settings
    AccessibilityService.initialize();
    console.log('♿ RootLayout: Accessibility initialized');
  }, []);

  // Fallback navigation after 3 seconds if app is not ready
  useEffect(() => {
    console.log('⏰ RootLayout: Setting up fallback timer');
    
    const fallbackTimer = setTimeout(() => {
      if (!isAppReady) {
        console.log('🚨 RootLayout: FALLBACK TRIGGERED - App not ready after 3 seconds');
        console.log('🔧 RootLayout: Force hiding splash screen and navigating to onboarding');
        
        // Force hide splash screen
        SplashScreen.hideAsync().catch(error => {
          console.error('❌ RootLayout: Error hiding splash screen:', error);
        });
        
        // Force navigate to onboarding
        router.replace('/(onboarding)/intro');
        console.log('🎯 RootLayout: Forced navigation to onboarding completed');
      }
    }, 3000);
    
    // Cleanup timer if component unmounts or app becomes ready
    return () => {
      console.log('🧹 RootLayout: Cleaning up fallback timer');
      clearTimeout(fallbackTimer);
    };
  }, [isAppReady]);

  // Handle navigation when authentication state changes
  useEffect(() => {
    console.log('🧭 RootLayout: Navigation effect triggered -', { 
      isAppReady, 
      isAuthenticated, 
      hasSkippedAuth 
    });
    
    if (isAppReady) {
      console.log('🎉 RootLayout: App is ready! Starting navigation logic');
      
      // Hide splash screen once auth state is determined
      SplashScreen.hideAsync()
        .then(() => {
          console.log('👋 RootLayout: Splash screen hidden successfully');
        })
        .catch(error => {
          console.error('❌ RootLayout: Error hiding splash screen:', error);
        });
      
      if (!isAuthenticated && !hasSkippedAuth) {
        console.log('🆕 RootLayout: User not authenticated and hasn\'t skipped - navigating to onboarding');
        // User is not authenticated and hasn't skipped - show onboarding
        router.replace('/(onboarding)/intro');
        console.log('✅ RootLayout: Navigation to onboarding completed');
      } else {
        console.log('🏠 RootLayout: User authenticated or skipped - navigating to main app');
        // User has skipped auth OR is authenticated - show main app
        router.replace('/(tabs)');
        console.log('✅ RootLayout: Navigation to tabs completed');
      }
    } else {
      console.log('⏳ RootLayout: App not ready yet, waiting...');
    }
  }, [isAuthenticated, hasSkippedAuth, isAppReady]);

  // Show loading screen while checking auth state
  if (!isAppReady) {
    console.log('🔄 RootLayout: Showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1652F0" />
      </View>
    );
  }

  console.log('🎨 RootLayout: Rendering main app structure');
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