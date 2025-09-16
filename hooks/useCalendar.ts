import { useState, useEffect } from 'react';
import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { CalendarService } from '../services/calendarService';

export function useCalendar() {
  const [hasPermission, setHasPermission] = useState(false);
  const [availableCalendars, setAvailableCalendars] = useState<Calendar.Calendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(Platform.OS !== 'web');

  const checkPermissions = async () => {
    try {
      if (!isAvailable) {
        setLoading(false);
        return;
      }

      const permission = await CalendarService.requestPermissions();
      setHasPermission(permission);

      if (permission) {
        const calendars = await CalendarService.getAvailableCalendars();
        setAvailableCalendars(calendars);
      }
    } catch (error) {
      console.error('Error checking calendar permissions:', error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (
    debtId: string,
    title: string,
    dueDate: Date,
    description?: string,
    calendarId?: string
  ): Promise<string | null> => {
    if (!isAvailable || !hasPermission) {
      return null;
    }

    return await CalendarService.createDebtEvent(
      debtId,
      title,
      dueDate,
      description,
      calendarId
    );
  };

  const updateEvent = async (
    eventId: string,
    title: string,
    dueDate: Date,
    description?: string
  ): Promise<boolean> => {
    if (!isAvailable || !hasPermission) {
      return false;
    }

    return await CalendarService.updateDebtEvent(eventId, title, dueDate, description);
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    if (!isAvailable || !hasPermission) {
      return false;
    }

    return await CalendarService.deleteDebtEvent(eventId);
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return {
    hasPermission,
    availableCalendars,
    loading,
    isAvailable,
    createEvent,
    updateEvent,
    deleteEvent,
    checkPermissions,
  };
}