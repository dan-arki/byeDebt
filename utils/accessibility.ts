import { AccessibilityInfo } from 'react-native';

export class AccessibilityService {
  private static isReduceMotionEnabled = false;

  /**
   * Initialize accessibility settings
   */
  static async initialize(): Promise<void> {
    try {
      // Check if reduce motion is enabled
      this.isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      
      // Listen for changes
      AccessibilityInfo.addEventListener('reduceMotionChanged', (isEnabled) => {
        this.isReduceMotionEnabled = isEnabled;
      });
    } catch (error) {
      console.warn('Failed to initialize accessibility settings:', error);
    }
  }

  /**
   * Check if animations should be reduced for accessibility
   */
  static shouldReduceMotion(): boolean {
    return this.isReduceMotionEnabled;
  }

  /**
   * Get animation duration based on accessibility settings
   */
  static getAnimationDuration(defaultDuration: number): number {
    return this.shouldReduceMotion() ? 0 : defaultDuration;
  }

  /**
   * Get spring configuration based on accessibility settings
   */
  static getSpringConfig(defaultConfig: any): any {
    if (this.shouldReduceMotion()) {
      return {
        damping: 1000, // Immediate animation
        stiffness: 1000,
        mass: 0.1,
      };
    }
    return defaultConfig;
  }

  /**
   * Announce text to screen readers
   */
  static announce(message: string): void {
    AccessibilityInfo.announceForAccessibility(message);
  }
}