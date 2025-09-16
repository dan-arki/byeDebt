import * as Contacts from 'expo-contacts';
import { Platform } from 'react-native';
import { Contact, ContactSearchResult, ContactPermissionStatus } from '../types/contact';

export class ContactService {
  static async requestPermissions(): Promise<ContactPermissionStatus> {
    try {
      if (Platform.OS === 'web') {
        return { granted: false, canAskAgain: false };
      }

      const { status, canAskAgain } = await Contacts.requestPermissionsAsync();
      return {
        granted: status === 'granted',
        canAskAgain: canAskAgain || false,
      };
    } catch (error) {
      console.error('Error requesting contact permissions:', error);
      return { granted: false, canAskAgain: false };
    }
  }

  static async getAllContacts(): Promise<Contact[]> {
    try {
      const permissionStatus = await this.requestPermissions();
      if (!permissionStatus.granted) {
        throw new Error('Contact permission not granted');
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.FirstName,
          Contacts.Fields.LastName,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Image,
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      return data.map(contact => ({
        id: contact.id,
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
        phoneNumbers: contact.phoneNumbers?.map(phone => phone.number) || [],
        emails: contact.emails?.map(email => email.email) || [],
        imageUri: contact.imageAvailable ? contact.image?.uri : undefined,
      })).filter(contact => contact.name.length > 0);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  }

  static searchContacts(contacts: Contact[], query: string): ContactSearchResult[] {
    if (!query.trim()) {
      return contacts.map(contact => ({ contact, matchScore: 0 }));
    }

    const searchTerm = query.toLowerCase().trim();
    const results: ContactSearchResult[] = [];

    for (const contact of contacts) {
      let matchScore = 0;
      const fullName = contact.name.toLowerCase();
      const firstName = contact.firstName.toLowerCase();
      const lastName = contact.lastName.toLowerCase();

      // Exact name match (highest priority)
      if (fullName === searchTerm) {
        matchScore = 100;
      }
      // Starts with search term
      else if (fullName.startsWith(searchTerm)) {
        matchScore = 90;
      }
      // First name starts with search term
      else if (firstName.startsWith(searchTerm)) {
        matchScore = 80;
      }
      // Last name starts with search term
      else if (lastName.startsWith(searchTerm)) {
        matchScore = 75;
      }
      // Contains search term
      else if (fullName.includes(searchTerm)) {
        matchScore = 60;
      }
      // First name contains search term
      else if (firstName.includes(searchTerm)) {
        matchScore = 50;
      }
      // Last name contains search term
      else if (lastName.includes(searchTerm)) {
        matchScore = 45;
      }

      if (matchScore > 0) {
        results.push({ contact, matchScore });
      }
    }

    // Sort by match score (highest first)
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  static formatContactName(contact: Contact): string {
    if (contact.name) {
      return contact.name;
    }
    return `${contact.firstName} ${contact.lastName}`.trim() || 'Unknown Contact';
  }

  static getContactInitials(contact: Contact): string {
    const firstName = contact.firstName || '';
    const lastName = contact.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    } else if (lastName) {
      return lastName.substring(0, 2).toUpperCase();
    } else if (contact.name) {
      const nameParts = contact.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return contact.name.substring(0, 2).toUpperCase();
    }
    
    return '??';
  }
}