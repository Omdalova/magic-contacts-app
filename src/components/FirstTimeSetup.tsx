import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMagicLogic } from '@/hooks/useMagicLogic';
import { useContactsStore } from '@/hooks/useContactsStore';

interface FirstTimeSetupProps {
  onComplete: () => void;
}

export const FirstTimeSetup = ({ onComplete }: FirstTimeSetupProps) => {
  const [profileCode, setProfileCode] = useState('');
  const { importProfile } = useMagicLogic();
  const { updateState } = useContactsStore();

  const handleImportProfile = () => {
    const code = profileCode.trim();
    if (!code) {
      alert("Please paste a Setup Code.");
      return;
    }

    if (importProfile(code)) {
      alert("Profile loaded successfully!");
      onComplete();
    } else {
      alert("Invalid or corrupt Setup Code.");
    }
  };

  const handleManualSetup = () => {
    // Initialize with empty state
    updateState({
      contacts: [],
      forcedData: [],
      forcedSearchResults: [],
      revealIndex: 0,
      revealMap: {}
    });
    onComplete();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-surface px-4 py-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Welcome</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Setup Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              To begin, please enter your Setup Code, or continue to manual setup.
            </p>
          </div>
          
          <div className="space-y-3">
            <Textarea
              placeholder="Paste Setup Code here..."
              value={profileCode}
              onChange={(e) => setProfileCode(e.target.value)}
              rows={5}
            />
            <Button onClick={handleImportProfile} className="w-full">
              Load Profile
            </Button>
          </div>
          
          <hr className="border-border" />
          
          <Button variant="secondary" onClick={handleManualSetup} className="w-full">
            Manual Setup
          </Button>
        </div>
      </div>
    </div>
  );
};