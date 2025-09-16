import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export enum HapticType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SELECTION = 'selection',
}

export class HapticService {
  /**
   * Triggers haptic feedback based on the specified type
   * Automatically handles platform compatibility
   */
  static async trigger(type: HapticType): Promise<void> {
    if (Platform.OS === 'web') {
      // Web fallback - could implement vibration API if needed
      return;
    }

    try {
      switch (type) {
        case HapticType.LIGHT:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case HapticType.MEDIUM:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case HapticType.HEAVY:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case HapticType.SUCCESS:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case HapticType.WARNING:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case HapticType.ERROR:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case HapticType.SELECTION:
          await Haptics.selectionAsync();
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  /**
   * Light haptic for general button taps and navigation
   */
  static light(): Promise<void> {
    return this.trigger(HapticType.LIGHT);
  }

  /**
   * Medium haptic for form submissions and confirmations
   */
  static medium(): Promise<void> {
    return this.trigger(HapticType.MEDIUM);
  }

  /**
   * Heavy haptic for critical actions
   */
  static heavy(): Promise<void> {
    return this.trigger(HapticType.HEAVY);
  }

  /**
   * Success haptic for completed transactions
   */
  static success(): Promise<void> {
    return this.trigger(HapticType.SUCCESS);
  }

  /**
   * Warning haptic for important alerts
   */
  static warning(): Promise<void> {
    return this.trigger(HapticType.WARNING);
  }

  /**
   * Error haptic for failed actions
   */
  static error(): Promise<void> {
    return this.trigger(HapticType.ERROR);
  }

  /**
   * Selection haptic for picker/selector changes
   */
  static selection(): Promise<void> {
    return this.trigger(HapticType.SELECTION);
  }

  /**
   * Custom celebration sequence for debt completion
   */
  static async celebration(): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      await this.success();
      setTimeout(() => this.light(), 100);
      setTimeout(() => this.light(), 200);
    } catch (error) {
      console.warn('Celebration haptic sequence failed:', error);
    }
  }
}