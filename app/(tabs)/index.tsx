import React, { useState, useMemo } from 'react';
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
import { useContacts } from '../../hooks/useContacts';
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
  const { contacts } = useContacts();
  
  // Calculate dynamic data based on fetched debts
  const currentUserName = user?.name || 'You';
  
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  // Calculate people who owe you money
  const peopleWhoOweYou = useMemo(() => {
    const peopleMap = new Map<string, { name: string; totalAmount: number; contact?: any }>();
    
    debts
      .filter(debt => debt.creditorName === currentUserName && debt.status !== 'paid')
      .forEach(debt => {
        const personName = debt.debtorName;
        const existing = peopleMap.get(personName);
        const newAmount = (existing?.totalAmount || 0) + debt.amount;
        
        // Try to find matching contact
        const matchingContact = contacts.find(contact => 
          contact.name.toLowerCase() === personName.toLowerCase() ||
          `${contact.firstName} ${contact.lastName}`.toLowerCase() === personName.toLowerCase()
        );
        
        peopleMap.set(personName, {
          name: personName,
          totalAmount: newAmount,
          contact: matchingContact
        });
      });
    
    return Array.from(peopleMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 6); // Show top 6 people
  }, [debts, currentUserName, contacts]);

  // Calculate people I owe money to
  const peopleIOwe = useMemo(() => {
    const peopleMap = new Map<string, { name: string; totalAmount: number; contact?: any }>();
    
    debts
      .filter(debt => debt.debtorName === currentUserName && debt.status !== 'paid')
      .forEach(debt => {
        const personName = debt.creditorName;
        const existing = peopleMap.get(personName);
        const newAmount = (existing?.totalAmount || 0) + debt.amount;
        
        // Try to find matching contact
        const matchingContact = contacts.find(contact => 
          contact.name.toLowerCase() === personName.toLowerCase() ||
          `${contact.firstName} ${contact.lastName}`.toLowerCase() === personName.toLowerCase()
        );
        
        peopleMap.set(personName, {
          name: personName,
          totalAmount: newAmount,
          contact: matchingContact
        });
      });
    
    return Array.from(peopleMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 6); // Show top 6 people
  }, [debts, currentUserName, contacts]);
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

  const handleNavigateToOwedDebts = () => {
    HapticService.light();
    router.push({ pathname: '/(tabs)/debts', params: { type: 'owed' } });
  };

  const handleNavigateToOweDebts = () => {
    HapticService.light();
    router.push({ pathname: '/(tabs)/debts', params: { type: 'owe' } });
  };
  
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

        {/* People Who Owe You */}
        {!loading && peopleWhoOweYou.length > 0 && (
          <Animated.View style={styles.peopleContainer} entering={FadeIn.delay(600).duration(300)}>
            <View style={styles.peopleHeader}>
              <Text style={styles.peopleTitle}>People who owe you</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={handleNavigateToOwedDebts}
              >
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.peopleScrollContent}
              style={styles.peopleScroll}
            >
              {peopleWhoOweYou.map((person, index) => (
                <AnimatedListItem key={person.name} index={index} delay={50}>
                  <TouchableOpacity
                    style={styles.personCard}
                    onPress={() => handleNavigateToPerson(person.name)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.personAvatar}>
                      {person.contact?.imageUri ? (
                        <Image 
                          source={{ uri: person.contact.imageUri }} 
                          style={styles.personImage}
                        />
                      ) : (
                        <Text style={styles.personInitials}>
                          {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.personName} numberOfLines={1}>
                      {person.name}
                    </Text>
                    <Text style={styles.personAmount}>
                      {formatAmount(person.totalAmount)}
                    </Text>
                  </TouchableOpacity>
                </AnimatedListItem>
              ))}
            </ScrollView>
          </Animated.View>
        )}
        {/* Recent Activity */}
        {/* People I Owe */}
        {!loading && peopleIOwe.length > 0 && (
          <Animated.View style={styles.peopleContainer} entering={FadeIn.delay(700).duration(300)}>
            <View style={styles.peopleHeader}>
              <Text style={styles.peopleTitle}>People I owe</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={handleNavigateToOweDebts}
              >
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.peopleScrollContent}
              style={styles.peopleScroll}
            >
              {peopleIOwe.map((person, index) => (
                <AnimatedListItem key={person.name} index={index} delay={50}>
                  <TouchableOpacity
                    style={styles.personCard}
                    onPress={() => handleNavigateToPerson(person.name)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.personAvatar, styles.personAvatarRed]}>
                      {person.contact?.imageUri ? (
                        <Image 
                          source={{ uri: person.contact.imageUri }} 
                          style={styles.personImage}
                        />
                      ) : (
                        <Text style={styles.personInitials}>
                          {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.personName} numberOfLines={1}>
                      {person.name}
                    </Text>
                    <Text style={[styles.personAmount, styles.personAmountRed]}>
                      {formatAmount(person.totalAmount)}
                    </Text>
                  </TouchableOpacity>
                </AnimatedListItem>
              ))}
            </ScrollView>
          </Animated.View>
        )}
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
                        <Text style={styles.activityPerson}>{personName}</Text>
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
  peopleContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  peopleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  peopleTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
  },
  peopleScroll: {
    marginHorizontal: -20,
  },
  peopleScrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  personCard: {
    alignItems: 'center',
    width: 80,
  },
  personAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 2,
  },
  personAvatarGreen: {
    borderColor: '#00D632',
  },
  personImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  personInitials: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1652F0',
  },
  personName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#050F19',
    textAlign: 'center',
    marginBottom: 4,
  },
  personAmount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  personAmountGreen: {
    color: '#00D632',
  },
  personAvatarRed: {
    borderColor: '#FF4747',
  },
  personAmountRed: {
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
  },
});