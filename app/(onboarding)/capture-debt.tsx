import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { ArrowLeft, User, Calendar, FileText } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useOnboarding } from '../../contexts/OnboardingContext';
import CurrencyAmountInput from '../../components/CurrencyAmountInput';
import CategorySelector from '../../components/CategorySelector';
import { HapticService } from '../../services/hapticService';

export default function CaptureDebtScreen() {
  const { debt, setDebtDetails, isComplete } = useOnboarding();
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

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

  const handleCreateDebt = () => {
    if (!personName.trim() || !amount.trim() || parseFloat(amount) <= 0) {
      HapticService.error();
      Alert.alert('Oops !', 'Merci de remplir au moins le nom et le montant.');
      return;
    }

    HapticService.success();
    setDebtDetails({
      personName: personName.trim(),
      amount: amount.trim(),
      dueDate,
      category: category || 'Other',
      note: note.trim(),
    });

    router.push('/(onboarding)/paywall');
  };

  const debtTypeText = debt?.type === 'owed' ? 'me doit' : 'je dois';
  const debtTypeEmoji = debt?.type === 'owed' ? '💰' : '💸';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ma première dette {debtTypeEmoji}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form */}
        <Animated.View style={styles.form} entering={FadeIn.delay(200).duration(500)}>
          {/* Person Name */}
          <Animated.View style={styles.inputSection} entering={SlideInUp.delay(300).duration(400)}>
            <Text style={styles.inputLabel}>Qui {debtTypeText} ?</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#6B7280" strokeWidth={2} />
              <TextInput
                style={styles.textInput}
                placeholder="Nom de la personne"
                value={personName}
                onChangeText={setPersonName}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </Animated.View>

          {/* Amount */}
          <Animated.View style={styles.inputSection} entering={SlideInUp.delay(400).duration(400)}>
            <Text style={styles.inputLabel}>Combien ?</Text>
            <CurrencyAmountInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              showCurrencySelector={false}
            />
          </Animated.View>

          {/* Due Date */}
          <Animated.View style={styles.inputSection} entering={SlideInUp.delay(500).duration(400)}>
            <Text style={styles.inputLabel}>Pour quand ?</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color="#6B7280" strokeWidth={2} />
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={dueDate}
                onChangeText={setDueDate}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </Animated.View>

          {/* Category */}
          <Animated.View style={styles.inputSection} entering={SlideInUp.delay(600).duration(400)}>
            <Text style={styles.inputLabel}>Catégorie</Text>
            <CategorySelector
              selectedCategory={category}
              onSelectCategory={setCategory}
            />
          </Animated.View>

          {/* Note */}
          <Animated.View style={styles.inputSection} entering={SlideInUp.delay(700).duration(400)}>
            <Text style={styles.inputLabel}>Note (optionnel)</Text>
            <View style={[styles.inputContainer, styles.noteContainer]}>
              <FileText size={20} color="#6B7280" strokeWidth={2} />
              <TextInput
                style={[styles.textInput, styles.noteInput]}
                placeholder="Ajouter une note..."
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* CTA Button */}
      <Animated.View style={styles.ctaContainer} entering={SlideInUp.delay(800).duration(500)}>
        <TouchableOpacity
          style={[
            styles.ctaButton,
            (!personName.trim() || !amount.trim() || parseFloat(amount) <= 0) && styles.disabledButton
          ]}
          onPress={handleCreateDebt}
          disabled={!personName.trim() || !amount.trim() || parseFloat(amount) <= 0}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Créer ma première dette</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  form: {
    paddingBottom: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  noteContainer: {
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  noteInput: {
    marginTop: 4,
    minHeight: 60,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
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
  disabledButton: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});