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
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../hooks/useAuth';
import { DebtService } from '../../services/debtService';
import { HapticService } from '../../services/hapticService';

export default function PaywallScreen() {
  const { debt, clearDebt } = useOnboarding();
  const { user, skipAuth } = useAuth();
  const [showAlternativeOffer, setShowAlternativeOffer] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleUnlockByeDebt = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      HapticService.success();
      
      // Simulate subscription process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // If user is not authenticated, skip auth to proceed
      if (!user) {
        await skipAuth();
      }
      
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
      Alert.alert('Erreur', 'Une erreur est survenue. Réessayez.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeepDebts = () => {
    HapticService.light();
    setShowAlternativeOffer(true);
  };

  const handleAlternativeOffer = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      HapticService.success();
      
      // Simulate subscription process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // If user is not authenticated, skip auth to proceed
      if (!user) {
        await skipAuth();
      }
      
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
      setShowAlternativeOffer(false);
      router.replace('/(tabs)');
      
    } catch (error) {
      HapticService.error();
      Alert.alert('Erreur', 'Une erreur est survenue. Réessayez.');
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
            Règle tes dettes pour de bon.
          </Animated.Text>
          
          <Animated.Text style={styles.subtitle} entering={SlideInUp.delay(400).duration(500)}>
            ByeDebt t'aide à rester carré. Reçois des rappels, suis tout ce qu'on te doit, et dors tranquille.
          </Animated.Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={styles.featuresContainer} entering={FadeIn.delay(600).duration(500)}>
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: '#A3D5D3' }]}>
              <Bell size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.featureText}>Rappels intelligents</Text>
          </View>
          
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: '#4A90E2' }]}>
              <BarChart3 size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.featureText}>Tableau de bord</Text>
          </View>
          
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: '#68B684' }]}>
              <Award size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.featureText}>Score de confiance</Text>
          </View>
          
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: '#FFB4A2' }]}>
              <Download size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.featureText}>Export des données</Text>
          </View>
        </Animated.View>

        {/* Pricing */}
        <Animated.View style={styles.pricingContainer} entering={SlideInUp.delay(800).duration(500)}>
          <View style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>Choisis ton plan</Text>
            
            <View style={styles.pricingOptions}>
              <View style={styles.pricingOption}>
                <Text style={styles.pricingPrice}>4,99€</Text>
                <Text style={styles.pricingPeriod}>/ semaine</Text>
              </View>
              
              <View style={[styles.pricingOption, styles.recommendedOption]}>
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>RECOMMANDÉ</Text>
                </View>
                <Text style={styles.pricingPrice}>29,99€</Text>
                <Text style={styles.pricingPeriod}>à vie</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* CTA Buttons */}
      <Animated.View style={styles.ctaContainer} entering={SlideInUp.delay(1000).duration(500)}>
        <TouchableOpacity
          style={[styles.primaryButton, isProcessing && styles.disabledButton]}
          onPress={handleUnlockByeDebt}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {isProcessing ? 'Activation...' : 'Débloquer ByeDebt'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleKeepDebts}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Je préfère garder mes dettes…</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Alternative Offer Modal */}
      <Modal
        visible={showAlternativeOffer}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Offre spéciale ! 🎉</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAlternativeOffer(false)}
            >
              <X size={24} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              OK, test 3 jours gratuits + offre à 19,99€ à vie
            </Text>
            
            <View style={styles.offerCard}>
              <Text style={styles.offerTitle}>✨ Offre limitée</Text>
              <Text style={styles.offerPrice}>19,99€</Text>
              <Text style={styles.offerPeriod}>à vie</Text>
              <Text style={styles.offerSavings}>Économise 10€ !</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.offerButton, isProcessing && styles.disabledButton]}
              onPress={handleAlternativeOffer}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              <Text style={styles.offerButtonText}>
                {isProcessing ? 'Activation...' : 'Commencer l\'essai gratuit'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalSubtitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 40,
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#68B684',
  },
  offerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#68B684',
    marginBottom: 16,
  },
  offerPrice: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  offerPeriod: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  offerSavings: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#68B684',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  offerButton: {
    backgroundColor: '#68B684',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#68B684',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  offerButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});