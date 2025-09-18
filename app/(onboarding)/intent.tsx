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
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { HapticService } from '../../services/hapticService';

const { width, height } = Dimensions.get('window');

export default function IntentScreen() {
  const { setDebtType } = useOnboarding();
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleBack = () => {
    HapticService.light();
    router.back();
  };

  const handleIntentSelect = (type: 'owe' | 'owed') => {
    HapticService.medium();
    setDebtType(type);
    router.push('/(onboarding)/capture-debt');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Question Section */}
        <Animated.View style={styles.questionSection} entering={FadeIn.duration(600)}>
          <Animated.Text style={styles.question} entering={SlideInUp.delay(200).duration(500)}>
            Ready to track your first debt?
          </Animated.Text>
          
          <Animated.Text style={styles.subtitle} entering={SlideInUp.delay(400).duration(500)}>
            Let's start with your first entry 💰
          </Animated.Text>
        </Animated.View>

        {/* Illustration */}
        <Animated.View style={styles.illustrationContainer} entering={FadeIn.delay(600).duration(500)}>
          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.illustrationEmoji}>📊</Text>
            <Text style={styles.illustrationText}>Smart debt tracking made simple</Text>
          </View>
        </Animated.View>

        {/* Intent Buttons */}
        <Animated.View style={styles.buttonContainer} entering={SlideInUp.delay(800).duration(500)}>
          <TouchableOpacity
            style={[styles.intentButton, styles.owedButton]}
            onPress={() => handleIntentSelect('owed')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={[styles.iconContainer, { backgroundColor: '#68B684' }]}>
                <TrendingUp size={24} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Someone owes me</Text>
                <Text style={styles.buttonSubtitle}>I'll receive money ✅</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.intentButton, styles.oweButton]}
            onPress={() => handleIntentSelect('owe')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFB4A2' }]}>
                <TrendingDown size={24} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>I owe someone</Text>
                <Text style={styles.buttonSubtitle}>I need to pay back 💸</Text>
              </View>
            </View>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  questionSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  question: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
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
    padding: 32,
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
    fontSize: 48,
    marginBottom: 12,
  },
  illustrationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 40,
    gap: 16,
  },
  intentButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  owedButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#68B684',
  },
  oweButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFB4A2',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});