import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export class SessionManager {
  /**
   * Clear all user session data
   */
  static async clearSession(): Promise<void> {
    try {
      // Clear Supabase session
      await supabase.auth.signOut();
      
      // Clear all local storage
      await this.clearLocalStorage();
      
      // Clear any cached data
      await this.clearCache();
      
    } catch (error) {
      console.error('Error clearing session:', error);
      throw error;
    }
  }

  /**
   * Clear local storage data
   */
  private static async clearLocalStorage(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userDataKeys = keys.filter(key => 
        key.includes('user_') || 
        key.includes('debt_') ||
        key.includes('currency_') ||
        key.includes('notification_') ||
        key.includes('category_') ||
        key.includes('auth_')
      );
      
      if (userDataKeys.length > 0) {
        await AsyncStorage.multiRemove(userDataKeys);
      }
    } catch (error) {
      console.warn('Error clearing local storage:', error);
    }
  }

  /**
   * Clear cached data
   */
  private static async clearCache(): Promise<void> {
    try {
      // Clear specific cache keys
      const cacheKeys = [
        'exchange_rates',
        'cached_debts',
        'user_preferences',
        'app_settings'
      ];
      
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  }

  /**
   * Check if user session is valid
   */
  static async isSessionValid(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return !error && session !== null;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  }

  /**
   * Refresh user session
   */
  static async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      return !error && data.session !== null;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  }

  /**
   * Get current session info
   */
  static async getSessionInfo() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      return {
        isValid: session !== null,
        user: session?.user || null,
        expiresAt: session?.expires_at || null,
        accessToken: session?.access_token || null,
      };
    } catch (error) {
      console.error('Error getting session info:', error);
      return {
        isValid: false,
        user: null,
        expiresAt: null,
        accessToken: null,
      };
    }
  }
}