import { useState, useRef, useEffect } from 'react';
import { Contact } from '@/types';
import { ContactAvatar } from './ContactAvatar';
import { SearchBar } from './SearchBar';
import { FloatingActionButton } from './ui/FloatingActionButton';
import { useContactsStore } from '@/hooks/useContactsStore';
import { Search, QrCode, MoreVertical, Menu } from 'lucide-react';

interface ContactsViewProps {
  contacts: Contact[];
  onContactSelect: (contactName: string) => void;
  onOpenSettings: () => void;
}

export const ContactsView = ({ contacts, onContactSelect, onOpenSettings }: ContactsViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [tapCount, setTapCount] = useState(0);
  const { state, resetRevealState } = useContactsStore();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const pressTimer = useRef<NodeJS.Timeout>();
  const tapTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setFilteredContacts(contacts);
  }, [contacts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const digits = query.replace(/\D/g, '');
    
    if (digits.length > 0) {
      if (digits.length < 3) {
        // Show real contacts with matching digits
        const limit = digits.length === 1 ? 15 : 7;
        const matching = contacts.filter(c => 
          c.phone && c.phone.replace(/\D/g, '').includes(digits)
        ).slice(0, limit);
        setFilteredContacts(matching);
      } else {
        // Show forced search results
        const forcedResults = state.forcedSearchResults.map(name => ({ name, phone: '' }));
        setFilteredContacts(forcedResults);
      }
    } else {
      // Show all contacts or filter by name
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

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery('');
      setFilteredContacts(contacts);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-surface px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button className="p-2 -ml-2">
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex items-center space-x-4">
            <button className="p-2">
              <QrCode className="w-6 h-6 text-foreground" />
            </button>
            <button className="p-2" onClick={toggleSearch}>
              <Search className="w-6 h-6 text-foreground" />
            </button>
            <button className="p-2">
              <MoreVertical className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>
        
        {/* Profile Section */}
        <div className="flex items-center space-x-4 mb-6">
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

      {/* Search Bar */}
      {isSearchVisible && (
        <div className="px-4 pb-4 bg-surface border-b border-border">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search contacts"
          />
        </div>
      )}

      {/* What's New Section */}
      {!isSearchVisible && (
        <div className="px-4 py-2 bg-surface border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">What's new</h2>
          <div className="flex items-center space-x-3 p-3 bg-background rounded-lg">
            <ContactAvatar name="Lindsey Smith" />
            <span className="text-foreground font-medium">Lindsey Smith</span>
            <div className="ml-auto">
              <div className="w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Favorites Section */}
      {!isSearchVisible && (
        <div className="px-4 py-4 bg-surface border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 text-muted-foreground">★</div>
            <span className="text-muted-foreground">Favorites</span>
          </div>
        </div>
      )}

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto bg-background">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No contacts found.</p>
            <p className="text-sm mt-2">Long-press the title to open settings and import contacts.</p>
          </div>
        ) : (
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => {}} />
    </div>
  );
};
