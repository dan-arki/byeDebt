import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import { Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { router, useLocalSearchParams } from 'expo-router';
import { useCategories } from '../../hooks/useCategories';
import { useCurrency } from '../../hooks/useCurrency';
import { useAddDebt } from './_layout';
import { useDebts } from '../../hooks/useDebts';
import { useAuth } from '../../hooks/useAuth';
import AnimatedButton from '../../components/AnimatedButton';
import AnimatedListItem from '../../components/AnimatedListItem';
import { HapticService, HapticType } from '../../services/hapticService';
import { DebtItemSkeleton, PortfolioCardSkeleton } from '../../components/LoadingSkeleton';

export default function HomeScreen() {
  const { categories } = useCategories();
  const { formatAmount } = useCurrency();
  const { showAddDebt } = useAddDebt();
  const { debts, loading, error } = useDebts();
  const { user } = useAuth();
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

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

  const isOverdue = (dateString: string) => new Date(dateString) < new Date();

  const handleNavigateToDebt = (debtId: string) => {
    HapticService.light();
    router.push({ pathname: '/debt-detail', params: { id: debtId } });
  };

  const handleNavigateToPerson = (personName: string) => {
    HapticService.light();
    router.push({ pathname: '/person-detail', params: { name: personName } });
  };

  // Calculate dynamic data based on fetched debts
  const currentUserName = user?.name || 'You';
  
  const totalOwing = debts
    .filter(debt => debt.debtorName === currentUserName && debt.status !== 'paid')
    .reduce((sum, debt) => sum + debt.amount, 0);

  const totalOwed = debts
    .filter(debt => debt.creditorName === currentUserName && debt.status !== 'paid')
    .reduce((sum, debt) => sum + debt.amount, 0);

  const myDebts = debts.filter(debt => debt.debtorName === currentUserName && debt.status !== 'paid');
  const debtsToMe = debts.filter(debt => debt.creditorName === currentUserName && debt.status !== 'paid');

  const recentDebts = debts.slice(0, 4);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={styles.header} entering={FadeIn.duration(300)}>
          <View style={styles.headerTop}>
            <Image 
              source={require('../../assets/images/logoByeDebt.png')}
              style={styles.appLogo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Portfolio Summary */}
        <Animated.View style={styles.portfolioContainer} entering={SlideInRight.delay(200).duration(400)}>
          <View style={styles.portfolioCards}>
            {loading ? (
              <>
                <PortfolioCardSkeleton />
                <PortfolioCardSkeleton />
              </>
            ) : (
              <>
                <AnimatedListItem index={0} delay={100}>
                  <View style={styles.portfolioCard}>
                    <View style={styles.portfolioCardHeader}>
                      <View style={[styles.portfolioIcon, { backgroundColor: '#FF4747' }]}>
                        <TrendingDown size={20} color="#FFFFFF" strokeWidth={2} />
                      </View>
                      <Text style={styles.portfolioCardTitle}>I owe</Text>
                    </View>
                    <Text style={styles.portfolioAmount}>{formatAmount(totalOwing)}</Text>
                    <Text style={styles.portfolioChange}>{myDebts.length} active</Text>
                  </View>
                </AnimatedListItem>

                <AnimatedListItem index={1} delay={100}>
                  <View style={styles.portfolioCard}>
                    <View style={styles.portfolioCardHeader}>
                      <View style={[styles.portfolioIcon, { backgroundColor: '#00D632' }]}>
                        <TrendingUp size={20} color="#FFFFFF" strokeWidth={2} />
                      </View>
                      <Text style={styles.portfolioCardTitle}>Owed to me</Text>
                    </View>
                    <Text style={styles.portfolioAmount}>{formatAmount(totalOwed)}</Text>
                    <Text style={styles.portfolioChange}>{debtsToMe.length} active</Text>
                  </View>
                </AnimatedListItem>
              </>
            )}
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View style={styles.activityContainer} entering={FadeIn.delay(400).duration(300)}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Recent activity</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => {
                HapticService.light();
                router.push('/debts');
              }}
            >
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <>
              <DebtItemSkeleton />
              <DebtItemSkeleton />
              <DebtItemSkeleton />
              <DebtItemSkeleton />
            </>
          ) : recentDebts.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No recent debts. Add one to get started!</Text>
            </View>
          ) : (
            recentDebts.map((debt, index) => {
              const overdue = isOverdue(debt.dueDate);
              const debtType = debt.debtorName === currentUserName ? 'owe' : 'owed';
              const personName = debtType === 'owe' ? debt.creditorName : debt.debtorName;
              
              return (
                <AnimatedListItem key={debt.id} index={index} delay={75}>
                  <TouchableOpacity 
                    style={styles.activityItem}
                    onPress={() => handleNavigateToDebt(debt.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.activityLeft}>
                      <View style={styles.activityAvatar}>
                        <Text style={styles.activityAvatarText}>
                          {personName.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </View>
                      <View style={styles.activityInfo}>
                        <TouchableOpacity onPress={() => handleNavigateToPerson(personName)}>
                          <Text style={[styles.activityPerson, styles.activityPersonLink]}>{personName}</Text>
                        </TouchableOpacity>
                        <View style={styles.activityCategoryContainer}>
                          <Text style={styles.activityCategoryEmoji}>
                            {getCategoryEmoji(debt.category || 'Other')}
                          </Text>
                          <Text style={styles.activityCategory}>{debt.category || 'Other'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.activityRight}>
                      <Text style={[
                        styles.activityAmount,
                        debtType === 'owe' ? styles.negativeAmount : styles.positiveAmount
                      ]}>
                        {debtType === 'owe' ? '-' : '+'}{formatAmount(debt.amount)}
                      </Text>
                      <Text style={[
                        styles.activityDate,
                        overdue && styles.overdueDate
                      ]}>
                        {formatDate(debt.dueDate)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </AnimatedListItem>
              );
            })
          )}
        </Animated.View>

        {/* Promo Section */}
        <Animated.View style={styles.promoContainer} entering={FadeIn.delay(600).duration(300)}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Stay on top of your finances</Text>
            <Text style={styles.promoSubtitle}>
              Set up notifications and calendar reminders to never miss a payment again.
            </Text>
          </View>
          <TouchableOpacity style={styles.promoClose}>
            <Text style={styles.promoCloseText}>×</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Space for the floating tab bar
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appLogo: {
    width: 40,
    height: 40,
  },
  notificationButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4747',
    position: 'absolute',
    top: 6,
    right: 6,
  },
  balanceContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  balanceAmount: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: '#050F19',
    marginBottom: 8,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceChangeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#00D632',
  },
  portfolioContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  portfolioTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
  },
  viewAllText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1652F0',
  },
  portfolioCards: {
    flexDirection: 'row',
    gap: 16,
  },
  portfolioCard: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 16,
    padding: 24,
    minHeight: 120,
  },
  portfolioCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  portfolioIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioCardTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#5B616E',
  },
  portfolioAmount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#050F19',
    marginBottom: 4,
  },
  portfolioChange: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  activityContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1652F0',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityAvatarText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1652F0',
  },
  activityInfo: {
    flex: 1,
  },
  activityCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityCategoryEmoji: {
    fontSize: 12,
  },
  activityPerson: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 2,
  },
  activityPersonLink: {
    color: '#1652F0',
  },
  activityCategory: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityAmount: {
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
  activityDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  overdueDate: {
    color: '#FF4747',
  },
  promoContainer: {
    marginHorizontal: 20,
    backgroundColor: '#E8F4FD',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 100,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    lineHeight: 20,
  },
  promoClose: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoCloseText: {
    fontSize: 20,
    fontFamily: 'Inter-Regular',
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
  },
});