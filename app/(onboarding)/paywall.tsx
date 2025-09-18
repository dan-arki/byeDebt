import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Bell, ChartBar as BarChart3, Award, Download, X, Sparkles } from 'lucide-react-native';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../hooks/useAuth';
import { DebtService } from '../../services/debtService';
import { HapticService } from '../../services/hapticService';

export default function PaywallScreen() {
  const { debt, clearDebt } = useOnboarding();
  const { user, skipAuth } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUnlockLifetimeAccess = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      HapticService.success();
      
      if (!user) {
        // Redirect to registration for account creation
        router.push('/(auth)/register');
        return;
      }
      
      // Simulate payment process for authenticated users
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create the debt if we have the data
      if (debt) {
        const currentUserName = user?.name || 'You';
        await DebtService.createDebt({
          debtorName: debt.type === 'owe' ? currentUserName : debt.personName,
          creditorName: debt.type === 'owed' ? currentUserName : debt.personName,
          amount: parseFloat(debt.amount),
          currency: 'USD',
          dueDate: debt.dueDate,
          category: debt.category,
          description: debt.note || undefined,
        });
      }
      
      clearDebt();
      router.replace('/(tabs)');
      
    } catch (error) {
      HapticService.error();
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartFreeTrial = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      HapticService.success();
      
      if (!user) {
        // Redirect to registration for account creation
        router.push('/(auth)/register');
        return;
      }
      
      // Simulate trial activation for authenticated users
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create the debt if we have the data
      if (debt) {
        const currentUserName = user?.name || 'You';
        await DebtService.createDebt({
          debtorName: debt.type === 'owe' ? currentUserName : debt.personName,
          creditorName: debt.type === 'owed' ? currentUserName : debt.personName,
          amount: parseFloat(debt.amount),
          currency: 'USD',
          dueDate: debt.dueDate,
          category: debt.category,
          description: debt.note || undefined,
        });
      }
      
      clearDebt();
      router.replace('/(tabs)');
      
    } catch (error) {
      HapticService.error();
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipAuth = async () => {
    try {
      HapticService.light();
      await skipAuth();
      clearDebt();
      router.replace('/(tabs)');
    } catch (error) {
      HapticService.error();
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={styles.header} entering={FadeIn.duration(600)}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>💸</Text>
            <Sparkles size={20} color="#4A90E2" strokeWidth={2} style={styles.sparkle} />
          </View>
          
          <Animated.Text style={styles.title} entering={SlideInUp.delay(200).duration(500)}>
            Take control of your debts.
          </Animated.Text>
          
          <Animated.Text style={styles.subtitle} entering={SlideInUp.delay(400).duration(500)}>
            Get smart reminders, track everything you're owed, and sleep peacefully.
          </Animated.Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={styles.featuresContainer} entering={FadeIn.delay(600).duration(500)}>
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: '#A3D5D3' }]}>
              <Bell size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.featureText}>Smart reminders</Text>
          </View>
          
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: '#4A90E2' }]}>
              <BarChart3 size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.featureText}>Dashboard</Text>
          </View>
          
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: '#68B684' }]}>
              <Award size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.featureText}>Trust score</Text>
          </View>
          
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: '#FFB4A2' }]}>
              <Download size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.featureText}>Data export</Text>
          </View>
        </Animated.View>

        {/* Pricing */}
        <Animated.View style={styles.pricingContainer} entering={SlideInUp.delay(800).duration(500)}>
          <View style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>Choose your plan</Text>
            
            <View style={styles.pricingOptions}>
              <View style={styles.pricingOption}>
                <Text style={styles.pricingPrice}>$24.99</Text>
                <Text style={styles.pricingPeriod}>lifetime</Text>
              </View>
              
              <View style={[styles.pricingOption, styles.recommendedOption]}>
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>POPULAR</Text>
                </View>
                <Text style={styles.pricingPrice}>Free</Text>
                <Text style={styles.pricingPeriod}>7-day trial</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* CTA Buttons */}
      <Animated.View style={styles.ctaContainer} entering={SlideInUp.delay(1000).duration(500)}>
        <TouchableOpacity
          style={[styles.primaryButton, isProcessing && styles.disabledButton]}
          onPress={handleUnlockLifetimeAccess}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {isProcessing ? 'Processing...' : 'Unlock Lifetime Access'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.secondaryButton, isProcessing && styles.disabledButton]}
          onPress={handleStartFreeTrial}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Start 7-day Free Trial</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipAuth}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <Text style={styles.skipButtonText}>Continue without account</Text>
        </TouchableOpacity>
      </Animated.View>
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
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
  sparkle: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  title: {
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
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
    gap: 16,
  },
  feature: {
    alignItems: 'center',
    width: '45%',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    textAlign: 'center',
  },
  pricingContainer: {
    marginBottom: 40,
  },
  pricingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  pricingTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  pricingOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  pricingOption: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  recommendedOption: {
    backgroundColor: '#4A90E2',
    transform: [{ scale: 1.05 }],
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#68B684',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  recommendedText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  pricingPrice: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  pricingPeriod: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 12,
  },
  primaryButton: {
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
  disabledButton: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1652F0',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
});