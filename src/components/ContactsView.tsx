import { useState, useRef, useEffect, useMemo } from 'react';
import { Contact } from '@/types';
import { ContactAvatar } from './ContactAvatar';
import { FloatingActionButton } from './ui/FloatingActionButton';
import { useContactsStore } from '@/hooks/useContactsStore';
import { Search, QrCode, MoreVertical, Menu, X, ArrowLeft } from 'lucide-react';

interface ContactsViewProps {
  contacts: Contact[];
  onContactSelect: (contactName: string) => void;
  onOpenSettings: () => void;
}

export const ContactsView = ({ contacts, onContactSelect, onOpenSettings }: ContactsViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [tapCount, setTapCount] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState('');
  const { state, resetRevealState } = useContactsStore();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const pressTimer = useRef<NodeJS.Timeout>();
  const tapTimer = useRef<NodeJS.Timeout>();

  // Generate alphabet array for sidebar
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

  // Group contacts by first letter
  const groupedContacts = useMemo(() => {
    const groups: Record<string, Contact[]> = {};
    contacts.forEach(contact => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
      if (!groups[key]) groups[key] = [];
      groups[key].push(contact);
    });
    return groups;
  }, [contacts]);

  // Get a random contact from imported contacts for "What's new"
  const whatsNewContact = useMemo(() => {
    if (contacts.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * contacts.length);
    return contacts[randomIndex];
  }, [contacts]);

  // Update filtered contacts when contacts change
  useEffect(() => {
    if (selectedLetter) {
      setFilteredContacts(groupedContacts[selectedLetter] || []);
    } else {
      setFilteredContacts(contacts);
    }
  }, [contacts, selectedLetter, groupedContacts]);

  // Randomize search results with relevant digit matching
  const getRandomizedSearchResults = (query: string, limit: number) => {
    const digits = query.replace(/\D/g, '');
    let matchingContacts = contacts.filter(c => 
      c.phone && c.phone.replace(/\D/g, '').includes(digits)
    );
    
    // If not enough matching contacts, add some random ones
    if (matchingContacts.length < limit) {
      const nonMatching = contacts.filter(c => 
        !c.phone || !c.phone.replace(/\D/g, '').includes(digits)
      );
      const additionalNeeded = limit - matchingContacts.length;
      const shuffled = nonMatching.sort(() => Math.random() - 0.5);
      matchingContacts = [...matchingContacts, ...shuffled.slice(0, additionalNeeded)];
    }
    
    // Randomize the order but keep some matching contacts at the top
    return matchingContacts.sort(() => Math.random() - 0.5).slice(0, limit);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const digits = query.replace(/\D/g, '');
    
    if (digits.length > 0) {
      if (digits.length < 3) {
        // Show randomized contacts with matching digits
        const limit = digits.length === 1 ? 15 : 7;
        const randomized = getRandomizedSearchResults(query, limit);
        setFilteredContacts(randomized);
      } else {
        // Show forced search results
        const forcedResults = state.forcedSearchResults.map(name => ({ name, phone: '' }));
        setFilteredContacts(forcedResults);
      }
    } else {
      // Show contacts filtered by name
      const filtered = contacts.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  };

  const handleTitlePress = () => {
    pressTimer.current = setTimeout(() => {
      setTapCount(0);
      onOpenSettings();
    }, 2000);
  };

  const handleTitleRelease = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleTitleTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);
    
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }
    
    tapTimer.current = setTimeout(() => {
      if (newTapCount >= 5) {
        resetRevealState();
        if (titleRef.current) {
          titleRef.current.style.backgroundColor = 'hsl(var(--primary) / 0.2)';
          setTimeout(() => {
            if (titleRef.current) {
              titleRef.current.style.backgroundColor = '';
            }
          }, 200);
        }
      }
      setTapCount(0);
    }, 400);
  };

  const openSearchMode = () => {
    setIsSearchMode(true);
    setSearchQuery('');
    setFilteredContacts(contacts);
    setSelectedLetter('');
  };

  const closeSearchMode = () => {
    setIsSearchMode(false);
    setSearchQuery('');
    setFilteredContacts(contacts);
    setSelectedLetter('');
  };

  const handleLetterClick = (letter: string) => {
    if (letter === selectedLetter) {
      setSelectedLetter('');
      setFilteredContacts(contacts);
    } else {
      setSelectedLetter(letter);
      setFilteredContacts(groupedContacts[letter] || []);
    }
  };

  // Search Mode Overlay
  if (isSearchMode) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Search Header */}
        <div className="bg-surface px-4 py-3 border-b border-border">
          <div className="flex items-center space-x-3">
            <button
              onClick={closeSearchMode}
              className="p-2 -ml-2 hover:bg-accent rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search contacts"
                autoFocus
                className="w-full bg-muted border-none rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilteredContacts(contacts);
                }}
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto bg-background">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No contacts found.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredContacts.map((contact, index) => (
                <div
                  key={`${contact.name}-${index}`}
                  className="flex items-center p-4 cursor-pointer hover:bg-accent transition-colors active:bg-accent/80 animate-tap-feedback touch-target"
                  onClick={() => {
                    onContactSelect(contact.name);
                    closeSearchMode();
                  }}
                >
                  <ContactAvatar name={contact.name} />
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium text-foreground">{contact.name}</h3>
                    {contact.phone && (
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Contacts View
  return (
    <div className="flex flex-col h-screen bg-background relative">
      {/* Fixed Top Bar - Always Visible */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button className="p-2 -ml-2">
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex items-center space-x-4">
            <button className="p-2">
              <QrCode className="w-6 h-6 text-foreground" />
            </button>
            <button className="p-2" onClick={openSearchMode}>
              <Search className="w-6 h-6 text-foreground" />
            </button>
            <button className="p-2">
              <MoreVertical className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Alphabet Sidebar */}
      {contacts.length > 0 && (
        <div className="fixed right-1 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-0.5 bg-background/80 backdrop-blur-sm rounded-full px-1 py-2 shadow-sm">
          {alphabet.map(letter => (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              className={`w-4 h-4 rounded-full text-xs font-medium transition-all duration-200 ${
                selectedLetter === letter
                  ? 'bg-primary text-white scale-110 shadow-sm'
                  : groupedContacts[letter]
                    ? 'text-primary hover:bg-primary/20 hover:scale-105'
                    : 'text-muted-foreground/30 cursor-not-allowed'
              }`}
              disabled={!groupedContacts[letter]}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pt-16">
        {/* Profile Header - Scrolls naturally */}
        <div className="bg-surface px-4 py-6">
          <div className="flex items-center space-x-4">
            <ContactAvatar name="User Profile" size="large" />
            <div>
              <h1 
                ref={titleRef}
                className="text-2xl font-bold text-foreground select-none transition-colors duration-100"
                onPointerDown={handleTitlePress}
                onPointerUp={handleTitleRelease}
                onClick={handleTitleTap}
              >
                {state.userProfileName}
              </h1>
              <p className="text-muted-foreground">Happy day :)</p>
            </div>
          </div>
        </div>

        {/* What's New Section - Dynamic */}
        {whatsNewContact && (
          <div className="px-4 py-4 bg-surface border-b border-border">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">What's new</h2>
            <div 
              className="flex items-center space-x-3 p-3 bg-background rounded-lg cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onContactSelect(whatsNewContact.name)}
            >
              <ContactAvatar name={whatsNewContact.name} />
              <span className="text-foreground font-medium">{whatsNewContact.name}</span>
              <div className="ml-auto">
                <div className="w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">1</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Groups */}
        <div className="bg-background pb-20">
          {contacts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No contacts found.</p>
              <p className="text-sm mt-2">Long-press the title to open settings and import contacts.</p>
            </div>
          ) : selectedLetter ? (
            // Show selected letter group
            <div>
              <div className="px-4 py-3 bg-muted/50">
                <h3 className="text-sm font-medium text-muted-foreground uppercase">{selectedLetter}</h3>
              </div>
              <div className="divide-y divide-border">
                {filteredContacts.map((contact, index) => (
                  <div
                    key={`${contact.name}-${index}`}
                    className="flex items-center p-4 cursor-pointer hover:bg-accent transition-colors active:bg-accent/80 animate-tap-feedback touch-target"
                    onClick={() => onContactSelect(contact.name)}
                  >
                    <ContactAvatar name={contact.name} />
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-foreground">{contact.name}</h3>
                      {contact.phone && (
                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Show all contact groups
            Object.keys(groupedContacts)
              .sort((a, b) => a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b))
              .map(letter => (
                <div key={letter}>
                  <div className="px-4 py-3 bg-muted/30 sticky top-0 z-10">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase">{letter}</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {groupedContacts[letter].map((contact, index) => (
                      <div
                        key={`${contact.name}-${index}`}
                        className="flex items-center p-4 cursor-pointer hover:bg-accent transition-colors active:bg-accent/80 animate-tap-feedback touch-target"
                        onClick={() => onContactSelect(contact.name)}
                      >
                        <ContactAvatar name={contact.name} />
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium text-foreground">{contact.name}</h3>
                          {contact.phone && (
                            <p className="text-sm text-muted-foreground">{contact.phone}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => {}} />
    </div>
  );
};
