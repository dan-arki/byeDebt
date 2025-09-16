import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { CircleCheck as CheckCircle } from 'lucide-react-native';
import { HapticService } from '../services/hapticService';

interface DebtCompletionAnimationProps {
  visible: boolean;
  onComplete: () => void;
  amount: string;
  personName: string;
}

export default function DebtCompletionAnimation({
  visible,
  onComplete,
  amount,
  personName,
}: DebtCompletionAnimationProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  useEffect(() => {
    if (visible) {
      // Start celebration sequence
      runOnJS(HapticService.celebration)();
      
      // Container appears
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      
      // Checkmark animation
      checkScale.value = withDelay(
        300,
        withSequence(
          withSpring(1.2, { damping: 10, stiffness: 400 }),
          withSpring(1, { damping: 15, stiffness: 300 })
        )
      );
      
      // Confetti effect
      confettiOpacity.value = withDelay(
        500,
        withSequence(
          withTiming(1, { duration: 300 }),
          withDelay(1000, withTiming(0, { duration: 500 }))
        )
      );
      
      // Text appears
      textOpacity.value = withDelay(
        700,
        withTiming(1, { duration: 300 })
      );
      
      // Auto-dismiss after animation
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(onComplete)();
          }
        });
        scale.value = withTiming(0.8, { duration: 300 });
      }, 1500);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Confetti Background */}
        <Animated.View style={[styles.confetti, confettiStyle]}>
          <Text style={styles.confettiEmoji}>🎉</Text>
          <Text style={styles.confettiEmoji}>✨</Text>
          <Text style={styles.confettiEmoji}>🎊</Text>
          <Text style={styles.confettiEmoji}>💫</Text>
        </Animated.View>
        
        {/* Success Checkmark */}
        <Animated.View style={[styles.checkContainer, checkStyle]}>
          <CheckCircle size={64} color="#00D632" strokeWidth={2} fill="#00D632" />
        </Animated.View>
        
        {/* Success Text */}
        <Animated.View style={textStyle}>
          <Text style={styles.successTitle}>Debt Paid! 🎉</Text>
          <Text style={styles.successSubtitle}>
            {amount} to {personName}
          </Text>
          <Text style={styles.successMessage}>
            Great job staying on top of your finances!
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    maxWidth: 300,
    marginHorizontal: 20,
  },
  confetti: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  confettiEmoji: {
    fontSize: 24,
    position: 'absolute',
  },
  checkContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#050F19',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#00D632',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    textAlign: 'center',
    lineHeight: 20,
  },
});