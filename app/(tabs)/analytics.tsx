import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { TrendingUp, TrendingDown, Target, Calendar, ChevronDown, ChevronRight } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useCategories } from '../../hooks/useCategories';
import { useCurrency } from '../../hooks/useCurrency';
import { useDebts } from '../../hooks/useDebts';
import { useAuth } from '../../hooks/useAuth';
import { Debt } from '../../types/debt';
import { Category } from '../../types/category';
import { DebtItemSkeleton, PortfolioCardSkeleton } from '../../components/LoadingSkeleton';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(22, 82, 240, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(91, 97, 110, ${opacity})`,
  style: {
    borderRadius: 0,
  },
  propsForDots: {
    r: '0',
  },
  strokeWidth: 3,
};

interface CategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  emoji: string;
}

interface PeriodDates {
  startDate: Date;
  endDate: Date;
}

export default function AnalyticsScreen() {
  const { categories } = useCategories();
  const { formatAmount } = useCurrency();
  const { debts, loading } = useDebts();
  const { user } = useAuth();
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  const currentUserName = user?.name || 'You';

  // Helper function to get period dates
  const getPeriodDates = (period: string): PeriodDates => {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '1H':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '1D':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '1Y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'ALL':
        startDate.setFullYear(2020); // Far back date
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    return { startDate, endDate };
  };

  // Filter debts by selected period
  const filteredDebts = useMemo(() => {
    const { startDate, endDate } = getPeriodDates(selectedPeriod);
    return debts.filter(debt => {
      const debtDate = new Date(debt.createdAt);
      return debtDate >= startDate && debtDate <= endDate;
    });
  }, [debts, selectedPeriod]);

  // Calculate totals
  const { totalOwing, totalOwed, netBalance } = useMemo(() => {
    const owing = filteredDebts
      .filter(debt => debt.debtorName === currentUserName && debt.status !== 'paid')
      .reduce((sum, debt) => sum + debt.amount, 0);

    const owed = filteredDebts
      .filter(debt => debt.creditorName === currentUserName && debt.status !== 'paid')
      .reduce((sum, debt) => sum + debt.amount, 0);

    return {
      totalOwing: owing,
      totalOwed: owed,
      netBalance: owed - owing,
    };
  }, [filteredDebts, currentUserName]);

  // Generate chart data
  const chartData = useMemo(() => {
    if (filteredDebts.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{ data: [0] }],
      };
    }

    // Group debts by time periods for the chart
    const { startDate, endDate } = getPeriodDates(selectedPeriod);
    const timeRange = endDate.getTime() - startDate.getTime();
    const intervals = 4; // Show 4 data points
    const intervalSize = timeRange / intervals;

    const labels: string[] = [];
    const dataPoints: number[] = [];

    for (let i = 0; i < intervals; i++) {
      const intervalStart = new Date(startDate.getTime() + (i * intervalSize));
      const intervalEnd = new Date(startDate.getTime() + ((i + 1) * intervalSize));
      
      // Create label based on period
      let label = '';
      if (selectedPeriod === '1D') {
        label = intervalStart.getHours().toString().padStart(2, '0') + 'h';
      } else if (selectedPeriod === '1W') {
        label = intervalStart.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (selectedPeriod === '1M') {
        label = intervalStart.toLocaleDateString('en-US', { day: 'numeric' });
      } else if (selectedPeriod === '1Y') {
        label = intervalStart.toLocaleDateString('en-US', { month: 'short' });
      } else {
        label = intervalStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      labels.push(label);

      // Calculate total debt amount for this interval
      const intervalDebts = filteredDebts.filter(debt => {
        const debtDate = new Date(debt.createdAt);
        return debtDate >= intervalStart && debtDate < intervalEnd;
      });

      const intervalTotal = intervalDebts.reduce((sum, debt) => sum + debt.amount, 0);
      dataPoints.push(intervalTotal);
    }

    return {
      labels,
      datasets: [{ data: dataPoints.length > 0 ? dataPoints : [0] }],
    };
  }, [filteredDebts, selectedPeriod]);

  // Calculate category breakdown
  const categoryBreakdown = useMemo((): CategoryBreakdown[] => {
    const categoryTotals = new Map<string, number>();
    
    // Sum amounts by category
    filteredDebts.forEach(debt => {
      const category = debt.category || 'Other';
      const currentTotal = categoryTotals.get(category) || 0;
      categoryTotals.set(category, currentTotal + debt.amount);
    });

    const totalAmount = Array.from(categoryTotals.values()).reduce((sum, amount) => sum + amount, 0);
    
    if (totalAmount === 0) {
      return [];
    }

    // Convert to breakdown array with percentages
    const breakdown: CategoryBreakdown[] = [];
    const colors = ['#1652F0', '#00D632', '#FF4747', '#FFA500', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'];
    
    Array.from(categoryTotals.entries()).forEach(([categoryName, amount], index) => {
      const category = categories.find(cat => cat.name === categoryName);
      breakdown.push({
        name: categoryName,
        amount,
        percentage: Math.round((amount / totalAmount) * 100),
        color: colors[index % colors.length],
        emoji: category?.emoji || '📝',
      });
    });

    // Sort by amount (highest first)
    return breakdown.sort((a, b) => b.amount - a.amount);
  }, [filteredDebts, categories]);

  // Calculate insights
  const insights = useMemo(() => {
    const paidDebts = debts.filter(debt => debt.status === 'paid');
    const totalDebts = debts.length;
    const onTimeRate = totalDebts > 0 ? Math.round((paidDebts.length / totalDebts) * 100) : 0;

    // Calculate upcoming due dates (next 7 days)
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDebts = debts.filter(debt => {
      if (debt.status === 'paid') return false;
      const dueDate = new Date(debt.dueDate);
      return dueDate >= now && dueDate <= next7Days;
    });

    return {
      onTimeRate,
      upcomingDebts: upcomingDebts.length,
    };
  }, [debts]);

  // Calculate balance change (simplified - comparing current vs previous period)
  const balanceChange = useMemo(() => {
    const { startDate } = getPeriodDates(selectedPeriod);
    const previousPeriodStart = new Date(startDate);
    
    // Calculate previous period start
    switch (selectedPeriod) {
      case '1H':
        previousPeriodStart.setHours(previousPeriodStart.getHours() - 1);
        break;
      case '1D':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
        break;
      case '1W':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
        break;
      case '1M':
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
        break;
      case '1Y':
        previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
        break;
      default:
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
    }

    const previousPeriodDebts = debts.filter(debt => {
      const debtDate = new Date(debt.createdAt);
      return debtDate >= previousPeriodStart && debtDate < startDate;
    });

    const previousNetBalance = previousPeriodDebts.reduce((sum, debt) => {
      if (debt.creditorName === currentUserName && debt.status !== 'paid') {
        return sum + debt.amount;
      } else if (debt.debtorName === currentUserName && debt.status !== 'paid') {
        return sum - debt.amount;
      }
      return sum;
    }, 0);

    if (previousNetBalance === 0) {
      return { percentage: 0, isPositive: true };
    }

    const change = ((netBalance - previousNetBalance) / Math.abs(previousNetBalance)) * 100;
    return {
      percentage: Math.abs(change),
      isPositive: change >= 0,
    };
  }, [debts, netBalance, selectedPeriod, currentUserName]);

  if (!fontsLoaded) {
    return null;
  }

  const getCategoryEmoji = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.emoji || '📝';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <TouchableOpacity style={styles.periodSelector}>
            <Text style={styles.periodText}>{selectedPeriod}</Text>
            <ChevronDown size={16} color="#5B616E" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Balance Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.balanceAmount}>{formatAmount(Math.abs(netBalance))}</Text>
          <View style={styles.balanceChange}>
            {balanceChange.isPositive ? (
              <TrendingUp size={16} color="#00D632" strokeWidth={2} />
            ) : (
              <TrendingDown size={16} color="#FF4747" strokeWidth={2} />
            )}
            <Text style={[
              styles.balanceChangeText,
              { color: balanceChange.isPositive ? '#00D632' : '#FF4747' }
            ]}>
              {balanceChange.isPositive ? '+' : '-'}{balanceChange.percentage.toFixed(1)}%
            </Text>
          </View>
          
          {filteredDebts.length > 0 ? (
            <LineChart
              data={chartData}
              width={screenWidth}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLabels={false}
              withHorizontalLabels={false}
            />
          ) : (
            <View style={styles.noDataChart}>
              <Text style={styles.noDataText}>No data for selected period</Text>
            </View>
          )}

          <View style={styles.timeSelector}>
            {['1H', '1D', '1W', '1M', '1Y', 'ALL'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.timePeriod,
                  selectedPeriod === period && styles.activeTimePeriod
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.timePeriodText,
                  selectedPeriod === period && styles.activeTimePeriodText
                ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Portfolio Breakdown */}
        <View style={styles.portfolioContainer}>
          {loading ? (
            <>
              <PortfolioCardSkeleton />
              <PortfolioCardSkeleton />
            </>
          ) : (
            <>
              <View style={styles.portfolioItem}>
                <View style={styles.portfolioLeft}>
                  <View style={[styles.portfolioIcon, { backgroundColor: '#FF4747' }]}>
                    <TrendingDown size={16} color="#FFFFFF" strokeWidth={2} />
                  </View>
                  <Text style={styles.portfolioLabel}>I owe</Text>
                </View>
                <View style={styles.portfolioRight}>
                  <Text style={styles.portfolioAmount}>{formatAmount(totalOwing)}</Text>
                  <ChevronRight size={16} color="#C1C8CD" strokeWidth={2} />
                </View>
              </View>

              <View style={styles.portfolioItem}>
                <View style={styles.portfolioLeft}>
                  <View style={[styles.portfolioIcon, { backgroundColor: '#00D632' }]}>
                    <TrendingUp size={16} color="#FFFFFF" strokeWidth={2} />
                  </View>
                  <Text style={styles.portfolioLabel}>Owed to me</Text>
                </View>
                <View style={styles.portfolioRight}>
                  <Text style={styles.portfolioAmount}>{formatAmount(totalOwed)}</Text>
                  <ChevronRight size={16} color="#C1C8CD" strokeWidth={2} />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Category Breakdown */}
        <View style={styles.categoryContainer}>
          <Text style={styles.sectionTitle}>Category breakdown</Text>
          {loading ? (
            <>
              <DebtItemSkeleton />
              <DebtItemSkeleton />
              <DebtItemSkeleton />
            </>
          ) : categoryBreakdown.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No debts in selected period</Text>
            </View>
          ) : (
            categoryBreakdown.map((category) => (
              <View key={category.name} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View style={styles.categoryNameContainer}>
                    <Text style={styles.categoryEmoji}>
                      {category.emoji}
                    </Text>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryAmount}>{formatAmount(category.amount)}</Text>
                  <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>Insights</Text>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={[styles.insightIcon, { backgroundColor: '#E8F5E8' }]}>
                <Target size={20} color="#00D632" strokeWidth={2} />
              </View>
              <Text style={styles.insightTitle}>Payment completion rate</Text>
            </View>
            <Text style={styles.insightValue}>{insights.onTimeRate}%</Text>
            <Text style={styles.insightDescription}>
              {insights.onTimeRate >= 80 
                ? "Excellent! You maintain a great repayment rate"
                : insights.onTimeRate >= 60
                ? "Good repayment rate, keep it up!"
                : "Consider setting up reminders to improve your rate"
              }
            </Text>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={[styles.insightIcon, { backgroundColor: '#FFF0F0' }]}>
                <Calendar size={20} color="#FF4747" strokeWidth={2} />
              </View>
              <Text style={styles.insightTitle}>Upcoming due dates</Text>
            </View>
            <Text style={styles.insightValue}>
              {insights.upcomingDebts} {insights.upcomingDebts === 1 ? 'debt' : 'debts'}
            </Text>
            <Text style={styles.insightDescription}>
              {insights.upcomingDebts === 0
                ? "No debts due in the next 7 days"
                : `Due within the next 7 days`
              }
            </Text>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#050F19',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  periodText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#5B616E',
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
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
    marginBottom: 24,
  },
  balanceChangeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  chart: {
    marginLeft: -20,
    marginRight: -20,
  },
  noDataChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    marginHorizontal: 0,
  },
  noDataText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  timePeriod: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTimePeriod: {
    backgroundColor: '#1652F0',
  },
  timePeriodText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#5B616E',
  },
  activeTimePeriodText: {
    color: '#FFFFFF',
  },
  portfolioContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  portfolioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  portfolioLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  portfolioIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
  },
  portfolioRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portfolioAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  categoryNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#050F19',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  insightsContainer: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  insightCard: {
    backgroundColor: '#F7F8FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
  },
  insightValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#050F19',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    lineHeight: 20,
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