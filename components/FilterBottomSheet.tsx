import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { 
  X, 
  Check,
  Calendar,
  Tag,
  CreditCard,
} from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useCategories } from '../hooks/useCategories';
import AnimatedButton from './AnimatedButton';
import { HapticService, HapticType } from '../services/hapticService';

const { height: screenHeight } = Dimensions.get('window');

export interface DebtFilters {
  type: 'all' | 'owe' | 'owed';
  category: string | null;
  dateRange: 'any' | 'overdue' | 'next7days' | 'next30days';
}

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: DebtFilters) => void;
  initialFilters: DebtFilters;
}

const DATE_RANGE_OPTIONS = [
  { key: 'any', label: 'Any date', icon: Calendar },
  { key: 'overdue', label: 'Overdue', icon: Calendar },
  { key: 'next7days', label: 'Next 7 days', icon: Calendar },
  { key: 'next30days', label: 'Next 30 days', icon: Calendar },
];

const DEBT_TYPE_OPTIONS = [
  { key: 'all', label: 'All debts', icon: CreditCard },
  { key: 'owe', label: 'I owe', icon: CreditCard },
  { key: 'owed', label: 'Owed to me', icon: CreditCard },
];

export default function FilterBottomSheet({ 
  visible, 
  onClose, 
  onApplyFilters, 
  initialFilters 
}: FilterBottomSheetProps) {
  const { categories } = useCategories();
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const [filters, setFilters] = useState<DebtFilters>(initialFilters);

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
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(screenHeight, { duration: 250 });
    }
  }, [visible]);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  if (!fontsLoaded) {
    return null;
  }

  const handleClose = () => {
    HapticService.light();
    onClose();
  };

  const handleApplyFilters = () => {
    HapticService.medium();
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    HapticService.light();
    const clearedFilters: DebtFilters = {
      type: 'all',
      category: null,
      dateRange: 'any',
    };
    setFilters(clearedFilters);
  };

  const handleTypeSelect = (type: 'all' | 'owe' | 'owed') => {
    HapticService.selection();
    setFilters(prev => ({ ...prev, type }));
  };

  const handleCategorySelect = (categoryName: string | null) => {
    HapticService.selection();
    setFilters(prev => ({ ...prev, category: categoryName }));
  };

  const handleDateRangeSelect = (dateRange: 'any' | 'overdue' | 'next7days' | 'next30days') => {
    HapticService.selection();
    setFilters(prev => ({ ...prev, dateRange }));
  };

  const hasActiveFilters = filters.type !== 'all' || filters.category !== null || filters.dateRange !== 'any';

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
        <Animated.View style={styles.handle} entering={FadeIn.delay(200)} />

        {/* Header */}
        <Animated.View style={styles.header} entering={FadeIn.delay(100)}>
          <Text style={styles.headerTitle}>Filter debts</Text>
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
        >
          {/* Debt Type Filter */}
          <Animated.View style={styles.section} entering={FadeIn.delay(200)}>
            <View style={styles.sectionHeader}>
              <CreditCard size={20} color="#5B616E" strokeWidth={2} />
              <Text style={styles.sectionTitle}>Debt type</Text>
            </View>
            <View style={styles.optionsContainer}>
              {DEBT_TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionButton,
                    filters.type === option.key && styles.activeOptionButton
                  ]}
                  onPress={() => handleTypeSelect(option.key as any)}
                >
                  <Text style={[
                    styles.optionText,
                    filters.type === option.key && styles.activeOptionText
                  ]}>
                    {option.label}
                  </Text>
                  {filters.type === option.key && (
                    <Check size={16} color="#FFFFFF" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Category Filter */}
          <Animated.View style={styles.section} entering={FadeIn.delay(300)}>
            <View style={styles.sectionHeader}>
              <Tag size={20} color="#5B616E" strokeWidth={2} />
              <Text style={styles.sectionTitle}>Category</Text>
            </View>
            <View style={styles.categoryGrid}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  filters.category === null && styles.activeCategoryChip
                ]}
                onPress={() => handleCategorySelect(null)}
              >
                <Text style={[
                  styles.categoryText,
                  filters.category === null && styles.activeCategoryText
                ]}>
                  All categories
                </Text>
                {filters.category === null && (
                  <Check size={14} color="#FFFFFF" strokeWidth={2} />
                )}
              </TouchableOpacity>
              
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    filters.category === category.name && styles.activeCategoryChip
                  ]}
                  onPress={() => handleCategorySelect(category.name)}
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text style={[
                    styles.categoryText,
                    filters.category === category.name && styles.activeCategoryText
                  ]}>
                    {category.name}
                  </Text>
                  {filters.category === category.name && (
                    <Check size={14} color="#FFFFFF" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Date Range Filter */}
          <Animated.View style={styles.section} entering={FadeIn.delay(400)}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color="#5B616E" strokeWidth={2} />
              <Text style={styles.sectionTitle}>Due date</Text>
            </View>
            <View style={styles.optionsContainer}>
              {DATE_RANGE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionButton,
                    filters.dateRange === option.key && styles.activeOptionButton
                  ]}
                  onPress={() => handleDateRangeSelect(option.key as any)}
                >
                  <Text style={[
                    styles.optionText,
                    filters.dateRange === option.key && styles.activeOptionText
                  ]}>
                    {option.label}
                  </Text>
                  {filters.dateRange === option.key && (
                    <Check size={16} color="#FFFFFF" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Footer */}
        <Animated.View style={styles.footer} entering={FadeIn.delay(500)}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            <Text style={[
              styles.clearButtonText,
              !hasActiveFilters && styles.disabledButtonText
            ]}>
              Clear filters
            </Text>
          </TouchableOpacity>
          
          <AnimatedButton
            title="Apply filters"
            style={styles.applyButton}
            onPress={handleApplyFilters}
            hapticType={HapticType.MEDIUM}
          />
        </Animated.View>
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
    maxHeight: screenHeight * 0.8,
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
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  activeOptionButton: {
    backgroundColor: '#1652F0',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#5B616E',
  },
  activeOptionText: {
    color: '#FFFFFF',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  activeCategoryChip: {
    backgroundColor: '#1652F0',
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#5B616E',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#5B616E',
  },
  disabledButtonText: {
    color: '#C1C8CD',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#1652F0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
});