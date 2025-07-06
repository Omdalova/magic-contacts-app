import { useCallback } from 'react';
import { useContactsStore } from './useContactsStore';
import { ForcedData, Contact, ProfileConfig } from '@/types';

export const useMagicLogic = () => {
  const { state, mapContact } = useContactsStore();

  const getForcedReveal = useCallback((contactName: string): ForcedData => {
    const { contacts, forcedData, revealIndex, revealMap } = state;
    
    // If no forced data, return real contact data
    if (forcedData.length === 0) {
      const realContact = contacts.find(c => c.name === contactName);
      return { phone: realContact?.phone || 'N/A' };
    }

    // If contact already mapped, return the same data
    if (revealMap.hasOwnProperty(contactName)) {
      return forcedData[revealMap[contactName]];
    }

    // Map to next available forced data
    const newIndex = revealIndex;
    if (newIndex >= forcedData.length) {
      const realContact = contacts.find(c => c.name === contactName);
      return { phone: realContact?.phone || 'N/A' };
    }

    mapContact(contactName, newIndex);
    return forcedData[newIndex];
  }, [state, mapContact]);

  const parseVCF = useCallback((vcfText: string): Contact[] => {
    const contacts: Contact[] = [];
    const entries = vcfText.split('END:VCARD');
    
    for (const entry of entries) {
      if (!entry.includes('BEGIN:VCARD')) continue;
      
      let name = '', phone = '';
      
      // Extract name
      const fnMatch = entry.match(/^FN(?:;CHARSET=UTF-8)?:(.*)$/im);
      if (fnMatch && fnMatch[1]) {
        try {
          name = decodeURIComponent(escape(fnMatch[1].replace(/=([A-F0-9]{2})/g, "%$1"))).trim();
        } catch {
          name = fnMatch[1].trim();
        }
      }
      
      // Extract phone
      const telMatch = entry.match(/^TEL(?:;[^:]+)?:(.*)$/im);
      if (telMatch && telMatch[1]) {
        phone = telMatch[1].trim();
      }
      
      if (name) {
        contacts.push({ name, phone });
      }
    }
    
    return contacts.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const exportProfile = useCallback((): string => {
    const configToSave: ProfileConfig = {
      forcedData: state.forcedData,
      forcedSearchResults: state.forcedSearchResults,
    };
    
    const jsonString = JSON.stringify(configToSave);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);
    return btoa(String.fromCharCode.apply(null, Array.from(data)));
  }, [state]);

  const importProfile = useCallback((code: string): boolean => {
    try {
      const decoder = new TextDecoder();
      const binaryData = Uint8Array.from(atob(code), c => c.charCodeAt(0));
      const jsonString = decoder.decode(binaryData);
      const loadedConfig: ProfileConfig = JSON.parse(jsonString);
      
      return true; // Return true for successful parsing
    } catch (error) {
      console.error("Import failed:", error);
      return false;
    }
  }, []);

  return {
    getForcedReveal,
    parseVCF,
    exportProfile,
    importProfile
  };
};