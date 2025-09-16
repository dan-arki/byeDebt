import { useState, useEffect } from 'react';
import { NotificationPreference, DEFAULT_NOTIFICATION_PRESETS } from '../types/notification';
import { NotificationService } from '../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';

export function useNotifications() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      } else {
        // Set default preferences
        const defaultPrefs: NotificationPreference[] = [{
          id: 'default',
          debtId: 'default',
          type: 'default',
          daysBefore: 2,
          hoursBefore: 0,
          minutesBefore: 0,
          isEnabled: true,
          createdAt: new Date().toISOString(),
        }];
        setPreferences(defaultPrefs);
        await AsyncStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(defaultPrefs));
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    const permission = await NotificationService.requestPermissions();
    setHasPermission(permission);
  };

  const updatePreferences = async (newPreferences: NotificationPreference[]) => {
    try {
      setPreferences(newPreferences);
      await AsyncStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  };

  const addCustomNotification = async (
    daysBefore: number,
    hoursBefore: number = 0,
    minutesBefore: number = 0
  ): Promise<NotificationPreference> => {
    const newPreference: NotificationPreference = {
      id: Date.now().toString(),
      debtId: 'default',
      type: 'custom',
      daysBefore,
      hoursBefore,
      minutesBefore,
      isEnabled: true,
      createdAt: new Date().toISOString(),
    };

    const updatedPreferences = [...preferences, newPreference];
    await updatePreferences(updatedPreferences);
    return newPreference;
  };

  const removeNotification = async (preferenceId: string) => {
    const updatedPreferences = preferences.filter(pref => pref.id !== preferenceId);
    await updatePreferences(updatedPreferences);
  };

  const toggleNotification = async (preferenceId: string) => {
    const updatedPreferences = preferences.map(pref =>
      pref.id === preferenceId ? { ...pref, isEnabled: !pref.isEnabled } : pref
    );
    await updatePreferences(updatedPreferences);
  };

  useEffect(() => {
    loadPreferences();
    checkPermissions();
  }, []);

  return {
    preferences,
    hasPermission,
    loading,
    updatePreferences,
    addCustomNotification,
    removeNotification,
    toggleNotification,
    checkPermissions,
  };
}