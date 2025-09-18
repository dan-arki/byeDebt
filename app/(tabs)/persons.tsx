import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { Search, SlidersHorizontal as Filter, ChevronRight, TrendingUp, TrendingDown, X } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { router } from 'expo-router';
import { useDebts } from '../../hooks/useDebts';
import { useAuth } from '../../hooks/useAuth';
import { useContacts } from '../../hooks/useContacts';
import { useCurrency } from '../../hooks/useCurrency';
import AnimatedListItem from '../../components/AnimatedListItem';
import { HapticService } from '../../services/hapticService';
import { ContactService } from '../../services/contactService';

interface PersonSummary {
  name: string;
  totalOwedToUser: number;
  totalUserOwes: number;
  netBalance: number;
  contact?: any;
  lastTransactionDate: string;
  activeDebtsCount: number;
  type: 'owed' | 'owe' | 'neutral'; // Added for easier filtering/styling
}

interface FilterBottomSheetForPersonsProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: { status: 'all' | 'owed' | 'owe'; minAmount: string; maxAmount: string; }) => void;
  initialFilters: { status: 'all' | 'owed' | 'owe'; minAmount: string; maxAmount: string; };
}

function FilterBottomSheetForPersons({ visible, onClose, onApplyFilters, initialFilters }: FilterBottomSheetForPersonsProps) {
  const [filters, setFilters] = useState(initialFilters);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleApply = () => {
    HapticService.medium();
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    HapticService.light();
    setFilters({ status: 'all', minAmount: '', maxAmount: '' });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={filterSheetStyles.backdrop}>
        <TouchableOpacity style={filterSheetStyles.backdropTouchable} onPress={onClose} />
      </View>
      <View style={filterSheetStyles.bottomSheet}>
        <View style={filterSheetStyles.handle} />
        <View style={filterSheetStyles.header}>
          <Text style={filterSheetStyles.headerTitle}>Filter Persons</Text>
          <TouchableOpacity style={filterSheetStyles.closeButton} onPress={onClose}>
            <X size={24} color="#5B616E" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <ScrollView style={filterSheetStyles.content}>
          {/* Status Filter */}
          <View style={filterSheetStyles.section}>
            <View style={filterSheetStyles.sectionHeader}>
              <Text style={filterSheetStyles.sectionTitle}>Status</Text>
            </View>
            <View style={filterSheetStyles.optionsContainer}>
              <TouchableOpacity
                style={[
                  filterSheetStyles.optionButton,
                  filters.status === 'all' && filterSheetStyles.activeOptionButton
                ]}
                onPress={() => setFilters(prev => ({ ...prev, status: 'all' }))}
              >
                <Text style={[
                  filterSheetStyles.optionText,
                  filters.status === 'all' && filterSheetStyles.activeOptionText
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  filterSheetStyles.optionButton,
                  filters.status === 'owed' && filterSheetStyles.activeOptionButton
                ]}
                onPress={() => setFilters(prev => ({ ...prev, status: 'owed' }))}
              >
                <Text style={[
                  filterSheetStyles.optionText,
                  filters.status === 'owed' && filterSheetStyles.activeOptionText
                ]}>
                  Owed to me
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  filterSheetStyles.optionButton,
                  filters.status === 'owe' && filterSheetStyles.activeOptionButton
                ]}
                onPress={() => setFilters(prev => ({ ...prev, status: 'owe' }))}
              >
                <Text style={[
                  filterSheetStyles.optionText,
                  filters.status === 'owe' && filterSheetStyles.activeOptionText
                ]}>
                  I owe
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount Range Filter */}
          <View style={filterSheetStyles.section}>
            <View style={filterSheetStyles.sectionHeader}>
              <Text style={filterSheetStyles.sectionTitle}>Amount Range</Text>
            </View>
            <View style={filterSheetStyles.amountRangeContainer}>
              <TextInput
                style={filterSheetStyles.amountInput}
                placeholder="Min Amount"
                keyboardType="numeric"
                value={filters.minAmount}
                onChangeText={(text) => setFilters(prev => ({ ...prev, minAmount: text.replace(/[^0-9.]/g, '') }))}
                placeholderTextColor="#C1C8CD"
              />
              <Text style={filterSheetStyles.amountSeparator}>-</Text>
              <TextInput
                style={filterSheetStyles.amountInput}
                placeholder="Max Amount"
                keyboardType="numeric"
                value={filters.maxAmount}
                onChangeText={(text) => setFilters(prev => ({ ...prev, maxAmount: text.replace(/[^0-9.]/g, '') }))}
                placeholderTextColor="#C1C8CD"
              />
            </View>
          </View>
        </ScrollView>

        <View style={filterSheetStyles.footer}>
          <TouchableOpacity
            style={filterSheetStyles.clearButton}
            onPress={handleClear}
          >
            <Text style={filterSheetStyles.clearButtonText}>Clear filters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={filterSheetStyles.applyButton}
            onPress={handleApply}
          >
            <Text style={filterSheetStyles.applyButtonText}>Apply filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const filterSheetStyles = StyleSheet.create({
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
    maxHeight: '80%', // Adjust as needed
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
    justifyContent: 'center',
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
  amountRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amountInput: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#050F19',
  },
  amountSeparator: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#5B616E',
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
  applyButton: {
    flex: 2,
    backgroundColor: '#1652F0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});


export default function PersonsScreen() {
  const { debts, loading: debtsLoading } = useDebts();
  const { user } = useAuth();
  const { contacts } = useContacts();
  const { formatAmount } = useCurrency();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<{
    status: 'all' | 'owed' | 'owe';
    minAmount: string;
    maxAmount: string;
  }>({
    status: 'all',
    minAmount: '',
    maxAmount: '',
  });
  const [sortOption, setSortOption] = useState<'name_asc' | 'name_desc' | 'amount_desc' | 'amount_asc' | 'status'>('status');

  const currentUserName = user?.name || 'You';

  const allPersonsData: PersonSummary[] = useMemo(() => {
    if (debtsLoading || !debts) return [];

    const personsMap = new Map<string, PersonSummary>();

    debts.forEach(debt => {
      const isUserCreditor = debt.creditorName === currentUserName;
      const isUserDebtor = debt.debtorName === currentUserName;

      let personName = '';
      if (isUserCreditor) {
        personName = debt.debtorName;
      } else if (isUserDebtor) {
        personName = debt.creditorName;
      } else {
        return;
      }

      if (personName === currentUserName) {
        return;
      }

      let personEntry = personsMap.get(personName) || {
        name: personName,
        totalOwedToUser: 0,
        totalUserOwes: 0,
        netBalance: 0,
        contact: contacts.find(c => c.name.toLowerCase() === personName.toLowerCase() || `${c.firstName} ${c.lastName}`.toLowerCase() === personName.toLowerCase()),
        lastTransactionDate: debt.createdAt,
        activeDebtsCount: 0,
        type: 'neutral', // Will be updated later
      };

      if (debt.status !== 'paid') {
        personEntry.activeDebtsCount++;
        if (isUserCreditor) {
          personEntry.totalOwedToUser += debt.amount;
        } else if (isUserDebtor) {
          personEntry.totalUserOwes += debt.amount;
        }
      }

      if (new Date(debt.createdAt) > new Date(personEntry.lastTransactionDate)) {
        personEntry.lastTransactionDate = debt.createdAt;
      }

      personsMap.set(personName, personEntry);
    });

    personsMap.forEach((entry, name) => {
      entry.netBalance = entry.totalOwedToUser - entry.totalUserOwes;
      entry.type = entry.netBalance > 0 ? 'owed' : (entry.netBalance < 0 ? 'owe' : 'neutral');
      personsMap.set(name, entry);
    });

    return Array.from(personsMap.values());
  }, [debts, debtsLoading, currentUserName, contacts]);

  const filteredAndSortedPersons = useMemo(() => {
    let filtered = allPersonsData.filter(person => {
      // Search filter
      const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = currentFilters.status === 'all' || person.type === currentFilters.status;

      // Amount filter
      const minAmount = parseFloat(currentFilters.minAmount);
      const maxAmount = parseFloat(currentFilters.maxAmount);
      const matchesAmount = (isNaN(minAmount) || Math.abs(person.netBalance) >= minAmount) &&
                            (isNaN(maxAmount) || Math.abs(person.netBalance) <= maxAmount);

      return matchesSearch && matchesStatus && matchesAmount;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'amount_asc':
          return Math.abs(a.netBalance) - Math.abs(b.netBalance);
        case 'amount_desc':
          return Math.abs(b.netBalance) - Math.abs(a.netBalance);
        case 'status':
          // 'owed' first, then 'owe', then 'neutral'
          if (a.type === 'owed' && b.type !== 'owed') return -1;
          if (a.type !== 'owed' && b.type === 'owed') return 1;
          if (a.type === 'owe' && b.type === 'neutral') return -1;
          if (a.type === 'neutral' && b.type === 'owe') return 1;
          return b.netBalance - a.netBalance; // Fallback to net balance for same status
        default:
          return 0;
      }
    });

    return filtered;
  }, [allPersonsData, searchQuery, currentFilters, sortOption]);

  const totalOwedToMe = useMemo(() => allPersonsData.reduce((sum, p) => sum + p.totalOwedToUser, 0), [allPersonsData]);
  const totalUserOwes = useMemo(() => allPersonsData.reduce((sum, p) => sum + p.totalUserOwes, 0), [allPersonsData]);

  if (!fontsLoaded) {
    return null;
  }

  const handlePersonPress = (personName: string) => {
    HapticService.light();
    router.push({ pathname: '/person-detail', params: { name: personName } });
  };

  const handleOpenFilterSheet = () => {
    HapticService.light();
    setShowFilterSheet(true);
  };

  const handleApplyFilters = (filters: typeof currentFilters) => {
    setCurrentFilters(filters);
  };

  const handleClearFilters = () => {
    setCurrentFilters({
      status: 'all',
      minAmount: '',
      maxAmount: '',
    });
    setSearchQuery('');
    setSortOption('status');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View style={styles.header} entering={FadeIn.duration(300)}>
        <Text style={styles.headerTitle}>All Persons</Text>
      </Animated.View>

      {/* Summary Totals */}
      <Animated.View style={styles.summaryContainer} entering={FadeIn.delay(100).duration(300)}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Owed to Me</Text>
          <Text style={styles.summaryAmountGreen}>{formatAmount(totalOwedToMe)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total I Owe</Text>
          <Text style={styles.summaryAmountRed}>{formatAmount(totalUserOwes)}</Text>
        </View>
      </Animated.View>

      {/* Search and Filter/Sort */}
      <Animated.View style={styles.controlsContainer} entering={SlideInRight.delay(200).duration(400)}>
        <View style={styles.searchBar}>
          <Search size={20} color="#5B616E" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search persons"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#5B616E"
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={handleOpenFilterSheet}>
          <Filter size={20} color="#5B616E" strokeWidth={2} />
        </TouchableOpacity>
      </Animated.View>

      {/* Sort Options */}
      <Animated.View style={styles.sortContainer} entering={FadeIn.delay(300).duration(300)}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.sortOption, sortOption === 'status' && styles.activeSortOption]}
            onPress={() => setSortOption('status')}
          >
            <Text style={[styles.sortOptionText, sortOption === 'status' && styles.activeSortOptionText]}>Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortOption === 'name_asc' && styles.activeSortOption]}
            onPress={() => setSortOption('name_asc')}
          >
            <Text style={[styles.sortOptionText, sortOption === 'name_asc' && styles.activeSortOptionText]}>Name (A-Z)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortOption === 'name_desc' && styles.activeSortOption]}
            onPress={() => setSortOption('name_desc')}
          >
            <Text style={[styles.sortOptionText, sortOption === 'name_desc' && styles.activeSortOptionText]}>Name (Z-A)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortOption === 'amount_desc' && styles.activeSortOption]}
            onPress={() => setSortOption('amount_desc')}
          >
            <Text style={[styles.sortOptionText, sortOption === 'amount_desc' && styles.activeSortOptionText]}>Amount (High-Low)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortOption === 'amount_asc' && styles.activeSortOption]}
            onPress={() => setSortOption('amount_asc')}
          >
            <Text style={[styles.sortOptionText, sortOption === 'amount_asc' && styles.activeSortOptionText]}>Amount (Low-High)</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Persons List */}
      <ScrollView style={styles.personsList} showsVerticalScrollIndicator={false}>
        {debtsLoading ? (
          <ActivityIndicator size="large" color="#1652F0" style={{ marginTop: 40 }} />
        ) : filteredAndSortedPersons.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No persons found matching your criteria.</Text>
            {allPersonsData.length === 0 && (
              <Text style={styles.emptyStateSubText}>Add a new debt to get started!</Text>
            )}
            {(searchQuery || currentFilters.status !== 'all' || currentFilters.minAmount || currentFilters.maxAmount) && (
              <TouchableOpacity style={styles.clearFiltersButton} onPress={handleClearFilters}>
                <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredAndSortedPersons.map((person, index) => (
            <AnimatedListItem key={person.name} index={index} delay={75}>
              <TouchableOpacity
                style={styles.personItem}
                onPress={() => handlePersonPress(person.name)}
                activeOpacity={0.7}
              >
                <View style={styles.personLeft}>
                  <View style={[
                    styles.personAvatar,
                    person.type === 'owed' ? styles.personAvatarGreen :
                    person.type === 'owe' ? styles.personAvatarRed : styles.personAvatarNeutral
                  ]}>
                    {person.contact?.imageUri ? (
                      <Image
                        source={{ uri: person.contact.imageUri }}
                        style={styles.personImage}
                      />
                    ) : (
                      <Text style={styles.personInitials}>
                        {ContactService.getContactInitials(person.contact || { name: person.name })}
                      </Text>
                    )}
                  </View>
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>{person.name}</Text>
                    <Text style={styles.personActiveDebts}>
                      {person.activeDebtsCount} active debt{person.activeDebtsCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                <View style={styles.personRight}>
                  <Text style={[
                    styles.personAmount,
                    person.netBalance > 0 ? styles.personAmountGreen :
                    person.netBalance < 0 ? styles.personAmountRed : styles.personAmountNeutral
                  ]}>
                    {person.netBalance > 0 ? '+' : ''}{formatAmount(person.netBalance)}
                  </Text>
                  <ChevronRight size={16} color="#C1C8CD" strokeWidth={2} />
                </View>
              </TouchableOpacity>
            </AnimatedListItem>
          ))
        )}
      </ScrollView>

      {/* Filter Bottom Sheet (adapted for persons) */}
      <FilterBottomSheetForPersons
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={currentFilters}
      />
    </SafeAreaView>
  );
}

// --- Styles for PersonsScreen ---
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#5B616E',
    marginBottom: 4,
  },
  summaryAmountGreen: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#00D632',
  },
  summaryAmountRed: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FF4747',
  },
  controlsContainer: {
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
  sortContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginRight: 12,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F7F8FA',
    marginRight: 8,
  },
  activeSortOption: {
    backgroundColor: '#1652F0',
  },
  sortOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#5B616E',
  },
  activeSortOptionText: {
    color: '#FFFFFF',
  },
  personsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100, // For tab bar
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  personLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 2,
  },
  personAvatarGreen: {
    borderColor: '#00D632',
  },
  personAvatarRed: {
    borderColor: '#FF4747',
  },
  personAvatarNeutral: {
    borderColor: '#C1C8CD',
  },
  personImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  personInitials: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1652F0',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 2,
  },
  personActiveDebts: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  personRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  personAmount: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  personAmountGreen: {
    color: '#00D632',
  },
  personAmountRed: {
    color: '#FF4747',
  },
  personAmountNeutral: {
    color: '#5B616E',
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
  clearFiltersButton: {
    marginTop: 20,
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  clearFiltersButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1652F0',
  },
});