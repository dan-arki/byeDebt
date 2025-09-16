import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export default function LoadingSkeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: LoadingSkeletonProps) {
  const shimmer = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmer.value,
      [0, 1],
      [0.3, 0.7]
    );
    
    return {
      opacity,
    };
  });

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Animated.View style={[styles.shimmer, animatedStyle, { borderRadius }]} />
    </View>
  );
}

// Preset skeleton components for common UI elements
export function DebtItemSkeleton() {
  return (
    <View style={styles.debtItemContainer}>
      <View style={styles.debtItemLeft}>
        <LoadingSkeleton width={40} height={40} borderRadius={20} />
        <View style={styles.debtItemInfo}>
          <LoadingSkeleton width={120} height={16} />
          <LoadingSkeleton width={80} height={14} style={{ marginTop: 4 }} />
        </View>
      </View>
      <View style={styles.debtItemRight}>
        <LoadingSkeleton width={60} height={16} />
        <LoadingSkeleton width={50} height={14} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

export function PortfolioCardSkeleton() {
  return (
    <View style={styles.portfolioCard}>
      <View style={styles.portfolioHeader}>
        <LoadingSkeleton width={24} height={24} borderRadius={12} />
        <LoadingSkeleton width={80} height={14} />
      </View>
      <LoadingSkeleton width={100} height={24} style={{ marginBottom: 4 }} />
      <LoadingSkeleton width={60} height={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F2F5',
    overflow: 'hidden',
  },
  shimmer: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  debtItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  debtItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  debtItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  debtItemRight: {
    alignItems: 'flex-end',
  },
  portfolioCard: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 16,
    padding: 20,
  },
  portfolioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
});