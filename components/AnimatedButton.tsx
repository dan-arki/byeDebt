import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { HapticService, HapticType } from '../services/hapticService';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  hapticType?: HapticType;
  children?: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedButton({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  hapticType = HapticType.LIGHT,
  children,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    if (disabled) {
      runOnJS(HapticService.error)();
      return;
    }

    // Trigger haptic feedback
    runOnJS(HapticService.trigger)(hapticType);
    
    // Execute the onPress callback
    onPress();
  };

  return (
    <AnimatedTouchable
      style={[style, animatedStyle, disabled && styles.disabled]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={1}
    >
      {children || <Text style={[styles.defaultText, textStyle]}>{title}</Text>}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  defaultText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});