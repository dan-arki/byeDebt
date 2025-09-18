import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  SlideInDown,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { 
  X, 
  Calendar, 
  FileText,
  Bell
} from 'lucide-react-native';
import CategorySelector from './CategorySelector';
import CalendarIntegration from './CalendarIntegration';
import NotificationSettings from './NotificationSettings';
import ContactSelector from './ContactSelector';
import CurrencyAmountInput from './CurrencyAmountInput';
import AnimatedButton from './AnimatedButton';
import { Contact } from '../types/contact';
import { useCurrency } from '../hooks/useCurrency';
import { HapticService, HapticType } from '../services/hapticService';
import { useAuth } from '../hooks/useAuth';
import { DebtService } from '../services/debtService';
import { CreateDebtPayload } from '../types/debt';

const { height: screenHeight } = Dimensions.get('window');

interface AddDebtBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onDebtAdded: () => void;
}

export default function AddDebtBottomSheet({ visible, onClose, onDebtAdded }: AddDebtBottomSheetProps) {
  const { user, isAuthenticated } = useAuth();
  const { formatAmount, selectedCurrency } = useCurrency();

  const [debtType, setDebtType] = useState<'owe' | 'owed'>('owe');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState('2025-01-30');
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Animation values
  const translateY = useSharedValue(screenHeight);
  const backdropOpacity = useSharedValue(0);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (visible) {
      // Show bottom sheet
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      // Hide bottom sheet
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(screenHeight, { duration: 250 });
    }
  }, [visible]);

  const handleClose = () => {
    HapticService.light();
    onClose();
  };

  const handleSave = async () => {
    if (!person || !amount) {
      HapticService.error();
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    if (!isAuthenticated) {
      HapticService.error();
      Alert.alert('Authentication Required', 'You must be logged in to save debts. Please log in or create an account.');
      return;
    }

    try {
      setIsCreating(true);
      
      const newDebt: CreateDebtPayload = {
        debtorName: debtType === 'owed' ? person : user?.name || 'You',
        creditorName: debtType === 'owe' ? person : user?.name || 'You',
        amount: parseFloat(amount),
        currency: selectedCurrency.code,
        dueDate: dueDate,
        status: 'pending',
        category: selectedCategory || undefined,
        description: note.trim() || undefined,
      };

      await DebtService.createDebt(newDebt);
      HapticService.success();
      
      // Reset form
      setPerson('');
      setAmount('');
      setSelectedCategory('');
      setNote('');
      setSelectedContact(null);
      
      // Close the bottom sheet and notify parent
      onDebtAdded();
      
      // Show success feedback after closing
      setTimeout(() => {
        Alert.alert('Success', 'Debt added successfully!');
      }, 300);
      
    } catch (error) {
      HapticService.error();
      Alert.alert('Error', (error as Error).message || 'Failed to add debt. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    HapticService.selection();
    setSelectedContact(contact);
    setPerson(contact.name);
  };

  const handlePersonTextChange = (text: string) => {
    setPerson(text);
    if (selectedContact && text !== selectedContact.name) {
      setSelectedContact(null);
    }
  };

  const handleTypeChange = (type: 'owe' | 'owed') => {
    HapticService.selection();
    setDebtType(type);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity 
          style={styles.backdropTouchable}
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, sheetStyle]}>
        {/* Handle */}
        <Animated.View style={styles.handle} entering={FadeIn.delay(200)}>
          <Text> </Text>
        </Animated.View>

        {/* Header */}
        <Animated.View style={styles.header} entering={FadeIn.delay(100)}>
          <Text style={styles.headerTitle}>Add debt</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
          >
            <X size={24} color="#5B616E" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Debt Type */}
          <Animated.View style={styles.section} entering={FadeIn.delay(200)}>
            <Text style={styles.sectionTitle}>Type</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeButton, debtType === 'owe' && styles.activeTypeButton]}
                onPress={() => handleTypeChange('owe')}
              >
                <Text style={[styles.typeText, debtType === 'owe' && styles.activeTypeText]}>
                  I owe
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, debtType === 'owed' && styles.activeTypeButton]}
                onPress={() => handleTypeChange('owed')}
              >
                <Text style={[styles.typeText, debtType === 'owed' && styles.activeTypeText]}>
                  They owe me
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Person */}
          <Animated.View style={styles.section} entering={FadeIn.delay(300)}>
            <Text style={styles.sectionTitle}>Person</Text>
            <ContactSelector
              value={person}
              onContactSelect={handleContactSelect}
              onTextChange={handlePersonTextChange}
              placeholder="Enter person's name"
            />
          </Animated.View>

          {/* Amount */}
          <Animated.View style={styles.section} entering={FadeIn.delay(400)}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <CurrencyAmountInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
            />
          </Animated.View>

          {/* Due Date */}
          <Animated.View style={styles.section} entering={FadeIn.delay(500)}>
            <Text style={styles.sectionTitle}>Due date</Text>
            <TouchableOpacity style={styles.inputContainer}>
              <Calendar size={20} color="#5B616E" strokeWidth={2} />
              <Text style={styles.dateText}>{dueDate}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Category */}
          <Animated.View style={styles.section} entering={FadeIn.delay(600)}>
            <Text style={styles.sectionTitle}>Category</Text>
            <CategorySelector
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </Animated.View>

          {/* Calendar Integration */}
          <Animated.View style={styles.section} entering={FadeIn.delay(700)}>
            <Text style={styles.sectionTitle}>Calendar & Reminders</Text>
            <CalendarIntegration
              debtTitle={`${selectedContact?.name || person} - ${formatAmount(parseFloat(amount) || 0)}`}
              dueDate={new Date(dueDate)}
            />
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => setShowNotificationSettings(true)}
            >
              <Bell size={20} color="#1652F0" strokeWidth={2} />
              <Text style={styles.notificationButtonText}>Notification Settings</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Note */}
          <Animated.View style={styles.section} entering={FadeIn.delay(800)}>
            <Text style={styles.sectionTitle}>Note (optional)</Text>
            <View style={[styles.inputContainer, styles.noteContainer]}>
              <FileText size={20} color="#5B616E" strokeWidth={2} />
              <TextInput
                style={[styles.textInput, styles.noteInput]}
                placeholder="Add a note about this debt"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#C1C8CD"
              />
            </View>
          </Animated.View>

          {/* Save Button */}
          <Animated.View style={styles.footer} entering={FadeIn.delay(900)}>
            <AnimatedButton
              title={isCreating ? "Adding debt..." : "Add debt"}
              style={[styles.saveButton, (!person || !amount || isCreating) && styles.disabledButton]}
              onPress={handleSave}
              disabled={!person || !amount || isCreating}
              hapticType={HapticType.MEDIUM}
            />
          </Animated.View>
        </ScrollView>

        {/* Notification Settings Modal */}
        <NotificationSettings
          visible={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.9,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: '#1652F0',
  },
  typeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#5B616E',
  },
  activeTypeText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#050F19',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#050F19',
  },
  noteContainer: {
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  noteInput: {
    marginTop: 4,
    minHeight: 60,
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    marginTop: 12,
  },
  notificationButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1652F0',
  },
  footer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#1652F0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#C1C8CD',
  },
});