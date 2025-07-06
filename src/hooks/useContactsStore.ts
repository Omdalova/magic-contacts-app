import { useState, useEffect, useCallback } from 'react';
import { ContactsState, Contact, ForcedData } from '@/types';

const STATE_KEY = 'magicContactsState';

const defaultState: ContactsState = {
  contacts: [],
  forcedData: [],
  forcedSearchResults: [],
  revealIndex: 0,
  revealMap: {},
  userProfileName: "Mido's Phone"
};

export const useContactsStore = () => {
  const [state, setState] = useState<ContactsState>(defaultState);

  const loadState = useCallback(() => {
    try {
      const savedState = localStorage.getItem(STATE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setState({ ...defaultState, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  }, []);

  const saveState = useCallback((newState: ContactsState) => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(newState));
      setState(newState);
      // Force a re-render by triggering a storage event
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }, []);

  const isFirstTime = useCallback(() => {
    return !localStorage.getItem(STATE_KEY);
  }, []);

  const addForcedData = useCallback((data: ForcedData) => {
    const newState = { ...state, forcedData: [...state.forcedData, data] };
    saveState(newState);
  }, [state, saveState]);

  const removeForcedData = useCallback((index: number) => {
    const newForcedData = [...state.forcedData];
    newForcedData.splice(index, 1);
    const newState = { ...state, forcedData: newForcedData };
    saveState(newState);
  }, [state, saveState]);

  const setContacts = useCallback((contacts: Contact[]) => {
    const newState = { ...state, contacts };
    saveState(newState);
  }, [state, saveState]);

  const removeContact = useCallback((index: number) => {
    const newContacts = [...state.contacts];
    newContacts.splice(index, 1);
    const newState = { ...state, contacts: newContacts };
    saveState(newState);
  }, [state, saveState]);

  const updateContact = useCallback((index: number, newData: Contact) => {
    const newContacts = [...state.contacts];
    newContacts[index] = newData;
    const newState = { ...state, contacts: newContacts };
    saveState(newState);
  }, [state, saveState]);

  const setForcedSearchResults = useCallback((results: string[]) => {
    const newState = { ...state, forcedSearchResults: results };
    saveState(newState);
  }, [state, saveState]);

  const mapContact = useCallback((name: string, index: number) => {
    const newRevealMap = { ...state.revealMap, [name]: index };
    const newState = { 
      ...state, 
      revealMap: newRevealMap, 
      revealIndex: state.revealIndex + 1 
    };
    saveState(newState);
  }, [state, saveState]);

  const resetRevealState = useCallback(() => {
    const newState = { ...state, revealIndex: 0, revealMap: {} };
    saveState(newState);
  }, [state, saveState]);

  const setUserProfileName = useCallback((name: string) => {
    const newState = { ...state, userProfileName: name };
    saveState(newState);
  }, [state, saveState]);

  const updateState = useCallback((newState: Partial<ContactsState>) => {
    const updatedState = { ...state, ...newState };
    saveState(updatedState);
  }, [state, saveState]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resetRevealState();
      }
    };

    const handleFocus = () => {
      // Refresh state when app comes back into focus
      loadState();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [resetRevealState, loadState]);

  return {
    state,
    isFirstTime,
    addForcedData,
    removeForcedData,
    setContacts,
    removeContact,
    updateContact,
    setForcedSearchResults,
    mapContact,
    resetRevealState,
    setUserProfileName,
    updateState
  };
};