import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Settings, 
  Bell, 
  Shield, 
  CircleHelp as HelpCircle, 
  LogOut, 
  ChevronRight,
  Star,
  Award
} from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import CurrencySelector from '../../components/CurrencySelector';
import { useAuth } from '../../hooks/useAuth';
import { useDebts } from '../../hooks/useDebts';
import { useCurrency } from '../../hooks/useCurrency';
import { useAddDebt } from './_layout';
import { HapticService } from '../../services/hapticService';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, skipAuth } = useAuth();
  const { debts, loading: debtsLoading } = useDebts();
  const { formatAmount } = useCurrency();
  const { showAddDebt } = useAddDebt();
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  // Calculate dynamic statistics
  const statistics = useMemo(() => {
    if (!debts.length) {
      return {
        totalRepaid: 0,
        debtsResolved: 0,
        onTimeRate: 0,
        trustScore: 0,
        trustDescription: 'No payment history yet',
      };
    }

    const currentUserName = user?.name || 'You';
    
    // Calculate total repaid (sum of all paid debts)
    const paidDebts = debts.filter(debt => debt.status === 'paid');
    const totalRepaid = paidDebts.reduce((sum, debt) => sum + debt.amount, 0);
    
    // Count resolved debts
    const debtsResolved = paidDebts.length;
    
    // Calculate on-time rate (percentage of paid debts vs total debts)
    const totalDebts = debts.length;
    const onTimeRate = totalDebts > 0 ? Math.round((debtsResolved / totalDebts) * 100) : 0;
    
    // Calculate trust score (0-5 scale based on on-time rate)
    const trustScore = Math.min(5, Math.max(0, (onTimeRate / 100) * 5));
    
    // Generate trust description based on performance
    let trustDescription = '';
    if (onTimeRate >= 95) {
      trustDescription = 'Outstanding! You consistently repay on time.';
    } else if (onTimeRate >= 85) {
      trustDescription = 'Excellent! You maintain a great repayment rate.';
    } else if (onTimeRate >= 70) {
      trustDescription = 'Good payment history. Keep it up!';
    } else if (onTimeRate >= 50) {
      trustDescription = 'Room for improvement in payment consistency.';
    } else if (totalDebts > 0) {
      trustDescription = 'Consider setting up reminders to improve your rate.';
    } else {
      trustDescription = 'No payment history yet. Start building your trust score!';
    }

    return {
      totalRepaid,
      debtsResolved,
      onTimeRate,
      trustScore,
      trustDescription,
    };
  }, [debts, user]);

  // Generate user initials dynamically
  const getUserInitials = () => {
    if (!user?.name) return 'GU'; // Guest User
    
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  if (!fontsLoaded) {
    return null;
  }

  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      const isFilled = i < fullStars || (i === fullStars && hasHalfStar);
      stars.push(
        <Star 
          key={i} 
          size={16} 
          color={isFilled ? "#1652F0" : "#E5E7EB"} 
          fill={isFilled ? "#1652F0" : "transparent"}
          strokeWidth={1}
        />
      );
    }
    return stars;
  };

  const handleLogout = () => {
    HapticService.warning();
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => HapticService.light() },
        { text: 'Sign Out', style: 'destructive', onPress: async () => {
          HapticService.medium();
          
          try {
            await logout();
            
            HapticService.success();
            
            // Redirect to login page
            router.replace('/(auth)/login');
            
          } catch (error) {
            HapticService.error();
            // Even on error, redirect to login for security
            router.replace('/(auth)/login');
            Alert.alert(
              'Sign Out Error',
              'There was an issue signing you out. You have been logged out locally for security.'
            );
          }
        }}
      ]
    );
  };

  const handleLoginPress = () => {
    HapticService.light();
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User Info */}
        <View style={styles.userContainer}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{getUserInitials()}</Text>
          </View>
          <Text style={styles.userName}>
            {user?.name || 'Guest User'}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email || 'Using offline mode'}
          </Text>
          
          {!isAuthenticated && (
            <TouchableOpacity 
              style={styles.loginPrompt}
              onPress={handleLoginPress}
            >
              <Text style={styles.loginPromptText}>Sign in to sync your data</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Trust Score */}
        <View style={styles.trustContainer}>
          <View style={styles.trustHeader}>
            <View style={styles.trustIcon}>
              <Award size={20} color="#1652F0" strokeWidth={2} />
            </View>
            <View style={styles.trustInfo}>
              <Text style={styles.trustTitle}>Trust Score</Text>
              <Text style={styles.trustSubtitle}>Based on payment history</Text>
            </View>
          </View>
          
          {debtsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1652F0" />
              <Text style={styles.loadingText}>Calculating...</Text>
            </View>
          ) : (
            <>
              <View style={styles.trustScore}>
                <Text style={styles.trustScoreValue}>
                  {statistics.trustScore.toFixed(1)}
                </Text>
                <View style={styles.trustStars}>
                  {renderStars(statistics.trustScore)}
                </View>
              </View>
              
              <Text style={styles.trustDescription}>
                {statistics.trustDescription}
              </Text>
            </>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {debtsLoading ? (
            <View style={styles.statsLoadingContainer}>
              <ActivityIndicator size="small" color="#1652F0" />
              <Text style={styles.loadingText}>Loading stats...</Text>
            </View>
          ) : (
            <>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatAmount(statistics.totalRepaid)}
                </Text>
                <Text style={styles.statLabel}>Total repaid</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{statistics.debtsResolved}</Text>
                <Text style={styles.statLabel}>Debts resolved</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{statistics.onTimeRate}%</Text>
                <Text style={styles.statLabel}>On-time rate</Text>
              </View>
            </>
          )}
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <View style={styles.currencySection}>
            <Text style={styles.currencySectionTitle}>Preferences</Text>
            <CurrencySelector showLabel={true} />
          </View>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#F0F2F5' }]}>
                <Settings size={20} color="#5B616E" strokeWidth={2} />
              </View>
              <Text style={styles.menuText}>Settings</Text>
            </View>
            <ChevronRight size={16} color="#C1C8CD" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#F0F2F5' }]}>
                <Bell size={20} color="#5B616E" strokeWidth={2} />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
            </View>
            <ChevronRight size={16} color="#C1C8CD" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#F0F2F5' }]}>
                <Shield size={20} color="#5B616E" strokeWidth={2} />
              </View>
              <Text style={styles.menuText}>Privacy & Security</Text>
            </View>
            <ChevronRight size={16} color="#C1C8CD" strokeWidth={2} />
          </TouchableOpacity>

          {isAuthenticated ? (
            <TouchableOpacity 
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#FFF0F0' }]}>
                  <LogOut size={20} color="#FF4747" strokeWidth={2} />
                </View>
                <Text style={[styles.menuText, styles.logoutText]}>
                  Sign out
                </Text>
              </View>
              <ChevronRight size={16} color="#C1C8CD" strokeWidth={2} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.menuItem, styles.loginItem]}
              onPress={handleLoginPress}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#E8F4FD' }]}>
                  <LogOut size={20} color="#1652F0" strokeWidth={2} style={{ transform: [{ rotate: '180deg' }] }} />
                </View>
                <Text style={[styles.menuText, styles.loginText]}>
                  Sign in
                </Text>
              </View>
              <ChevronRight size={16} color="#C1C8CD" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#050F19',
  },
  userContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatarText: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1652F0',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    marginBottom: 8,
  },
  loginPrompt: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  loginPromptText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1652F0',
  },
  trustContainer: {
    marginHorizontal: 20,
    backgroundColor: '#F7F8FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  trustIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustInfo: {
    flex: 1,
  },
  trustTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 2,
  },
  trustSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  trustScore: {
    alignItems: 'center',
    marginBottom: 12,
  },
  trustScoreValue: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#1652F0',
    marginBottom: 8,
  },
  trustStars: {
    flexDirection: 'row',
    gap: 4,
  },
  trustDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#F7F8FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    minHeight: 80,
  },
  statsLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#050F19',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  currencySection: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  currencySectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#050F19',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#FF4747',
  },
  loginItem: {
    borderBottomWidth: 0,
  },
  loginText: {
    color: '#1652F0',
  },
});