import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Bell, X, Plus, Trash2, Clock } from 'lucide-react-native';
import { useNotifications } from '../hooks/useNotifications';
import { DEFAULT_NOTIFICATION_PRESETS } from '../types/notification';

interface NotificationSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationSettings({ visible, onClose }: NotificationSettingsProps) {
  const { 
    preferences, 
    hasPermission, 
    addCustomNotification, 
    removeNotification, 
    toggleNotification,
    checkPermissions 
  } = useNotifications();
  
  const [showPresets, setShowPresets] = useState(false);

  const handleAddPreset = async (preset: typeof DEFAULT_NOTIFICATION_PRESETS[0]) => {
    try {
      await addCustomNotification(preset.days, preset.hours, preset.minutes);
      setShowPresets(false);
      Alert.alert('Success', 'Notification reminder added!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add notification reminder.');
    }
  };

  const handleRemoveNotification = (preferenceId: string) => {
    Alert.alert(
      'Remove Notification',
      'Are you sure you want to remove this notification reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeNotification(preferenceId) }
      ]
    );
  };

  const formatNotificationTime = (daysBefore: number, hoursBefore: number, minutesBefore: number) => {
    if (daysBefore > 0) {
      return daysBefore === 1 ? '1 day before' : `${daysBefore} days before`;
    } else if (hoursBefore > 0) {
      return hoursBefore === 1 ? '1 hour before' : `${hoursBefore} hours before`;
    } else if (minutesBefore > 0) {
      return `${minutesBefore} minutes before`;
    }
    return 'At due time';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notification Settings</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#5B616E" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Permission Status */}
          {!hasPermission && (
            <View style={styles.permissionAlert}>
              <Bell size={20} color="#FF4747" strokeWidth={2} />
              <View style={styles.permissionText}>
                <Text style={styles.permissionTitle}>Notifications Disabled</Text>
                <Text style={styles.permissionDescription}>
                  Enable notifications to receive debt reminders
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.enableButton}
                onPress={checkPermissions}
              >
                <Text style={styles.enableButtonText}>Enable</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Current Notifications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Reminders</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowPresets(true)}
              >
                <Plus size={16} color="#1652F0" strokeWidth={2} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {preferences.map((pref) => (
              <View key={pref.id} style={styles.notificationItem}>
                <View style={styles.notificationLeft}>
                  <Clock size={20} color="#5B616E" strokeWidth={2} />
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationTime}>
                      {formatNotificationTime(pref.daysBefore, pref.hoursBefore, pref.minutesBefore)}
                    </Text>
                    <Text style={styles.notificationLabel}>
                      {pref.type === 'default' ? 'Default reminder' : 'Custom reminder'}
                    </Text>
                  </View>
                </View>
                <View style={styles.notificationRight}>
                  <Switch
                    value={pref.isEnabled}
                    onValueChange={() => toggleNotification(pref.id)}
                    trackColor={{ false: '#E5E7EB', true: '#1652F0' }}
                    thumbColor="#FFFFFF"
                  />
                  {pref.type === 'custom' && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleRemoveNotification(pref.id)}
                    >
                      <Trash2 size={16} color="#FF4747" strokeWidth={2} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Preset Selection Modal */}
        <Modal
          visible={showPresets}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.presetContainer}>
            <View style={styles.presetHeader}>
              <Text style={styles.presetTitle}>Add Reminder</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPresets(false)}
              >
                <X size={24} color="#5B616E" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.presetContent}>
              <Text style={styles.presetDescription}>
                Choose when you'd like to be reminded about upcoming debt payments:
              </Text>

              {DEFAULT_NOTIFICATION_PRESETS.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.presetOption}
                  onPress={() => handleAddPreset(preset)}
                >
                  <Clock size={20} color="#1652F0" strokeWidth={2} />
                  <Text style={styles.presetLabel}>{preset.label}</Text>
                  <Plus size={16} color="#5B616E" strokeWidth={2} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  title: {
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  permissionAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4747',
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  enableButton: {
    backgroundColor: '#FF4747',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  enableButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1652F0',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTime: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 2,
  },
  notificationLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  notificationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  presetTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
  },
  presetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  presetDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    marginBottom: 24,
    lineHeight: 22,
  },
  presetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  presetLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#050F19',
  },
});