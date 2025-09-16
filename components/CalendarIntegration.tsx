import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Calendar, X, Check, Clock } from 'lucide-react-native';
import { useCalendar } from '../hooks/useCalendar';

interface CalendarIntegrationProps {
  debtTitle: string;
  dueDate: Date;
  onEventCreated?: (eventId: string) => void;
}

export default function CalendarIntegration({ 
  debtTitle, 
  dueDate, 
  onEventCreated 
}: CalendarIntegrationProps) {
  const { hasPermission, availableCalendars, isAvailable, createEvent, checkPermissions } = useCalendar();
  const [showModal, setShowModal] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const handleAddToCalendar = async () => {
    if (!isAvailable) {
      Alert.alert(
        'Calendar Not Available',
        'Calendar integration is not available on this platform.'
      );
      return;
    }

    if (!hasPermission) {
      const granted = await checkPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please grant calendar access to add debt reminders to your calendar.'
        );
        return;
      }
    }

    if (availableCalendars.length === 0) {
      Alert.alert(
        'No Calendars Available',
        'No writable calendars found on your device.'
      );
      return;
    }

    if (availableCalendars.length === 1) {
      // Only one calendar available, use it directly
      await createCalendarEvent(availableCalendars[0].id);
    } else {
      // Multiple calendars, show selection modal
      setShowModal(true);
    }
  };

  const createCalendarEvent = async (calendarId: string) => {
    try {
      setIsCreating(true);
      const eventId = await createEvent(
        Date.now().toString(),
        `Debt: ${debtTitle}`,
        dueDate,
        `Reminder: Debt payment due for ${debtTitle}`,
        calendarId
      );

      if (eventId) {
        Alert.alert(
          'Success',
          'Debt reminder added to your calendar!'
        );
        onEventCreated?.(eventId);
        setShowModal(false);
      } else {
        Alert.alert(
          'Error',
          'Failed to add event to calendar. Please try again.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An error occurred while adding to calendar.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.calendarButton}
        onPress={handleAddToCalendar}
        disabled={isCreating}
      >
        <Calendar size={20} color="#1652F0" strokeWidth={2} />
        <Text style={styles.calendarButtonText}>
          {isCreating ? 'Adding...' : 'Add to Calendar'}
        </Text>
      </TouchableOpacity>

      {/* Calendar Selection Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Calendar</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <X size={24} color="#5B616E" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Choose which calendar to add the debt reminder to:
            </Text>

            {availableCalendars.map((calendar) => (
              <TouchableOpacity
                key={calendar.id}
                style={[
                  styles.calendarOption,
                  selectedCalendarId === calendar.id && styles.selectedCalendarOption
                ]}
                onPress={() => setSelectedCalendarId(calendar.id)}
              >
                <View style={styles.calendarInfo}>
                  <View style={[
                    styles.calendarColor,
                    { backgroundColor: calendar.color || '#1652F0' }
                  ]} />
                  <View style={styles.calendarDetails}>
                    <Text style={styles.calendarName}>{calendar.title}</Text>
                    <Text style={styles.calendarSource}>{calendar.source.name}</Text>
                  </View>
                </View>
                {selectedCalendarId === calendar.id && (
                  <Check size={20} color="#1652F0" strokeWidth={2} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.addButton,
                !selectedCalendarId && styles.disabledButton
              ]}
              onPress={() => createCalendarEvent(selectedCalendarId)}
              disabled={!selectedCalendarId || isCreating}
            >
              <Text style={styles.addButtonText}>
                {isCreating ? 'Adding...' : 'Add to Calendar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1652F0',
  },
  calendarButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1652F0',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  modalDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    marginBottom: 24,
    lineHeight: 22,
  },
  calendarOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedCalendarOption: {
    backgroundColor: '#E8F4FD',
    borderWidth: 2,
    borderColor: '#1652F0',
  },
  calendarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  calendarColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  calendarDetails: {
    flex: 1,
  },
  calendarName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 2,
  },
  calendarSource: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  addButton: {
    backgroundColor: '#1652F0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#C1C8CD',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});