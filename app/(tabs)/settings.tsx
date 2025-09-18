import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Trash2, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/authService';
import { HapticService } from '@/services/hapticService';

export default function SettingsScreen() {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible et supprimera toutes vos données.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => HapticService.light(),
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      HapticService.impact();

      await AuthService.deleteAccount();
      
      HapticService.success();
      
      Alert.alert(
        'Compte supprimé',
        'Votre compte a été supprimé avec succès.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigation will be handled by _layout.tsx when auth state changes
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting account:', error);
      HapticService.error();
      
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la suppression de votre compte. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGoBack = () => {
    HapticService.light();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            disabled={isDeleting}
          >
            <ArrowLeft size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <View style={styles.placeholder} />
        </View>

        {/* User Info */}
        {user && (
          <View style={styles.userSection}>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        )}

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zone de danger</Text>
          
          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            <View style={styles.deleteButtonContent}>
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Trash2 size={20} color="#FFFFFF" />
              )}
              <Text style={styles.deleteButtonText}>
                {isDeleting ? 'Suppression...' : 'Supprimer le compte'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.deleteWarning}>
            Cette action supprimera définitivement votre compte et toutes vos données.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  userSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteWarning: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});