export interface NotificationPreference {
  id: string;
  debtId: string;
  type: 'default' | 'custom';
  daysBefore: number;
  hoursBefore: number;
  minutesBefore: number;
  isEnabled: boolean;
  createdAt: string;
}

export interface ScheduledNotification {
  id: string;
  debtId: string;
  title: string;
  body: string;
  scheduledDate: Date;
  isDelivered: boolean;
  notificationId?: string;
}

export interface CalendarEvent {
  id: string;
  debtId: string;
  calendarEventId: string;
  calendarProvider: 'google' | 'outlook' | 'apple' | 'default';
  eventTitle: string;
  eventDate: Date;
  isSynced: boolean;
  createdAt: string;
}

export const DEFAULT_NOTIFICATION_PRESETS = [
  { label: '1 week before', days: 7, hours: 0, minutes: 0 },
  { label: '2 days before', days: 2, hours: 0, minutes: 0 },
  { label: '1 day before', days: 1, hours: 0, minutes: 0 },
  { label: '1 hour before', days: 0, hours: 1, minutes: 0 },
  { label: '30 minutes before', days: 0, hours: 0, minutes: 30 },
];