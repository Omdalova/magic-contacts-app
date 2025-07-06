import { ArrowLeft, Phone, MessageCircle, Video, Edit, Share, Star, MoreHorizontal } from 'lucide-react';
import { ContactAvatar } from './ContactAvatar';
import { ForcedData } from '@/types';

interface ContactDetailProps {
  contactName: string;
  contactData: ForcedData;
  onBack: () => void;
}

export const ContactDetail = ({ contactName, contactData, onBack }: ContactDetailProps) => {
  const hasAnyData = contactData.phone || contactData.email || contactData.birthday || contactData.address || contactData.notes;

  return (
    <div className="flex flex-col h-screen bg-background animate-slide-in-right">
      {/* Header */}
      <div className="bg-surface px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <span className="font-medium text-foreground">Contact Details</span>
          <div className="w-8" />
        </div>
      </div>

      {/* Contact Header */}
      <div className="bg-surface px-4 py-8 text-center border-b border-border">
        <ContactAvatar name={contactName} size="xl" className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">{contactName}</h1>
        {contactData.phone && (
          <div className="bg-destructive px-4 py-2 rounded-lg inline-block">
            <span className="text-white font-medium">{contactData.phone}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-surface px-4 py-6 border-b border-border">
        <div className="flex justify-center space-x-8">
          <button className="flex flex-col items-center space-y-2 p-3 hover:bg-accent rounded-lg transition-colors">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
          </button>
          <button className="flex flex-col items-center space-y-2 p-3 hover:bg-accent rounded-lg transition-colors">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          </button>
          <button className="flex flex-col items-center space-y-2 p-3 hover:bg-accent rounded-lg transition-colors">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
          </button>
        </div>
      </div>

      {/* App Integration - Telegram */}
      {contactData.email && (
        <div className="bg-surface px-4 py-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <span className="text-foreground font-medium">Telegram</span>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="flex-1 overflow-y-auto bg-background p-4">
        {hasAnyData && (
          <div className="space-y-4">
            {contactData.email && (
              <div className="bg-surface rounded-lg p-4">
                <label className="text-sm font-medium text-primary">Email</label>
                <p className="text-foreground mt-1">{contactData.email}</p>
              </div>
            )}
            
            {contactData.birthday && (
              <div className="bg-surface rounded-lg p-4">
                <label className="text-sm font-medium text-primary">Birthday</label>
                <p className="text-foreground mt-1">{contactData.birthday}</p>
              </div>
            )}
            
            {contactData.address && (
              <div className="bg-surface rounded-lg p-4">
                <label className="text-sm font-medium text-primary">Address</label>
                <p className="text-foreground mt-1 whitespace-pre-wrap">{contactData.address}</p>
              </div>
            )}
            
            {contactData.notes && (
              <div className="bg-surface rounded-lg p-4">
                <label className="text-sm font-medium text-primary">Notes</label>
                <p className="text-foreground mt-1 whitespace-pre-wrap">{contactData.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <button className="w-full bg-muted text-foreground py-4 rounded-lg font-medium hover:bg-muted/80 transition-colors">
            History
          </button>
          <button className="w-full bg-muted text-foreground py-4 rounded-lg font-medium hover:bg-muted/80 transition-colors">
            Storage locations
          </button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bg-surface border-t border-border px-4 py-3">
        <div className="flex justify-around">
          <button className="flex flex-col items-center space-y-1 p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Star className="w-6 h-6" />
            <span className="text-xs">Favourites</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-primary hover:text-primary/80 transition-colors">
            <Edit className="w-6 h-6" />
            <span className="text-xs font-medium">Edit</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Share className="w-6 h-6" />
            <span className="text-xs">Share</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="w-6 h-6" />
            <span className="text-xs">More</span>
          </button>
        </div>
      </div>
    </div>
  );
};