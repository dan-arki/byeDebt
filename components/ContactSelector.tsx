import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { User, Search, X, UserPlus, Settings } from 'lucide-react-native';
import { useContacts } from '../hooks/useContacts';
import { ContactService } from '../services/contactService';
import { Contact } from '../types/contact';
import { HapticService } from '../services/hapticService';

interface ContactSelectorProps {
  value: string;
  onContactSelect: (contact: Contact) => void;
  onTextChange: (text: string) => void;
  placeholder?: string;
}

export default function ContactSelector({ 
  value, 
  onContactSelect, 
  onTextChange,
  placeholder = "Enter person's name"
}: ContactSelectorProps) {
  const { 
    contacts, 
    searchResults, 
    permissionStatus, 
    loading, 
    searchContacts, 
    requestPermissions 
  } = useContacts();
  
  const [showContactModal, setShowContactModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 0) {
      searchContacts(searchQuery);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleContactPress = (contact: Contact) => {
    onContactSelect(contact);
    setShowContactModal(false);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleTextInputChange = (text: string) => {
    onTextChange(text);
    setSearchQuery(text);
  };

  const handleOpenContacts = async () => {
    if (!permissionStatus.granted) {
      HapticService.warning();
      const granted = await requestPermissions();
      if (!granted) {
        HapticService.error();
        Alert.alert(
          'Permission Required',
          'Please grant contact access to select from your contacts.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => HapticService.light() },
            { text: 'Settings', onPress: () => {
              HapticService.light();
              // On real device, this would open settings
              Alert.alert('Info', 'Please enable contact access in your device settings.');
            }}
          ]
        );
        return;
      }
    }
    HapticService.light();
    setShowContactModal(true);
  };

  const renderContactItem = (contact: Contact, onPress: () => void) => (
    <TouchableOpacity
      key={contact.id}
      style={styles.contactItem}
      onPress={() => {
        HapticService.selection();
        onPress();
      }}
    >
      <View style={styles.contactAvatar}>
        {contact.imageUri ? (
          <Image source={{ uri: contact.imageUri }} style={styles.contactImage} />
        ) : (
          <Text style={styles.contactInitials}>
            {ContactService.getContactInitials(contact)}
          </Text>
        )}
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>
          {ContactService.formatContactName(contact)}
        </Text>
        {contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
          <Text style={styles.contactPhone}>
            {contact.phoneNumbers[0]}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <User size={20} color="#5B616E" strokeWidth={2} />
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          value={value}
          onChangeText={handleTextInputChange}
          placeholderTextColor="#C1C8CD"
        />
        <TouchableOpacity
          style={styles.contactsButton}
          onPress={handleOpenContacts}
        >
          <UserPlus size={16} color="#1652F0" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Inline Suggestions */}
      {showSuggestions && searchResults.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView 
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {searchResults.slice(0, 5).map(({ contact }) =>
              renderContactItem(contact, () => {
                handleContactPress(contact);
              })
            )}
          </ScrollView>
        </View>
      )}

      {/* Full Contact List Modal */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Contact</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowContactModal(false)}
            >
              <X size={24} color="#5B616E" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.modalSearchContainer}>
            <View style={styles.modalSearchBar}>
              <Search size={20} color="#5B616E" strokeWidth={2} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search contacts"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#C1C8CD"
                autoFocus
              />
            </View>
          </View>

          {/* Contact List */}
          <ScrollView style={styles.modalContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1652F0" />
                <Text style={styles.loadingText}>Loading contacts...</Text>
              </View>
            ) : !permissionStatus.granted ? (
              <View style={styles.permissionContainer}>
                <UserPlus size={48} color="#C1C8CD" strokeWidth={1.5} />
                <Text style={styles.permissionTitle}>Contact Access Required</Text>
                <Text style={styles.permissionDescription}>
                  Grant access to your contacts to quickly select people when creating debts.
                </Text>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestPermissions}
                >
                  <Settings size={16} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.permissionButtonText}>Grant Access</Text>
                </TouchableOpacity>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <User size={48} color="#C1C8CD" strokeWidth={1.5} />
                <Text style={styles.emptyTitle}>
                  {searchQuery ? 'No contacts found' : 'No contacts available'}
                </Text>
                <Text style={styles.emptyDescription}>
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Add contacts to your device to see them here'
                  }
                </Text>
              </View>
            ) : (
              searchResults.map(({ contact }) =>
                renderContactItem(contact, () => handleContactPress(contact))
              )
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#050F19',
  },
  contactsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    maxHeight: 200,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  contactImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contactInitials: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1652F0',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
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
    paddingBottom: 16,
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
  modalSearchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#050F19',
  },
  modalContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    marginTop: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  permissionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1652F0',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    textAlign: 'center',
    lineHeight: 20,
  },
});