import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number; // 0 to 1
  label?: string;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
  delay?: number;
}

export default function ProgressBar({
  progress,
  label,
  showPercentage = true,
  color = '#1652F0',
  backgroundColor = '#F0F2F5',
  height = 8,
  animated = true,
  delay = 0,
}: ProgressBarProps) {
  const animatedProgress = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  useEffect(() => {
    if (animated) {
      animatedProgress.value = withDelay(
        delay,
        withTiming(progress, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        })
      );
      
      textOpacity.value = withDelay(
        delay + 200,
        withTiming(1, { duration: 300 })
      );
    } else {
      animatedProgress.value = progress;
      textOpacity.value = 1;
    }
  }, [progress, animated, delay]);

  return (
    <View style={styles.container}>
      {label && (
        <Animated.View style={[styles.labelContainer, textStyle]}>
          <Text style={styles.label}>{label}</Text>
          {showPercentage && (
            <Text style={styles.percentage}>
              {Math.round(progress * 100)}%
            </Text>
          )}
        </Animated.View>
      )}
      
      <View style={[styles.track, { backgroundColor, height }]}>
        <Animated.View
          style={[
            styles.progress,
            { backgroundColor: color, height },
            progressStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#050F19',
  },
  percentage: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1652F0',
  },
  track: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 4,
  },
});