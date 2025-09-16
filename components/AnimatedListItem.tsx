import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  delay?: number;
  style?: any;
}

export default function AnimatedListItem({ 
  children, 
  index, 
  delay = 50,
  style 
}: AnimatedListItemProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    // Staggered animation based on index
    const animationDelay = index * delay;
    
    opacity.value = withDelay(
      animationDelay,
      withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      })
    );
    
    translateY.value = withDelay(
      animationDelay,
      withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [index, delay]);

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}