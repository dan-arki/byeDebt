import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Animated, { 
  FadeIn, 
  SlideInUp, 
  useSharedValue, 
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MoveHorizontal as MoreHorizontal, CircleCheck as CheckCircle, Calendar, Tag, MessageSquare, Clock, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useCategories } from '../hooks/useCategories';
import { useCurrency } from '../hooks/useCurrency';
import AnimatedButton from '../components/AnimatedButton';
import DebtCompletionAnimation from '../components/DebtCompletionAnimation';
import ProgressBar from '../components/ProgressBar';
import { HapticService, HapticType } from '../services/hapticService';
import { DebtService } from '../services/debtService';
import { Debt } from '../types/debt';
import { useAuth } from '../hooks/useAuth';
import { useDebts } from '../hooks/useDebts';

export default function DebtDetailScreen() {
  const { categories } = useCategories();
  const { formatAmount } = useCurrency();
  const { user, isAuthenticated } = useAuth();
  const { debts, loading: debtsLoading, refreshDebts } = useDebts();
  const params = useLocalSearchParams();
  const debtId = params.id as string;

  const [debt, setDebt] = useState<Debt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [isRepaid, setIsRepaid] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  // Animation values
  const buttonScale = useSharedValue(1);
  const amountOpacity = useSharedValue(1);
  const strikethroughWidth = useSharedValue(0);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const amountAnimatedStyle = useAnimatedStyle(() => ({
    opacity: amountOpacity.value,
  }));

  const strikethroughStyle = useAnimatedStyle(() => ({
    width: `${strikethroughWidth.value}%`,
  }));

  // Find debt from the debts list instead of making a separate API call
  useEffect(() => {
    const findDebt = () => {
      console.log('Finding debt with ID:', debtId);
      console.log('Available debts:', debts.length);
      console.log('User authenticated:', isAuthenticated);
      console.log('User ID:', user?.id);

      if (!debtId) {
        setError('No debt ID provided.');
        setLoading(false);
        return;
      }

      if (debtsLoading) {
        setLoading(true);
        return;
      }

      const foundDebt = debts.find(d => d.id === debtId);
      console.log('Found debt:', foundDebt);

      if (foundDebt) {
        setDebt(foundDebt);
        setError(null);
        
        if (foundDebt.status === 'paid') {
          setIsRepaid(true);
          strikethroughWidth.value = 100;
          amountOpacity.value = 0.5;
        } else {
          setIsRepaid(false);
          strikethroughWidth.value = 0;
          amountOpacity.value = 1;
        }
      } else {
        setError('Debt not found.');
      }
      
      setLoading(false);
    };

    findDebt();
  }, [debtId, debts, debtsLoading, user?.id, isAuthenticated]);

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1652F0" />
        <Text style={styles.loadingText}>Loading debt details...</Text>
      </View>
    );
  }

  if (error || !debt) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Could not load debt details.'}</Text>
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
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Determine debt type relative to current user
  const currentUserName = user?.name || 'You';
  const debtType = debt.debtorName === currentUserName ? 'owe' : 'owed';
  const personName = debtType === 'owe' ? debt.creditorName : debt.debtorName;

  const isOverdue = new Date(debt.dueDate) < new Date() && debt.status !== 'paid';
  const remainingAmount = debt.amount;

  const getCategoryEmoji = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.emoji || '📝';
  };

  const handleMarkRepaid = () => {
    if (isUpdating) return;
    
    // Check authentication first
    if (!isAuthenticated) {
      HapticService.error();
      Alert.alert(
        'Authentication Required',
        'You must be signed in to mark debts as repaid. Please sign in to your account.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => HapticService.light() },
          { text: 'Sign In', style: 'default', onPress: () => {
            HapticService.light();
            router.push('/(auth)/login');
          }}
        ]
      );
      return;
    }
    
    HapticService.warning();
    
    Alert.alert(
      'Mark as repaid',
      `Are you sure you want to mark this debt as fully repaid?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => HapticService.light() },
        { text: 'Mark repaid', style: 'default', onPress: async () => {
          HapticService.heavy();
          
          try {
            setIsUpdating(true);
            await DebtService.updateDebtStatus(debt.id, 'paid');
            
            // Update local state
            setDebt(prev => prev ? { ...prev, status: 'paid' } : null);
            setIsRepaid(true);
            
            // Animate strikethrough effect
            strikethroughWidth.value = withTiming(100, { duration: 800 });
            amountOpacity.value = withTiming(0.5, { duration: 800 });
            
            // Refresh the debts list to update other screens
            refreshDebts();
            
            // Wait a bit for the animation to complete, then navigate back
            setTimeout(() => {
              router.back();
            }, 1200);
            
            // Show completion animation
            setTimeout(() => {
              setShowCompletionAnimation(true);
            }, 800);
          } catch (err) {
            HapticService.error();
            const errorMessage = (err as Error).message;
            if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
              Alert.alert(
                'Authentication Error', 
                'Your session may have expired. Please sign in again.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign In', onPress: () => router.push('/(auth)/login') }
                ]
              );
            } else {
              Alert.alert('Error', `Failed to mark debt as repaid: ${errorMessage}`);
            }
            console.error('Error marking debt repaid:', err);
          } finally {
            setIsUpdating(false);
          }
        }}
      ]
    );
  };

  const handleBackPress = () => {
    HapticService.light();
    router.back();
  };

  const handleCompletionAnimationFinish = () => {
    setShowCompletionAnimation(false);
    router.back();
  };

  const repaymentProgress = debt.status === 'paid' ? 1 : 0;

  return (
    <>
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
          <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal size={24} color="#5B616E" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Amount Display */}
          <Animated.View style={styles.amountContainer} entering={SlideInUp.delay(100).duration(400)}>
            <View style={styles.amountHeader}>
              <View style={[
                styles.typeIcon,
                debtType === 'owe' ? styles.oweIcon : styles.owedIcon
              ]}>
                {debtType === 'owe' ? (
                  <TrendingDown size={24} color="#FFFFFF" strokeWidth={2} />
                ) : (
                  <TrendingUp size={24} color="#FFFFFF" strokeWidth={2} />
                )}
              </View>
              <Text style={styles.typeLabel}>
                {debtType === 'owe' ? 'You owe' : 'Owes you'}
              </Text>
            </View>
            
            <View style={styles.amountValueContainer}>
              <Animated.Text style={[
                styles.amountValue,
                debtType === 'owe' ? styles.negativeAmount : styles.positiveAmount,
                amountAnimatedStyle,
              ]}>
                {formatAmount(remainingAmount)}
              </Animated.Text>
              {isRepaid && (
                <Animated.View style={[styles.strikethrough, strikethroughStyle]} />
              )}
            </View>

            {/* Repayment Progress */}
            {debt.status === 'paid' && (
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={repaymentProgress}
                  label="Repayment progress"
                  color="#00D632"
                  delay={300}
                />
              </View>
            )}

            {isOverdue && (
              <View style={styles.overdueAlert}>
                <Clock size={16} color="#FF4747" strokeWidth={2} />
                <Text style={styles.overdueText}>This debt is overdue</Text>
              </View>
            )}
          </Animated.View>

          {/* Details */}
          <Animated.View style={styles.detailsContainer} entering={FadeIn.delay(300).duration(400)}>
            <View style={styles.detailItem}>
              <View style={styles.detailLeft}>
                <Calendar size={20} color="#5B616E" strokeWidth={2} />
                <Text style={styles.detailLabel}>Due date</Text>
              </View>
              <Text style={styles.detailValue}>{formatDate(debt.dueDate)}</Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailLeft}>
                <Tag size={20} color="#5B616E" strokeWidth={2} />
                <Text style={styles.detailLabel}>Category</Text>
              </View>
              <View style={styles.categoryValueContainer}>
                <Text style={styles.categoryEmoji}>
                  {getCategoryEmoji(debt.category || 'Other')}
                </Text>
                <Text style={styles.detailValue}>{debt.category || 'Other'}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailLeft}>
                <Calendar size={20} color="#5B616E" strokeWidth={2} />
                <Text style={styles.detailLabel}>Created</Text>
              </View>
              <Text style={styles.detailValue}>{formatDate(debt.createdAt)}</Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>Status</Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot,
                  debt.status === 'paid' ? styles.paidStatus : 
                  isOverdue ? styles.overdueStatus : styles.pendingStatus
                ]} />
                <Text style={[
                  styles.statusText,
                  debt.status === 'paid' ? styles.paidStatusText : 
                  isOverdue ? styles.overdueStatusText : styles.pendingStatusText
                ]}>
                  {debt.status === 'paid' ? 'Paid' : 
                   isOverdue ? 'Overdue' : 'Pending'}
                </Text>
              </View>
            </View>

            {debt.description && (
              <View style={[styles.detailItem, styles.noteItem]}>
                <View style={styles.detailLeft}>
                  <MessageSquare size={20} color="#5B616E" strokeWidth={2} />
                  <Text style={styles.detailLabel}>Note</Text>
                </View>
                <Text style={[styles.detailValue, styles.noteValue]}>{debt.description}</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Action Button */}
        <Animated.View style={styles.footer} entering={SlideInUp.delay(500).duration(300)}>
          {!isAuthenticated && (
            <View style={styles.authWarning}>
              <Text style={styles.authWarningText}>
                Sign in to mark debts as repaid and sync across devices
              </Text>
            </View>
          )}
          <AnimatedButton
            title={isUpdating ? 'Updating...' : isRepaid ? 'Debt Repaid ✓' : 'Mark as repaid'}
            style={[
              styles.actionButton, 
              isRepaid && styles.repaidButton,
            ]}
            textStyle={isRepaid ? styles.repaidButtonText : undefined}
            onPress={handleMarkRepaid}
            disabled={isRepaid || isUpdating}
            hapticType={HapticType.HEAVY}
          />
        </Animated.View>
      </SafeAreaView>

      {/* Completion Animation Overlay */}
      <DebtCompletionAnimation
        visible={showCompletionAnimation}
        onComplete={handleCompletionAnimationFinish}
        amount={formatAmount(remainingAmount)}
        personName={personName}
      />
    </>
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
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 32,
  },
  amountHeader: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  typeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  oweIcon: {
    backgroundColor: '#FF4747',
  },
  owedIcon: {
    backgroundColor: '#00D632',
  },
  typeLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#5B616E',
  },
  amountValue: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  amountValueContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  strikethrough: {
    position: 'absolute',
    top: '50%',
    left: 0,
    height: 3,
    backgroundColor: '#FF4747',
    borderRadius: 2,
  },
  negativeAmount: {
    color: '#FF4747',
  },
  positiveAmount: {
    color: '#00D632',
  },
  progressContainer: {
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
  },
  overdueAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    marginTop: 16,
  },
  overdueText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF4747',
  },
  detailsContainer: {
    marginBottom: 32,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  noteItem: {
    alignItems: 'flex-start',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#5B616E',
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#050F19',
  },
  categoryValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paidStatus: {
    backgroundColor: '#00D632',
  },
  pendingStatus: {
    backgroundColor: '#1652F0',
  },
  overdueStatus: {
    backgroundColor: '#FF4747',
  },
  statusText: {
    fontSize: 16,
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
  noteValue: {
    flex: 1,
    marginLeft: 32,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 34,
  },
  actionButton: {
    backgroundColor: '#1652F0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  repaidButton: {
    backgroundColor: '#00D632',
  },
  repaidButtonText: {
    color: '#FFFFFF',
  },
  authWarning: {
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  authWarningText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF4747',
    textAlign: 'center',
    lineHeight: 20,
  },
  disabledButton: {
    backgroundColor: '#C1C8CD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
});