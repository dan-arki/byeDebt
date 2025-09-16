import { supabase } from '../lib/supabase';
import { User, AuthState } from '../types/auth';

export class AuthService {
  static async getAuthState(): Promise<AuthState> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return {
          isAuthenticated: false,
          user: null,
          hasSkippedAuth: false,
          isLoading: false,
        };
      }

      if (session?.user) {
        // Get user profile from our users table
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: userProfile?.name || session.user.email?.split('@')[0] || '',
          createdAt: session.user.created_at,
        };

        return {
          isAuthenticated: true,
          user,
          hasSkippedAuth: false,
          isLoading: false,
        };
      }

      return {
        isAuthenticated: false,
        user: null,
        hasSkippedAuth: false,
        isLoading: false,
      };
    } catch (error) {
      console.error('Error getting auth state:', error);
      return {
        isAuthenticated: false,
        user: null,
        hasSkippedAuth: false,
        isLoading: false,
      };
    }
  }

  static async login(email: string, password: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      // Get user profile
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: userProfile?.name || data.user.email?.split('@')[0] || '',
        createdAt: data.user.created_at,
      };

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  static async register(email: string, password: string, name?: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Registration failed');
      }

      // Get the user profile from our users table
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: userProfile?.name || name || data.user.email?.split('@')[0] || '',
        createdAt: data.user.created_at,
      };

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed. Please try again.');
    }
  }

  static async logout(): Promise<void> {
    try {
      // Clear any cached data before signing out
      await this.clearUserCache();
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      
      // Additional cleanup after successful sign out
      await this.postLogoutCleanup();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Clear user-related cached data
   */
  private static async clearUserCache(): Promise<void> {
    try {
      // Clear any user-specific data from AsyncStorage
      const keysToRemove = [
        'currency_preference',
        'notification_preferences',
        'debt_categories',
        'user_preferences',
        'cached_debts',
        'exchange_rates'
      ];
      
      // Remove each key individually to avoid errors if some don't exist
      for (const key of keysToRemove) {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove ${key} from storage:`, error);
        }
      }
    } catch (error) {
      console.warn('Error clearing user cache:', error);
    }
  }

  /**
   * Perform additional cleanup after logout
   */
  private static async postLogoutCleanup(): Promise<void> {
    try {
      // Cancel any pending notifications
      if (typeof require !== 'undefined') {
        try {
          const { NotificationService } = require('../services/notificationService');
          // Cancel all scheduled notifications
          const scheduledNotifications = await NotificationService.getScheduledNotifications();
          for (const notification of scheduledNotifications) {
            if (notification.content.data?.type === 'debt_reminder') {
              await NotificationService.cancelDebtNotifications(notification.content.data.debtId);
            }
          }
        } catch (error) {
          console.warn('Error canceling notifications:', error);
        }
      }
    } catch (error) {
      console.warn('Error in post-logout cleanup:', error);
    }
  }

  static async skipAuth(): Promise<void> {
    // For skipping auth, we don't need to do anything with Supabase
    // The app will handle this state locally
    return Promise.resolve();
  }

  static async clearSkipAuth(): Promise<void> {
    // This method is kept for compatibility
    return Promise.resolve();
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session for current user:', error);
        return null;
      }
      if (session?.user) {
        // Fetch user profile from our users table
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userProfile) {
          return {
            id: session.user.id,
            email: session.user.email!,
            name: userProfile.name || session.user.email?.split('@')[0] || '',
            createdAt: session.user.created_at,
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Unexpected error in getCurrentUser:', error);
      return null;
    }
  }

}