import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { Search, SlidersHorizontal as Filter, ChevronRight } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { router, useLocalSearchParams } from 'expo-router';
import { useCategories } from '../../hooks/useCategories';
import { useCurrency } from '../../hooks/useCurrency';
import { useAddDebt } from './_layout';
import { useDebts } from '../../hooks/useDebts';
import { useAuth } from '../../hooks/useAuth';
import AnimatedListItem from '../../components/AnimatedListItem';
import { HapticService } from '../../services/hapticService';
import { DebtItemSkeleton } from '../../components/LoadingSkeleton';
import FilterBottomSheet, { DebtFilters } from '../../components/FilterBottomSheet';

export default function DebtsScreen() {
  const { categories } = useCategories();
  const { formatAmount } = useCurrency();
  const { showAddDebt } = useAddDebt();
  const { debts, loading, error } = useDebts();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<DebtFilters>({
    type: 'all',
    category: null,
    dateRange: 'any',
  });
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const [activeTab, setActiveTab] = useState<'all' | 'owe' | 'owed'>(
    (params.type as 'all' | 'owe' | 'owed') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Update filters when URL params change
  useEffect(() => {
    if (params.type && ['all', 'owe', 'owed'].includes(params.type as string)) {
      const type = params.type as 'all' | 'owe' | 'owed';
      setActiveTab(type);
      setCurrentFilters(prev => ({ ...prev, type }));
    }
  }, [params.type]);

  if (!fontsLoaded) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCategoryEmoji = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.emoji || '📝';
  };

  const currentUserName = user?.name || 'You';

  const filteredDebts = debts.filter(debt => {
    // Determine debt type relative to current user
    const debtType = debt.debtorName === currentUserName ? 'owe' : 'owed';
    
    // Apply type filter (from both tab and filter sheet)
    const typeFilter = currentFilters.type !== 'all' ? currentFilters.type : activeTab;
    const matchesType = typeFilter === 'all' || debtType === typeFilter;
    
    // Apply category filter
    const matchesCategory = !currentFilters.category || debt.category === currentFilters.category;
    
    // Apply date range filter
    const matchesDateRange = (() => {
      const dueDate = new Date(debt.dueDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const debtDueDateOnly = new Date(debt.dueDate);
      debtDueDateOnly.setHours(0, 0, 0, 0);
      
      switch (currentFilters.dateRange) {
        case 'overdue':
          return debtDueDateOnly < now;
        case 'next7days':
          return debtDueDateOnly >= now && debtDueDateOnly <= next7Days;
        case 'next30days':
          return debtDueDateOnly >= now && debtDueDateOnly <= next30Days;
        case 'any':
        default:
          return true;
      }
    })();
    
    // Apply search filter
    const personName = debtType === 'owe' ? debt.creditorName : debt.debtorName;
    const matchesSearch = personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         debt.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (debt.description && debt.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesType && matchesCategory && matchesDateRange && matchesSearch;
  });

  const isOverdue = (dateString: string) => new Date(dateString) < new Date();

  const handleTabChange = (tab: 'all' | 'owe' | 'owed') => {
    HapticService.selection();
    setActiveTab(tab);
    // Update filters to match tab selection
    setCurrentFilters(prev => ({ ...prev, type: tab }));
  };

  const handleFilterPress = () => {
    HapticService.light();
    setShowFilterSheet(true);
  };

  const handleApplyFilters = (filters: DebtFilters) => {
    setCurrentFilters(filters);
    // Update active tab to match filter type
    setActiveTab(filters.type);
  };

  const handleDebtPress = (debtId: string) => {
    HapticService.light();
    router.push({ pathname: '/debt-detail', params: { id: debtId } });
  };

  const handlePersonPress = (personName: string) => {
    HapticService.light();
    router.push({ pathname: '/person-detail', params: { name: personName } });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View style={styles.header} entering={FadeIn.duration(300)}>
        <Text style={styles.headerTitle}>Debts</Text>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View style={styles.searchContainer} entering={SlideInRight.delay(100).duration(400)}>
        <View style={styles.searchBar}>
          <Search size={20} color="#5B616E" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search debts"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#5B616E"
          />
        </View>
        <TouchableOpacity 
          style={[
            styles.filterButton,
            (currentFilters.category || currentFilters.dateRange !== 'any') && styles.activeFilterButton
          ]}
          onPress={handleFilterPress}
        >
          <Filter size={20} color="#5B616E" strokeWidth={2} />
        </TouchableOpacity>
      </Animated.View>

      {/* Tab Filter */}
      <Animated.View style={styles.tabContainer} entering={FadeIn.delay(200).duration(300)}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => handleTabChange('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All debts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'owe' && styles.activeTab]}
          onPress={() => handleTabChange('owe')}
        >
          <Text style={[styles.tabText, activeTab === 'owe' && styles.activeTabText]}>
            I owe
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'owed' && styles.activeTab]}
          onPress={() => handleTabChange('owed')}
        >
          <Text style={[styles.tabText, activeTab === 'owed' && styles.activeTabText]}>
            Owed to me
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Debt List */}
      <ScrollView style={styles.debtList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <>
            <DebtItemSkeleton />
            <DebtItemSkeleton />
            <DebtItemSkeleton />
            <DebtItemSkeleton />
          </>
        ) : filteredDebts.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No debts found matching your criteria.</Text>
            {debts.length === 0 && (
              <Text style={styles.emptyStateSubText}>Add a new debt to get started!</Text>
            )}
          </View>
        ) : (
          filteredDebts.map((debt, index) => {
            const overdue = isOverdue(debt.dueDate);
            const debtType = debt.debtorName === currentUserName ? 'owe' : 'owed';
            const personName = debtType === 'owe' ? debt.creditorName : debt.debtorName;
            
            return (
              <AnimatedListItem key={debt.id} index={index} delay={75}>
                <TouchableOpacity 
                  style={styles.debtItem}
                  onPress={() => handleDebtPress(debt.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.debtLeft}>
                    <View style={styles.debtAvatar}>
                      <Text style={styles.debtAvatarText}>
                        {personName.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.debtInfo}>
                      <TouchableOpacity onPress={() => handlePersonPress(personName)}>
                        <Text style={[styles.debtPerson, styles.debtPersonLink]}>{personName}</Text>
                      </TouchableOpacity>
                        <View style={styles.debtCategoryContainer}>
                          <Text style={styles.debtCategoryEmoji}>
                            {getCategoryEmoji(debt.category || 'Other')}
                          </Text>
                          <Text style={styles.debtCategory}>{debt.category || 'Other'}</Text>
                        </View>
                      {overdue && (
                        <Text style={styles.overdueLabel}>Overdue</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.debtRight}>
                    <Text style={[
                      styles.debtAmount,
                      debtType === 'owe' ? styles.negativeAmount : styles.positiveAmount
                    ]}>
                      {debtType === 'owe' ? '-' : '+'}{formatAmount(debt.amount)}
                    </Text>
                    <View style={styles.debtMeta}>
                      <Text style={[styles.debtDate, overdue && styles.overdueDate]}>
                        {formatDate(debt.dueDate)}
                      </Text>
                      <ChevronRight size={16} color="#C1C8CD" strokeWidth={2} />
                    </View>
                  </View>
                </TouchableOpacity>
              </AnimatedListItem>
            );
          })
        )}
      </ScrollView>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={currentFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#050F19',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#050F19',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#E8F4FD',
    borderWidth: 1,
    borderColor: '#1652F0',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#E8F4FD',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#5B616E',
  },
  activeTabText: {
    color: '#1652F0',
  },
  debtList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  debtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  debtLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  debtAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  debtAvatarText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1652F0',
  },
  debtInfo: {
    flex: 1,
  },
  debtPerson: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 2,
  },
  debtPersonLink: {
    color: '#1652F0',
  },
  debtCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  debtCategoryEmoji: {
    fontSize: 12,
  },
  debtCategory: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  overdueLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF4747',
    marginTop: 2,
  },
  debtRight: {
    alignItems: 'flex-end',
  },
  debtAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  positiveAmount: {
    color: '#00D632',
  },
  negativeAmount: {
    color: '#FF4747',
  },
  debtMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  debtDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  overdueDate: {
    color: '#FF4747',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    textAlign: 'center',
  },
});