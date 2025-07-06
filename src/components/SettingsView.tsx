import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useContactsStore } from '@/hooks/useContactsStore';
import { useMagicLogic } from '@/hooks/useMagicLogic';
import { ForcedData } from '@/types';

interface SettingsViewProps {
  onExit: () => void;
}

export const SettingsView = ({ onExit }: SettingsViewProps) => {
  const [activeTab, setActiveTab] = useState('data');
  const [forcedInputs, setForcedInputs] = useState<ForcedData>({});
  const [searchResults, setSearchResults] = useState('');
  const [profileCode, setProfileCode] = useState('');
  const [profileName, setProfileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    state, 
    addForcedData, 
    removeForcedData, 
    setContacts, 
    removeContact, 
    updateContact,
    setForcedSearchResults,
    setUserProfileName,
    updateState
  } = useContactsStore();
  
  const { parseVCF, exportProfile, importProfile } = useMagicLogic();

  // Initialize form values from state
  useEffect(() => {
    setSearchResults(state.forcedSearchResults.join(', '));
    setProfileName(state.userProfileName);
  }, [state.forcedSearchResults, state.userProfileName]);

  const handleAddForcedData = () => {
    const hasData = Object.values(forcedInputs).some(value => value?.trim());
    if (!hasData) {
      alert("Please enter at least one piece of data.");
      return;
    }
    
    addForcedData(forcedInputs);
    setForcedInputs({});
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const vcfText = e.target?.result as string;
      if (vcfText) {
        const contacts = parseVCF(vcfText);
        setContacts(contacts);
      }
    };
    reader.readAsText(file);
  };

  const handleExportProfile = () => {
    const code = exportProfile();
    setProfileCode(code);
    navigator.clipboard.writeText(code).then(() => {
      alert("Profile code copied to clipboard!");
    });
  };

  const handleFactoryReset = async () => {
    if (!confirm("Are you sure? This will delete all data and settings.")) return;
    
    try {
      localStorage.clear();
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
      alert("App has been reset. It will now reload.");
      window.location.reload();
    } catch (error) {
      alert("Could not complete reset. Please clear browser data manually.");
    }
  };

  const handleExit = () => {
    // Save all settings before exiting
    const results = searchResults.split(',').map(s => s.trim()).filter(Boolean);
    setForcedSearchResults(results);
    
    if (profileName.trim() && profileName !== state.userProfileName) {
      setUserProfileName(profileName.trim());
    }
    
    onExit();
  };

  return (
    <div className="flex flex-col h-screen bg-background animate-slide-in-right">
      {/* Header */}
      <div className="bg-surface px-4 py-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Secret Settings</h1>
      </div>

      {/* Tab Navigation */}
      <div className="bg-surface border-b border-border">
        <div className="flex">
          {[
            { id: 'data', label: 'Forced Data' },
            { id: 'search', label: 'Search' },
            { id: 'import', label: 'Import' },
            { id: 'profile', label: 'Profile' },
            { id: 'settings', label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'data' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Forced Data Management</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter data for consistent reveals. Fields are optional.
              </p>
            </div>
            
            <div className="space-y-3">
              <Input
                placeholder="Phone"
                value={forcedInputs.phone || ''}
                onChange={(e) => setForcedInputs(prev => ({ ...prev, phone: e.target.value }))}
              />
              <Input
                placeholder="Email"
                value={forcedInputs.email || ''}
                onChange={(e) => setForcedInputs(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                placeholder="Birthday"
                value={forcedInputs.birthday || ''}
                onChange={(e) => setForcedInputs(prev => ({ ...prev, birthday: e.target.value }))}
              />
              <Input
                placeholder="Address"
                value={forcedInputs.address || ''}
                onChange={(e) => setForcedInputs(prev => ({ ...prev, address: e.target.value }))}
              />
              <Textarea
                placeholder="Notes"
                value={forcedInputs.notes || ''}
                onChange={(e) => setForcedInputs(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
            
            <Button onClick={handleAddForcedData} className="w-full">
              Add Forced Entry
            </Button>
            
            {state.forcedData.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Current Forced Data:</h4>
                <div className="space-y-2">
                  {state.forcedData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">
                        {Object.values(entry).filter(v => v).join(' / ') || 'Empty Entry'}
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeForcedData(index)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Forced Search Results</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter names to show when any 3+ digits are searched. Separate with commas.
              </p>
            </div>
            
            <Input
              placeholder="e.g. John Doe, Jane Smith"
              value={searchResults}
              onChange={(e) => setSearchResults(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'import' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Import & Edit Contacts</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a .vcf file from your device to load contacts.
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".vcf,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button onClick={() => fileInputRef.current?.click()} className="w-full">
              Choose VCF File
            </Button>
            
            {state.contacts.length > 0 && (
              <div className="mt-6">
                <p className="text-center mb-4">{state.contacts.length} contacts loaded</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {state.contacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">{contact.name}</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeContact(index)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Profile Management</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Export your settings to share or backup your configuration.
              </p>
            </div>
            
            <div className="space-y-3">
              <Textarea
                placeholder="Your setup code will appear here..."
                value={profileCode}
                readOnly
                rows={5}
              />
              <div className="flex space-x-2">
                <Button onClick={handleExportProfile} className="flex-1">
                  Export Config
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => navigator.clipboard.writeText(profileCode)}
                  disabled={!profileCode}
                  className="flex-1"
                >
                  Copy Code
                </Button>
              </div>
            </div>
            
            <hr className="border-border" />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Full App Reset</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will completely wipe all data, settings, and caches.
              </p>
              <Button variant="destructive" onClick={handleFactoryReset} className="w-full">
                Factory Reset App
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">App Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Customize your app profile and preferences.
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Profile Name
                </label>
                <Input
                  placeholder="e.g. Mido's Phone"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This name will appear at the top of your contacts list
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-surface border-t border-border p-4">
        <Button onClick={handleExit} className="w-full">
          Save & Exit Settings
        </Button>
      </div>
    </div>
  );
};