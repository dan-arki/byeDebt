export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  phoneNumbers?: string[];
  emails?: string[];
  imageUri?: string;
}

export interface ContactSearchResult {
  contact: Contact;
  matchScore: number;
}

export interface ContactPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}