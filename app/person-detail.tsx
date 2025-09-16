import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Tag, 
  MessageSquare,
  ChevronRight,
  Clock
} from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { usePersonDebts } from '../hooks/usePersonDebts';
import { useCategories } from '../hooks/useCategories';
import { useCurrency } from '../hooks/useCurrency';
import { useAuth } from '../hooks/useAuth';
import AnimatedListItem from '../components/AnimatedListItem';
import { HapticService } from '../services/hapticService';

export default function PersonDetailScreen() {
  const { categories } = useCategories();
  const { formatAmount } = useCurrency();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const personName = params.name as string;

  const { debts, summary, loading, error } = usePersonDebts(personName);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paid'>('all');

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  if (!personName) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Person name is required</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonError}>
          <Text style={styles.backButtonErrorText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCategoryEmoji = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.emoji || '📝';
  };

  const isOverdue = (dateString: string) => new Date(dateString) < new Date();

  const handleBackPress = () => {
    HapticService.light();
    router.back();
  };

  const handleDebtPress = (debtId: string) => {
    HapticService.light();
    router.push({ pathname: '/debt-detail', params: { id: debtId } });
  };

  const handleTabChange = (tab: 'all' | 'active' | 'paid') => {
    HapticService.selection();
    setActiveTab(tab);
  };

  const filteredDebts = debts.filter(debt => {
    switch (activeTab) {
      case 'active':
        return debt.status !== 'paid';
      case 'paid':
        return debt.status === 'paid';
      default:
        return true;
    }
  });

  const currentUserName = user?.name || 'You';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View style={styles.header} entering={FadeIn.duration(300)}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <ArrowLeft size={24} color="#050F19" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{personName}</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1652F0" />
          <Text style={styles.loadingText}>Loading debt history...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonError}>
            <Text style={styles.backButtonErrorText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary Cards */}
          {summary && (
            <Animated.View style={styles.summaryContainer} entering={SlideInUp.delay(100).duration(400)}>
              <View style={styles.summaryCards}>
                <AnimatedListItem index={0} delay={100}>
                  <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                      <View style={[styles.summaryIcon, { backgroundColor: summary.netBalance >= 0 ? '#00D632' : '#FF4747' }]}>
                        {summary.netBalance >= 0 ? (
                          <TrendingUp size={20} color="#FFFFFF" strokeWidth={2} />
                        ) : (
                          <TrendingDown size={20} color="#FFFFFF" strokeWidth={2} />
                        )}
                      </View>
                      <Text style={styles.summaryCardTitle}>Net Balance</Text>
                    </View>
                    <Text style={[
                      styles.summaryAmount,
                      { color: summary.netBalance >= 0 ? '#00D632' : '#FF4747' }
                    ]}>
                      {summary.netBalance >= 0 ? '+' : ''}{formatAmount(Math.abs(summary.netBalance))}
                    </Text>
                    <Text style={styles.summaryChange}>
                      {summary.netBalance >= 0 
                        ? `${personName} owes you` 
                        : `You owe ${personName}`
                      }
                    </Text>
                  </View>
                </AnimatedListItem>

                <AnimatedListItem index={1} delay={100}>
                  <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                      <View style={[styles.summaryIcon, { backgroundColor: '#1652F0' }]}>
                        <Calendar size={20} color="#FFFFFF" strokeWidth={2} />
                      </View>
                      <Text style={styles.summaryCardTitle}>Total Debts</Text>
                    </View>
                    <Text style={styles.summaryAmount}>{summary.totalDebts}</Text>
                    <Text style={styles.summaryChange}>
                      {summary.activeDebts} active, {summary.paidDebts} paid
                    </Text>
                  </View>
                </AnimatedListItem>
              </View>

              {/* Breakdown */}
              <View style={styles.breakdownContainer}>
                <Text style={styles.breakdownTitle}>Breakdown</Text>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>They owe you:</Text>
                  <Text style={[styles.breakdownAmount, { color: '#00D632' }]}>
                    {formatAmount(summary.totalOwed)}
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>You owe them:</Text>
                  <Text style={[styles.breakdownAmount, { color: '#FF4747' }]}>
                    {formatAmount(summary.totalOwing)}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Tab Filter */}
          <Animated.View style={styles.tabContainer} entering={FadeIn.delay(200).duration(300)}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'all' && styles.activeTab]}
              onPress={() => handleTabChange('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                All ({debts.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'active' && styles.activeTab]}
              onPress={() => handleTabChange('active')}
            >
              <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                Active ({summary?.activeDebts || 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'paid' && styles.activeTab]}
              onPress={() => handleTabChange('paid')}
            >
              <Text style={[styles.tabText, activeTab === 'paid' && styles.activeTabText]}>
                Paid ({summary?.paidDebts || 0})
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Debt History */}
          <Animated.View style={styles.historyContainer} entering={FadeIn.delay(300).duration(300)}>
            <Text style={styles.historyTitle}>Debt History</Text>
            
            {filteredDebts.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  {activeTab === 'all' 
                    ? 'No debts found with this person.' 
                    : `No ${activeTab} debts found.`
                  }
                </Text>
              </View>
            ) : (
              filteredDebts.map((debt, index) => {
                const overdue = isOverdue(debt.dueDate) && debt.status !== 'paid';
                const debtType = debt.debtorName === currentUserName ? 'owe' : 'owed';
                
                return (
                  <AnimatedListItem key={debt.id} index={index} delay={75}>
                    <TouchableOpacity 
                      style={styles.debtItem}
                      onPress={() => handleDebtPress(debt.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.debtLeft}>
                        <View style={styles.debtInfo}>
                          <View style={styles.debtHeader}>
                            <Text style={[
                              styles.debtAmount,
                              debtType === 'owe' ? styles.negativeAmount : styles.positiveAmount
                            ]}>
                              {debtType === 'owe' ? '-' : '+'}{formatAmount(debt.amount)}
                            </Text>
                            <View style={[
                              styles.statusBadge,
                              debt.status === 'paid' ? styles.paidBadge : 
                              overdue ? styles.overdueBadge : styles.pendingBadge
                            ]}>
                              <Text style={[
                                styles.statusText,
                                debt.status === 'paid' ? styles.paidStatusText : 
                                overdue ? styles.overdueStatusText : styles.pendingStatusText
                              ]}>
                                {debt.status === 'paid' ? 'Paid' : 
                                 overdue ? 'Overdue' : 'Pending'}
                              </Text>
                            </View>
                          </View>
                          
                          <View style={styles.debtMeta}>
                            <View style={styles.debtCategoryContainer}>
                              <Text style={styles.debtCategoryEmoji}>
                                {getCategoryEmoji(debt.category || 'Other')}
                              </Text>
                              <Text style={styles.debtCategory}>{debt.category || 'Other'}</Text>
                            </View>
                            <Text style={styles.debtDate}>Due: {formatDate(debt.dueDate)}</Text>
                          </View>

                          {debt.description && (
                            <Text style={styles.debtDescription} numberOfLines={2}>
                              {debt.description}
                            </Text>
                          )}
                        </View>
                      </View>
                      <ChevronRight size={16} color="#C1C8CD" strokeWidth={2} />
                    </TouchableOpacity>
                  </AnimatedListItem>
                );
              })
            )}
          </Animated.View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
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
    color: '#050F19',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4747',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonError: {
    backgroundColor: '#1652F0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonErrorText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  summaryContainer: {
    marginBottom: 32,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 16,
    padding: 20,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  summaryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCardTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#5B616E',
  },
  summaryAmount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#050F19',
    marginBottom: 4,
  },
  summaryChange: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  breakdownContainer: {
    backgroundColor: '#F7F8FA',
    borderRadius: 16,
    padding: 20,
  },
  breakdownTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  breakdownAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  tabContainer: {
    flexDirection: 'row',
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
  historyContainer: {
    marginBottom: 100,
  },
  historyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 20,
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
    flex: 1,
  },
  debtInfo: {
    flex: 1,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  debtAmount: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  positiveAmount: {
    color: '#00D632',
  },
  negativeAmount: {
    color: '#FF4747',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: '#E8F5E8',
  },
  pendingBadge: {
    backgroundColor: '#E8F4FD',
  },
  overdueBadge: {
    backgroundColor: '#FFF0F0',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  paidStatusText: {
    color: '#00D632',
  },
  pendingStatusText: {
    color: '#1652F0',
  },
  overdueStatusText: {
    color: '#FF4747',
  },
  debtMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  debtDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  debtDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    fontStyle: 'italic',
    marginTop: 4,
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
  },
});