import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { CalendarEvent } from '../types/notification';

export class CalendarService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      return false;
    }
  }

  static async getAvailableCalendars(): Promise<Calendar.Calendar[]> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Calendar permission not granted');
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      // Filter to writable calendars only
      return calendars.filter(calendar => calendar.allowsModifications);
    } catch (error) {
      console.error('Error getting calendars:', error);
      return [];
    }
  }

  static async createDebtEvent(
    debtId: string,
    title: string,
    dueDate: Date,
    description?: string,
    calendarId?: string
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Calendar permission required');
      }

      let targetCalendarId = calendarId;
      
      if (!targetCalendarId) {
        const calendars = await this.getAvailableCalendars();
        const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
        if (!defaultCalendar) {
          throw new Error('No writable calendar found');
        }
        targetCalendarId = defaultCalendar.id;
      }

      // Create all-day event for the due date
      const eventId = await Calendar.createEventAsync(targetCalendarId, {
        title: `💰 ${title}`,
        startDate: dueDate,
        endDate: dueDate,
        allDay: true,
        notes: description || `Debt due: ${title}`,
        alarms: [
          { relativeOffset: -2 * 24 * 60 }, // 2 days before
          { relativeOffset: -24 * 60 }, // 1 day before
        ],
      });

      return eventId;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  }

  static async updateDebtEvent(
    eventId: string,
    title: string,
    dueDate: Date,
    description?: string
  ): Promise<boolean> {
    try {
      await Calendar.updateEventAsync(eventId, {
        title: `💰 ${title}`,
        startDate: dueDate,
        endDate: dueDate,
        notes: description || `Debt due: ${title}`,
      });
      return true;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return false;
    }
  }

  static async deleteDebtEvent(eventId: string): Promise<boolean> {
    try {
      await Calendar.deleteEventAsync(eventId);
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return false;
    }
  }

  static async checkCalendarAvailability(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false; // Calendar API not available on web
    }
    
    try {
      const hasPermission = await this.requestPermissions();
      return hasPermission;
    } catch (error) {
      return false;
    }
  }
}