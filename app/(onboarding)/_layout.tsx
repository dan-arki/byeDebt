import { Stack } from 'expo-router';
import { OnboardingProvider } from '../../contexts/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="intro" />
        <Stack.Screen name="intent" />
        <Stack.Screen name="capture-debt" />
        <Stack.Screen name="paywall" />
      </Stack>
    </OnboardingProvider>
  );
}