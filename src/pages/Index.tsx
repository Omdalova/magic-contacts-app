import { useState, useEffect } from 'react';
import { ContactsView } from '@/components/ContactsView';
import { ContactDetail } from '@/components/ContactDetail';
import { SettingsView } from '@/components/SettingsView';
import { FirstTimeSetup } from '@/components/FirstTimeSetup';
import { useContactsStore } from '@/hooks/useContactsStore';
import { useMagicLogic } from '@/hooks/useMagicLogic';

export type View = 'contacts' | 'detail' | 'settings' | 'setup';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('contacts');
  const [selectedContact, setSelectedContact] = useState<string>('');
  const { state, isFirstTime } = useContactsStore();
  const { getForcedReveal } = useMagicLogic();

  // Force re-render when state changes by using state dependencies
  useEffect(() => {
    // This effect will run whenever state.contacts changes
    // ensuring the UI updates immediately
  }, [state.contacts, state.forcedData, state.forcedSearchResults]);

  useEffect(() => {
    if (isFirstTime()) {
      setCurrentView('setup');
    }
  }, [isFirstTime]);

  const handleContactSelect = (contactName: string) => {
    setSelectedContact(contactName);
    setCurrentView('detail');
  };

  const handleBackToContacts = () => {
    setCurrentView('contacts');
    setSelectedContact('');
  };

  const handleOpenSettings = () => {
    setCurrentView('settings');
  };

  const handleExitSettings = () => {
    setCurrentView('contacts');
  };

  const handleSetupComplete = () => {
    setCurrentView('contacts');
  };

  const getContactDetails = (contactName: string) => {
    return getForcedReveal(contactName);
  };

  return (
    <div className="min-h-screen bg-background pb-safe pt-safe">
      <div className="max-w-md mx-auto bg-surface shadow-lg min-h-screen relative overflow-hidden">
        {currentView === 'contacts' && (
          <ContactsView
            contacts={state.contacts}
            onContactSelect={handleContactSelect}
            onOpenSettings={handleOpenSettings}
          />
        )}
        
        {currentView === 'detail' && (
          <ContactDetail
            contactName={selectedContact}
            contactData={getContactDetails(selectedContact)}
            onBack={handleBackToContacts}
          />
        )}
        
        {currentView === 'settings' && (
          <SettingsView onExit={handleExitSettings} />
        )}
        
        {currentView === 'setup' && (
          <FirstTimeSetup onComplete={handleSetupComplete} />
        )}
      </div>
    </div>
  );
};

export default Index;