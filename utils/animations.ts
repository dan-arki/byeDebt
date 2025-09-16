import { 
  withTiming, 
  withSpring, 
  withSequence, 
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

// Animation configurations
export const ANIMATION_CONFIGS = {
  // Standard timing for most UI transitions
  timing: {
    duration: 250,
    easing: Easing.out(Easing.cubic),
  },
  
  // Quick timing for micro-interactions
  quick: {
    duration: 150,
    easing: Easing.out(Easing.quad),
  },
  
  // Smooth spring for natural movements
  spring: {
    damping: 20,
    stiffness: 300,
    mass: 1,
  },
  
  // Bouncy spring for celebration effects
  bouncy: {
    damping: 15,
    stiffness: 400,
    mass: 0.8,
  },
};

/**
 * Fade in animation for new content
 */
export const fadeIn = (delay: number = 0) => {
  'worklet';
  return withDelay(
    delay,
    withTiming(1, ANIMATION_CONFIGS.timing)
  );
};

/**
 * Fade out animation for removing content
 */
export const fadeOut = (callback?: () => void) => {
  'worklet';
  return withTiming(0, ANIMATION_CONFIGS.quick, (finished) => {
    if (finished && callback) {
      runOnJS(callback)();
    }
  });
};

/**
 * Slide in from right animation
 */
export const slideInRight = (delay: number = 0) => {
  'worklet';
  return withDelay(
    delay,
    withSpring(0, ANIMATION_CONFIGS.spring)
  );
};

/**
 * Slide in from left animation
 */
export const slideInLeft = (delay: number = 0) => {
  'worklet';
  return withDelay(
    delay,
    withSpring(0, ANIMATION_CONFIGS.spring)
  );
};

/**
 * Scale animation for button press feedback
 */
export const scalePress = () => {
  'worklet';
  return withSequence(
    withTiming(0.95, ANIMATION_CONFIGS.quick),
    withTiming(1, ANIMATION_CONFIGS.quick)
  );
};

/**
 * Success checkmark animation
 */
export const successCheckmark = (callback?: () => void) => {
  'worklet';
  return withSequence(
    withTiming(1.2, ANIMATION_CONFIGS.quick),
    withSpring(1, ANIMATION_CONFIGS.bouncy, (finished) => {
      if (finished && callback) {
        runOnJS(callback)();
      }
    })
  );
};

/**
 * Progress bar animation
 */
export const progressAnimation = (targetValue: number, duration: number = 1000) => {
  'worklet';
  return withTiming(targetValue, {
    duration,
    easing: Easing.out(Easing.cubic),
  });
};

/**
 * Staggered list item animation
 */
export const staggeredFadeIn = (index: number, itemDelay: number = 50) => {
  'worklet';
  return withDelay(
    index * itemDelay,
    withTiming(1, ANIMATION_CONFIGS.timing)
  );
};

/**
 * Celebration animation sequence
 */
export const celebrationSequence = (callback?: () => void) => {
  'worklet';
  return withSequence(
    withTiming(1.1, ANIMATION_CONFIGS.quick),
    withSpring(0.95, ANIMATION_CONFIGS.bouncy),
    withSpring(1, ANIMATION_CONFIGS.bouncy, (finished) => {
      if (finished && callback) {
        runOnJS(callback)();
      }
    })
  );
};

/**
 * Shake animation for errors
 */
export const shakeAnimation = () => {
  'worklet';
  return withSequence(
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(0, { duration: 50 })
  );
};