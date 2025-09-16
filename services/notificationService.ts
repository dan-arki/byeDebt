import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationPreference, ScheduledNotification } from '../types/notification';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return false; // Push notifications not fully supported on web
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleDebtNotification(
    debtId: string,
    personName: string,
    amount: number,
    dueDate: Date,
    preferences: NotificationPreference[]
  ): Promise<ScheduledNotification[]> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permission not granted');
      }

      const scheduledNotifications: ScheduledNotification[] = [];

      for (const pref of preferences) {
        if (!pref.isEnabled) continue;

        const notificationDate = new Date(dueDate);
        notificationDate.setDate(notificationDate.getDate() - pref.daysBefore);
        notificationDate.setHours(notificationDate.getHours() - pref.hoursBefore);
        notificationDate.setMinutes(notificationDate.getMinutes() - pref.minutesBefore);

        // Don't schedule notifications in the past
        if (notificationDate <= new Date()) continue;

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '💰 Debt Reminder',
            body: `${personName} - $${amount.toFixed(2)} due ${this.formatTimeUntilDue(pref)}`,
            data: { debtId, type: 'debt_reminder' },
            sound: true,
          },
          trigger: notificationDate,
        });

        scheduledNotifications.push({
          id: `${debtId}_${pref.id}`,
          debtId,
          title: '💰 Debt Reminder',
          body: `${personName} - $${amount.toFixed(2)} due ${this.formatTimeUntilDue(pref)}`,
          scheduledDate: notificationDate,
          isDelivered: false,
          notificationId,
        });
      }

      return scheduledNotifications;
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      return [];
    }
  }

  static async cancelDebtNotifications(debtId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.debtId === debtId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  static async updateDebtNotifications(
    debtId: string,
    personName: string,
    amount: number,
    dueDate: Date,
    preferences: NotificationPreference[]
  ): Promise<void> {
    // Cancel existing notifications
    await this.cancelDebtNotifications(debtId);
    
    // Schedule new notifications
    await this.scheduleDebtNotification(debtId, personName, amount, dueDate, preferences);
  }

  private static formatTimeUntilDue(preference: NotificationPreference): string {
    if (preference.daysBefore > 0) {
      return preference.daysBefore === 1 ? 'tomorrow' : `in ${preference.daysBefore} days`;
    } else if (preference.hoursBefore > 0) {
      return preference.hoursBefore === 1 ? 'in 1 hour' : `in ${preference.hoursBefore} hours`;
    } else if (preference.minutesBefore > 0) {
      return `in ${preference.minutesBefore} minutes`;
    }
    return 'now';
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}