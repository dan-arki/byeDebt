import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { HapticService } from '../../services/hapticService';

const { width, height } = Dimensions.get('window');

export default function IntroScreen() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleGetStarted = () => {
    HapticService.light();
    router.push('/(onboarding)/intent');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Section */}
        <Animated.View style={styles.heroSection} entering={FadeIn.duration(600)}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>💸</Text>
          </View>
          
          <Animated.Text style={styles.headline} entering={SlideInUp.delay(200).duration(500)}>
            Never forget a debt again.
          </Animated.Text>
          
          <Animated.Text style={styles.subtitle} entering={SlideInUp.delay(400).duration(500)}>
            Track debts effortlessly, stay organized, and maintain great relationships.
          </Animated.Text>
          
          {/* Feature highlights */}
          <Animated.View style={styles.featuresPreview} entering={FadeIn.delay(600).duration(500)}>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>📱</Text>
              <Text style={styles.featureText}>Smart tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🔔</Text>
              <Text style={styles.featureText}>Automatic reminders</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>📊</Text>
              <Text style={styles.featureText}>Clear analytics</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Illustration Placeholder */}
        <Animated.View style={styles.illustrationContainer} entering={FadeIn.delay(600).duration(500)}>
          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.illustrationEmoji}>💰</Text>
            <Text style={styles.illustrationText}>Take control of your finances</Text>
          </View>
        </Animated.View>

        {/* CTA Button */}
        <Animated.View style={styles.ctaContainer} entering={SlideInUp.delay(800).duration(500)}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: height * 0.1,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 36,
  },
  headline: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  illustrationPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  illustrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  illustrationText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    textAlign: 'center',
  },
  featuresPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  ctaContainer: {
    paddingBottom: 40,
  },
  ctaButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});