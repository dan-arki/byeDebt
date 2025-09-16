import { useState, useEffect } from 'react';
import { Contact, ContactSearchResult, ContactPermissionStatus } from '../types/contact';
import { ContactService } from '../services/contactService';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<ContactPermissionStatus>({
    granted: false,
    canAskAgain: true,
  });
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<ContactSearchResult[]>([]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const permission = await ContactService.requestPermissions();
      setPermissionStatus(permission);

      if (permission.granted) {
        const contactList = await ContactService.getAllContacts();
        setContacts(contactList);
        setSearchResults(contactList.map(contact => ({ contact, matchScore: 0 })));
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchContacts = (query: string) => {
    const results = ContactService.searchContacts(contacts, query);
    setSearchResults(results);
    return results;
  };

  const requestPermissions = async (): Promise<boolean> => {
    const permission = await ContactService.requestPermissions();
    setPermissionStatus(permission);
    
    if (permission.granted) {
      await loadContacts();
    }
    
    return permission.granted;
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return {
    contacts,
    searchResults,
    permissionStatus,
    loading,
    searchContacts,
    requestPermissions,
    refreshContacts: loadContacts,
  };
}