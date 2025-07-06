export interface Contact {
  name: string;
  phone?: string;
}

export interface ForcedData {
  phone?: string;
  email?: string;
  birthday?: string;
  address?: string;
  notes?: string;
}

export interface ContactsState {
  contacts: Contact[];
  forcedData: ForcedData[];
  forcedSearchResults: string[];
  revealIndex: number;
  revealMap: Record<string, number>;
  userProfileName: string;
}

export interface ProfileConfig {
  forcedData: ForcedData[];
  forcedSearchResults: string[];
}