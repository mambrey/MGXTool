import React, { useState } from 'react';
import { Edit2, Printer, Mail, Phone, Linkedin, Calendar, Trash2, TrendingUp, Plus, Bell, BellOff, X, User, ExternalLink, Briefcase, Users, MapPin, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Contact, Account } from '@/types/crm';

interface ContactDetailsProps {
  contact: Contact;
  account?: Account;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  onBack: () => void;
  onUpdateContact?: (contact: Contact) => void;
}

// Extended event interface with alert functionality
interface ContactEvent {
  id: string;
  title: string;
  date: string;
  alertEnabled?: boolean;
  alertDays?: number;
}

export default function ContactDetails({ 
  contact, 
  account, 
  onEdit, 
  onDelete, 
  onBack,
  onUpdateContact
}: ContactDetailsProps) {
  // Contact Events state with alert functionality
  const [contactEvents, setContactEvents] = useState<ContactEvent[]>(
    (contact.contactEvents || []).map(event => ({
      ...event,
      alertEnabled: false,
      alertDays: 7
    }))
  );
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventAlertEnabled, setNewEventAlertEnabled] = useState(false);
  const [newEventAlertDays, setNewEventAlertDays] = useState(7);

  const handleAddEvent = () => {
    if (!newEventTitle.trim() || !newEventDate) {
      alert('Please enter both event title and date');
      return;
    }

    const newEvent: ContactEvent = {
      id: Date.now().toString(),
      title: newEventTitle.trim(),
      date: newEventDate,
      alertEnabled: newEventAlertEnabled,
      alertDays: newEventAlertDays
    };

    const updatedEvents = [...contactEvents, newEvent];
    setContactEvents(updatedEvents);

    // Update the contact with new events
    const updatedContact = {
      ...contact,
      contactEvents: updatedEvents.map(({ alertEnabled, alertDays, ...event }) => event),
      lastModified: new Date().toISOString()
    };

    if (onUpdateContact) {
      onUpdateContact(updatedContact);
    }

    // Reset form and close dialog
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventAlertEnabled(false);
    setNewEventAlertDays(7);
    setIsAddEventDialogOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = contactEvents.filter(e => e.id !== eventId);
      setContactEvents(updatedEvents);

      // Update the contact with new events
      const updatedContact = {
        ...contact,
        contactEvents: updatedEvents.map(({ alertEnabled, alertDays, ...event }) => event),
        lastModified: new Date().toISOString()
      };

      if (onUpdateContact) {
        onUpdateContact(updatedContact);
      }
    }
  };

  const handleToggleEventAlert = (eventId: string) => {
    const updatedEvents = contactEvents.map(event => 
      event.id === eventId 
        ? { ...event, alertEnabled: !event.alertEnabled }
        : event
    );
    setContactEvents(updatedEvents);

    // Update the contact
    const updatedContact = {
      ...contact,
      contactEvents: updatedEvents.map(({ alertEnabled, alertDays, ...event }) => event),
      lastModified: new Date().toISOString()
    };

    if (onUpdateContact) {
      onUpdateContact(updatedContact);
    }
  };

  const handleUpdateEventAlertDays = (eventId: string, days: number) => {
    const updatedEvents = contactEvents.map(event => 
      event.id === eventId 
        ? { ...event, alertDays: days }
        : event
    );
    setContactEvents(updatedEvents);

    // Update the contact
    const updatedContact = {
      ...contact,
      contactEvents: updatedEvents.map(({ alertEnabled, alertDays, ...event }) => event),
      lastModified: new Date().toISOString()
    };

    if (onUpdateContact) {
      onUpdateContact(updatedContact);
    }
  };

  const getDaysUntilEvent = (eventDate: string) => {
    const days = Math.ceil((new Date(eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Helper function to get influencer level badge with color coding
  const getInfluencerLevelBadge = (level?: number) => {
    if (!level) return null;
    
    let className = '';
    let label = '';
    
    if (level <= 3) {
      className = 'bg-gray-100 text-gray-800 border-gray-300';
      label = 'Low';
    } else if (level <= 6) {
      className = 'bg-blue-100 text-blue-800 border-blue-300';
      label = 'Medium';
    } else if (level <= 8) {
      className = 'bg-yellow-100 text-yellow-800 border-yellow-300';
      label = 'High';
    } else {
      className = 'bg-green-100 text-green-800 border-green-300';
      label = 'Very High';
    }
    
    return (
      <Badge variant="outline" className={`${className}`}>
        <TrendingUp className="w-3 h-3 mr-1 inline" />
        Influence Rating: {level}/10 ({label})
      </Badge>
    );
  };

  // Helper function to get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Helper function to format LinkedIn URL
  const formatLinkedInUrl = (url: string) => {
    // If URL already starts with http:// or https://, return as is
    if (url.match(/^https?:\/\//i)) {
      return url;
    }
    // Otherwise, add https://
    return `https://${url}`;
  };

  const printContact = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Contact: ${contact.firstName} ${contact.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            h2 { color: #4b5563; margin-top: 20px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #6b7280; }
            .value { margin-left: 10px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>${contact.firstName} ${contact.lastName}</h1>
          ${contact.title ? `<p style="font-size: 18px; color: #6b7280;">${contact.title}</p>` : ''}
          ${account ? `<p style="color: #2563eb;">Account: ${account.accountName}</p>` : ''}
          
          <div class="section">
            <h2>Contact Information</h2>
            ${contact.email ? `<p><span class="label">Email:</span><span class="value">${contact.email}</span></p>` : ''}
            ${contact.mobilePhone ? `<p><span class="label">Mobile:</span><span class="value">${contact.mobilePhone}</span></p>` : ''}
            ${contact.officePhone ? `<p><span class="label">Office:</span><span class="value">${contact.officePhone}</span></p>` : ''}
            ${contact.preferredShippingAddress ? `<p><span class="label">Shipping Address:</span><span class="value">${contact.preferredShippingAddress}</span></p>` : ''}
          </div>
          
          ${contact.relationshipStatus || contact.preferredContactMethod ? `
          <div class="section">
            <h2>Relationship Details</h2>
            ${contact.relationshipStatus ? `<p><span class="label">Status:</span><span class="value">${contact.relationshipStatus}</span></p>` : ''}
            ${contact.preferredContactMethod ? `<p><span class="label">Preferred Contact:</span><span class="value">${contact.preferredContactMethod}</span></p>` : ''}
          </div>` : ''}
          
          ${contact.knownPreferences ? `
          <div class="section">
            <h2>Known Preferences</h2>
            <p>${contact.knownPreferences}</p>
          </div>` : ''}
          
          ${contact.notes ? `
          <div class="section">
            <h2>Notes</h2>
            <p style="white-space: pre-wrap;">${contact.notes}</p>
          </div>` : ''}
          
          <button onclick="window.print()">Print</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Headshot */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <Button variant="ghost" onClick={onBack} className="mb-2">
            {account ? (
              <>
                ← Back to {account.accountName}
              </>
            ) : (
              <>
                ← Back to Contacts
              </>
            )}
          </Button>
          <div className="flex items-center gap-4">
            {/* Headshot Display */}
            <div className="shrink-0">
              {contact.headshot ? (
                <img 
                  src={contact.headshot} 
                  alt={`${contact.firstName} ${contact.lastName}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-200 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-gray-200 shadow-md">
                  <span className="text-white text-2xl sm:text-3xl font-bold">
                    {getInitials(contact.firstName, contact.lastName)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{contact.firstName} {contact.lastName}</h1>
              <p className="text-gray-600">{contact.title || 'No title specified'}</p>
              {account && (
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <p className="text-blue-600 text-sm font-medium">{account.accountName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          {/* Created and Modified Dates */}
          <div className="text-right text-sm space-y-1">
            <div>
              <span className="text-xs text-gray-500">Created: </span>
              <span className="text-xs text-gray-700 font-medium">
                {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Not available'}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500">Modified: </span>
              <span className="text-xs text-gray-700 font-medium">
                {contact.lastModified ? new Date(contact.lastModified).toLocaleDateString() : 'Not available'}
              </span>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={printContact}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button
              onClick={() => onEdit(contact)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Contact
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}? This action cannot be undone.`)) {
                  onDelete(contact.id);
                }
              }}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                {contact.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800 text-sm break-all">
                        {contact.email}
                      </a>
                    </div>
                  </div>
                )}
                {contact.mobilePhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 mb-1">Mobile</p>
                      <a href={`tel:${contact.mobilePhone}`} className="text-blue-600 hover:text-blue-800 text-sm">
                        {contact.mobilePhone}
                      </a>
                    </div>
                  </div>
                )}
                {contact.officePhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 mb-1">Office</p>
                      <a href={`tel:${contact.officePhone}`} className="text-blue-600 hover:text-blue-800 text-sm">
                        {contact.officePhone}
                      </a>
                    </div>
                  </div>
                )}
                {contact.preferredShippingAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 mb-1">Shipping Address</p>
                      <p className="text-sm text-gray-700">
                        {contact.preferredShippingAddress}
                      </p>
                    </div>
                  </div>
                )}
                {contact.socialHandles && contact.socialHandles.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">LinkedIn Profile</p>
                    <div className="space-y-2">
                      {contact.socialHandles.map((handle, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-blue-600 shrink-0" />
                          <a 
                            href={formatLinkedInUrl(handle)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center gap-1 break-all"
                          >
                            {handle}
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Relationship Details */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4">Relationship Details</h3>
              <div className="space-y-3">
                {contact.contactType && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Contact Type</p>
                    <Badge variant={contact.contactType === 'Primary' ? 'default' : 'secondary'}>
                      {contact.contactType}
                    </Badge>
                  </div>
                )}
                {contact.influence && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Influence Level</p>
                    <Badge variant="outline">
                      {contact.influence}
                    </Badge>
                  </div>
                )}
                {contact.influencerLevel && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Influencer Rating</p>
                    {getInfluencerLevelBadge(contact.influencerLevel)}
                  </div>
                )}
                {contact.relationshipStatus && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Relationship Status</p>
                    <p className="text-sm">{contact.relationshipStatus}</p>
                  </div>
                )}
                {contact.preferredContactMethod && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Preferred Contact Method</p>
                    <p className="text-sm">{contact.preferredContactMethod}</p>
                  </div>
                )}
                {contact.birthday && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Birthday</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <p className="text-sm">{contact.birthday}</p>
                      {contact.birthdayAlert && (
                        <Badge variant="secondary" className="text-xs">
                          Alert On
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                {/* Relationship Owner - Simplified formatting */}
                {contact.relationshipOwner && (contact.relationshipOwner.name || contact.relationshipOwner.email || contact.relationshipOwner.vicePresident) && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Relationship Owner</p>
                    <div className="text-sm text-gray-700 space-y-1">
                      {contact.relationshipOwner.name && (
                        <p>{contact.relationshipOwner.name}</p>
                      )}
                      {contact.relationshipOwner.email && (
                        <p className="text-blue-600">{contact.relationshipOwner.email}</p>
                      )}
                      {contact.relationshipOwner.vicePresident && (
                        <p>VP: {contact.relationshipOwner.vicePresident}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Primary Diageo Relationship Owner(s) Section */}
          {contact.primaryDiageoRelationshipOwners && (
            (contact.primaryDiageoRelationshipOwners.ownerName || 
             contact.primaryDiageoRelationshipOwners.ownerEmail || 
             contact.primaryDiageoRelationshipOwners.svp ||
             Object.keys(contact.primaryDiageoRelationshipOwners.sales || {}).length > 0 || 
             Object.keys(contact.primaryDiageoRelationshipOwners.support || {}).length > 0)
          ) && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Diageo Relationship Owner(s)
              </h3>

              {/* Display Owner Name, Owner Email, and SVP */}
              {(contact.primaryDiageoRelationshipOwners.ownerName || 
                contact.primaryDiageoRelationshipOwners.ownerEmail || 
                contact.primaryDiageoRelationshipOwners.svp) && (
                <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {contact.primaryDiageoRelationshipOwners.ownerName && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Primary Owner</p>
                        <p className="text-sm font-medium text-gray-700">
                          {contact.primaryDiageoRelationshipOwners.ownerName}
                        </p>
                      </div>
                    )}
                    {contact.primaryDiageoRelationshipOwners.ownerEmail && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Primary Owner Email</p>
                        <a 
                          href={`mailto:${contact.primaryDiageoRelationshipOwners.ownerEmail}`}
                          className="text-sm text-blue-600 hover:text-blue-800 break-all"
                        >
                          {contact.primaryDiageoRelationshipOwners.ownerEmail}
                        </a>
                      </div>
                    )}
                    {contact.primaryDiageoRelationshipOwners.svp && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">SVP</p>
                        <p className="text-sm font-medium text-gray-700">
                          {contact.primaryDiageoRelationshipOwners.svp}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sales Section */}
                {contact.primaryDiageoRelationshipOwners.sales && Object.keys(contact.primaryDiageoRelationshipOwners.sales).length > 0 && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Sales
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(contact.primaryDiageoRelationshipOwners.sales).map(([role, cadence]) => (
                        <div key={role} className="flex items-center justify-between p-2 bg-white rounded border border-indigo-100">
                          <span className="text-sm font-medium text-gray-700">{role}</span>
                          <Badge variant="outline" className="text-xs">
                            {cadence || 'Not set'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Support Section */}
                {contact.primaryDiageoRelationshipOwners.support && Object.keys(contact.primaryDiageoRelationshipOwners.support).length > 0 && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Support
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(contact.primaryDiageoRelationshipOwners.support).map(([role, cadence]) => (
                        <div key={role} className="flex items-center justify-between p-2 bg-white rounded border border-indigo-100">
                          <span className="text-sm font-medium text-gray-700">{role}</span>
                          <Badge variant="outline" className="text-xs">
                            {cadence || 'Not set'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Timestamps */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Contact Record Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Created</p>
                <p className="text-sm">{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Not available'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Last Modified</p>
                <p className="text-sm">{contact.lastModified ? new Date(contact.lastModified).toLocaleDateString() : 'Not available'}</p>
              </div>
            </div>
          </div>

          {/* Important Dates with Event Management */}
          <div className="mt-6 pt-6 border-t">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Important Dates ({contactEvents.length + (contact.lastContactDate ? 1 : 0) + (contact.nextContactDate ? 1 : 0)})
                  </CardTitle>
                  <Button size="sm" onClick={() => setIsAddEventDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* System Dates (Last Contact, Next Contact) */}
                  {(contact.lastContactDate || contact.nextContactDate) && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Contact Schedule</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {contact.lastContactDate && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Last Contact</p>
                            <p className="text-sm font-medium">{new Date(contact.lastContactDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {contact.nextContactDate && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Next Contact</p>
                            <div className="flex flex-col gap-2">
                              <p className="text-sm font-medium">{new Date(contact.nextContactDate).toLocaleDateString()}</p>
                              {contact.nextContactAlert && (
                                <Badge variant="secondary" className="text-xs w-fit">
                                  Alert On
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Events */}
                  {contactEvents.length > 0 && (
                    <>
                      {(contact.lastContactDate || contact.nextContactDate) && <Separator className="my-4" />}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Custom Events</h4>
                        <ScrollArea className="h-[350px] pr-4">
                          <div className="space-y-3">
                            {contactEvents.map((event) => {
                              const daysUntil = getDaysUntilEvent(event.date);
                              const isUpcoming = daysUntil >= 0 && daysUntil <= (event.alertDays || 7);
                              
                              return (
                                <Card key={event.id} className={`p-4 ${isUpcoming && event.alertEnabled ? 'border-orange-300 bg-orange-50' : ''}`}>
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <h4 className="font-medium mb-1">{event.title}</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <Calendar className="w-3 h-3" />
                                          <span>{new Date(event.date).toLocaleDateString()}</span>
                                          {daysUntil >= 0 && (
                                            <Badge variant={daysUntil <= 7 ? 'default' : 'secondary'} className="text-xs">
                                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                            </Badge>
                                          )}
                                          {daysUntil < 0 && (
                                            <Badge variant="outline" className="text-xs text-gray-500">
                                              {Math.abs(daysUntil)} days ago
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>

                                    {/* Alert Settings for this Event */}
                                    <div className="pt-3 border-t border-gray-200 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          {event.alertEnabled ? (
                                            <Bell className="w-4 h-4 text-orange-600" />
                                          ) : (
                                            <BellOff className="w-4 h-4 text-gray-400" />
                                          )}
                                          <Label htmlFor={`alert-${event.id}`} className="text-sm font-medium cursor-pointer">
                                            Enable Alert
                                          </Label>
                                        </div>
                                        <Switch
                                          id={`alert-${event.id}`}
                                          checked={event.alertEnabled || false}
                                          onCheckedChange={() => handleToggleEventAlert(event.id)}
                                        />
                                      </div>

                                      {event.alertEnabled && (
                                        <div className="space-y-2 pl-6">
                                          <Label htmlFor={`alert-days-${event.id}`} className="text-xs text-gray-600">
                                            Alert me (days before):
                                          </Label>
                                          <div className="flex items-center gap-2">
                                            <Input
                                              id={`alert-days-${event.id}`}
                                              type="number"
                                              min="1"
                                              max="90"
                                              value={event.alertDays || 7}
                                              onChange={(e) => handleUpdateEventAlertDays(event.id, parseInt(e.target.value) || 7)}
                                              className="w-20 h-8 text-sm"
                                            />
                                            <span className="text-xs text-gray-500">days before event</span>
                                          </div>
                                          {isUpcoming && (
                                            <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                              <Bell className="w-3 h-3" />
                                              <span>Alert active - event is within {event.alertDays} days</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    </>
                  )}

                  {/* Empty State */}
                  {contactEvents.length === 0 && !contact.lastContactDate && !contact.nextContactDate && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm mb-4">No important dates added yet</p>
                      <Button size="sm" onClick={() => setIsAddEventDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Event
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preferences */}
          {contact.knownPreferences && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-base sm:text-lg font-semibold mb-3">Known Preferences</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.knownPreferences}</p>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-base sm:text-lg font-semibold mb-3">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          {/* Uploaded Notes */}
          {contact.uploadedNotes && contact.uploadedNotes.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-base sm:text-lg font-semibold mb-3">Additional Notes</h3>
              <div className="space-y-2">
                {contact.uploadedNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Event Dialog with Alert Configuration */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Important Date</DialogTitle>
            <DialogDescription>
              Add a new important date for {contact.firstName} {contact.lastName}. You can optionally enable alerts to be notified before the event.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Event Title *</Label>
              <Input
                id="event-title"
                placeholder="e.g., Birthday, Anniversary, Meeting"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-date">Event Date *</Label>
              <Input
                id="event-date"
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
              />
            </div>
            
            <Separator />
            
            {/* Alert Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orange-600" />
                    <Label htmlFor="enable-alert" className="text-base font-medium cursor-pointer">
                      Enable Alert
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Get notified before this event occurs
                  </p>
                </div>
                <Switch
                  id="enable-alert"
                  checked={newEventAlertEnabled}
                  onCheckedChange={setNewEventAlertEnabled}
                />
              </div>

              {newEventAlertEnabled && (
                <div className="space-y-2 pl-6 pt-2">
                  <Label htmlFor="alert-days" className="text-sm">
                    Alert me (days before event):
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="alert-days"
                      type="number"
                      min="1"
                      max="90"
                      value={newEventAlertDays}
                      onChange={(e) => setNewEventAlertDays(parseInt(e.target.value) || 7)}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-500">days before</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    You'll receive an alert {newEventAlertDays} {newEventAlertDays === 1 ? 'day' : 'days'} before this event
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddEventDialogOpen(false);
              setNewEventTitle('');
              setNewEventDate('');
              setNewEventAlertEnabled(false);
              setNewEventAlertDays(7);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}