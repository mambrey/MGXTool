import React, { useState } from 'react';
import { Edit2, Printer, Mail, Phone, Linkedin, Calendar, Trash2, TrendingUp, Plus, Bell, BellOff, X, User, ExternalLink, Briefcase, Users, MapPin, Building2, ChevronDown, ChevronUp, Package, FileText, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Contact, Account } from '@/types/crm';

interface ContactDetailsProps {
  contact: Contact;
  account?: Account;
  accounts?: Account[];
  allContacts?: Contact[];
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
  alertOptions?: ('same_day' | 'day_before' | 'week_before')[];
}

// Helper function to format birthday for display (MM/DD/YYYY)
const formatBirthday = (birthday: string): string => {
  if (!birthday) return 'N/A';
  
  // If already in ISO format (YYYY-MM-DD), convert to MM/DD/YYYY
  if (birthday.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = birthday.split('-');
    return `${month}/${day}/${year}`;
  }
  
  // If in MM-DD format (legacy), add current year and convert to MM/DD/YYYY
  if (birthday.match(/^\d{2}-\d{2}$/)) {
    const [month, day] = birthday.split('-');
    const currentYear = new Date().getFullYear();
    return `${month}/${day}/${currentYear}`;
  }
  
  // Return as-is if format is unknown
  return birthday;
};

const formatAlertOptions = (options?: ('same_day' | 'day_before' | 'week_before')[]) => {
  if (!options || options.length === 0) return 'None';
  return options.map(opt => {
    switch (opt) {
      case 'same_day': return 'Same Day';
      case 'day_before': return 'Day Before';
      case 'week_before': return 'Week Before';
      default: return opt;
    }
  }).join(', ');
};

export default function ContactDetails({ 
  contact, 
  account,
  accounts = [],
  allContacts = [],
  onEdit, 
  onDelete, 
  onBack,
  onUpdateContact
}: ContactDetailsProps) {
  // Contact Events state with alert functionality
  const [contactEvents, setContactEvents] = useState<ContactEvent[]>(
    (contact.contactEvents || []).map(event => ({
      ...event,
      alertEnabled: event.alertEnabled || false,
      alertOptions: event.alertOptions || []
    }))
  );
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventAlertEnabled, setNewEventAlertEnabled] = useState(false);
  const [newEventAlertOptions, setNewEventAlertOptions] = useState<('same_day' | 'day_before' | 'week_before')[]>([]);
  const [expandAll, setExpandAll] = useState(false);

  const handleToggleNewEventAlertOption = (option: 'same_day' | 'day_before' | 'week_before') => {
    setNewEventAlertOptions(prev => {
      return prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option];
    });
  };

  const getAlertOptionLabel = (option: 'same_day' | 'day_before' | 'week_before') => {
    switch (option) {
      case 'same_day': return 'Same Day';
      case 'day_before': return 'One Day Before';
      case 'week_before': return 'One Week Before';
    }
  };

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
      alertOptions: newEventAlertOptions
    };

    const updatedEvents = [...contactEvents, newEvent];
    setContactEvents(updatedEvents);

    // Update the contact with new events
    const updatedContact = {
      ...contact,
      contactEvents: updatedEvents.map(({ alertEnabled, alertOptions, ...event }) => ({ ...event, alertEnabled, alertOptions })),
      lastModified: new Date().toISOString()
    };

    if (onUpdateContact) {
      onUpdateContact(updatedContact);
    }

    // Reset form and close dialog
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventAlertEnabled(false);
    setNewEventAlertOptions([]);
    setIsAddEventDialogOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = contactEvents.filter(e => e.id !== eventId);
      setContactEvents(updatedEvents);

      // Update the contact with new events
      const updatedContact = {
        ...contact,
        contactEvents: updatedEvents.map(({ alertEnabled, alertOptions, ...event }) => ({ ...event, alertEnabled, alertOptions })),
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
      contactEvents: updatedEvents.map(({ alertEnabled, alertOptions, ...event }) => ({ ...event, alertEnabled, alertOptions })),
      lastModified: new Date().toISOString()
    };

    if (onUpdateContact) {
      onUpdateContact(updatedContact);
    }
  };

  const handleToggleEventAlertOption = (eventId: string, option: 'same_day' | 'day_before' | 'week_before') => {
    const updatedEvents = contactEvents.map(event => {
      if (event.id === eventId) {
        const currentOptions = event.alertOptions || [];
        const newOptions = currentOptions.includes(option)
          ? currentOptions.filter(o => o !== option)
          : [...currentOptions, option];
        return { ...event, alertOptions: newOptions };
      }
      return event;
    });
    setContactEvents(updatedEvents);

    // Update the contact
    const updatedContact = {
      ...contact,
      contactEvents: updatedEvents.map(({ alertEnabled, alertOptions, ...event }) => ({ ...event, alertEnabled, alertOptions })),
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

  // Helper function to get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Helper function to format LinkedIn URL
  const formatLinkedInUrl = (url: string) => {
    if (url.match(/^https?:\/\//i)) {
      return url;
    }
    return `https://${url}`;
  };

  // Helper function to get support style color
  const getSupportStyleColor = (status: string) => {
    if (status.includes('Promoter')) return '#166534';
    if (status.includes('Supporter')) return '#16a34a';
    if (status.includes('Neutral')) return '#6b7280';
    if (status.includes('Detractor')) return '#f87171';
    if (status.includes('Adversarial')) return '#991b1b';
    return '#6b7280';
  };

  const printContact = () => {
    window.print();
  };

  // Display name with preferred first name
  const displayName = contact.preferredFirstName 
    ? `${contact.preferredFirstName} ${contact.lastName}` 
    : `${contact.firstName} ${contact.lastName}`;

  // Get manager information
  const manager = allContacts.find(c => c.id === contact.managerId);
  const managerAccount = manager?.accountId ? accounts.find(a => a.id === manager.accountId) : undefined;

  // Get banner/buying office information if applicable
  const bannerBuyingOffice = contact.bannerBuyingOfficeId && account?.bannerBuyingOffices 
    ? account.bannerBuyingOffices.find(b => b.id === contact.bannerBuyingOfficeId)
    : undefined;

  // InfoItem component matching AccountDetails pattern
  const InfoItem = ({ label, value, icon: Icon }: { label: string; value: string | number | undefined; icon?: React.ComponentType<{ className?: string }> }) => {
    if (!value) return null;
    return (
      <div>
        <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </label>
        <p className="text-base mt-1">{value}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            {account ? `← Back to ${account.accountName}` : '← Back to Contacts'}
          </Button>
          <div className="flex items-center gap-4">
            {/* Headshot Display */}
            <div className="shrink-0">
              {contact.headshot ? (
                <img 
                  src={contact.headshot} 
                  alt={displayName}
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
              <h1 className="text-3xl font-bold">{displayName}</h1>
              {contact.preferredFirstName && (
                <p className="text-sm text-gray-500">Legal name: {contact.firstName} {contact.lastName}</p>
              )}
              <p className="text-gray-600">{contact.title || 'No title specified'}</p>
              {account && (
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <p className="text-blue-600 text-sm font-medium">{account.accountName}</p>
                </div>
              )}
              {bannerBuyingOffice && (
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <p className="text-purple-600 text-sm font-medium">{bannerBuyingOffice.accountName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExpandAll(!expandAll)}
          >
            {expandAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Expand All
              </>
            )}
          </Button>
          <Button variant="outline" onClick={printContact}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={() => onEdit(contact)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${displayName}? This action cannot be undone.`)) {
                onDelete(contact.id);
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Accordion Sections */}
      <Accordion type="multiple" defaultValue={expandAll ? ['basic', 'contact-info', 'ways-of-working', 'dates', 'linkedin', 'preferences', 'relationship-owner', 'notes'] : ['basic']} value={expandAll ? ['basic', 'contact-info', 'ways-of-working', 'dates', 'linkedin', 'preferences', 'relationship-owner', 'notes'] : undefined}>
        
        {/* Basic Information */}
        <AccordionItem value="basic">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="First Name" value={contact.firstName} icon={User} />
                  {contact.preferredFirstName && (
                    <InfoItem label="Preferred First Name" value={contact.preferredFirstName} />
                  )}
                  <InfoItem label="Last Name" value={contact.lastName} />
                  <InfoItem label="Job Title" value={contact.title} icon={Briefcase} />
                  <InfoItem label="Current Role Tenure" value={contact.currentRoleTenure} />
                  {account && (
                    <InfoItem label="Account" value={account.accountName} icon={Building2} />
                  )}
                  {bannerBuyingOffice && (
                    <InfoItem label="Banner/Buying Office" value={bannerBuyingOffice.accountName} />
                  )}
                  {manager && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Reports To
                      </label>
                      <p className="text-base mt-1">{manager.firstName} {manager.lastName}</p>
                      {manager.title && (
                        <p className="text-sm text-gray-500">{manager.title}</p>
                      )}
                      {managerAccount && (
                        <p className="text-sm text-gray-500">{managerAccount.accountName}</p>
                      )}
                    </div>
                  )}
                  {contact.isPrimaryContact && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Contact Type</label>
                      <div className="mt-1">
                        <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                          Primary Contact
                        </Badge>
                      </div>
                    </div>
                  )}
                  {contact.contactActiveStatus && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">
                        <Badge variant={contact.contactActiveStatus === 'Active' ? 'default' : 'secondary'}>
                          {contact.contactActiveStatus}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-base mt-1">
                      {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Modified</label>
                    <p className="text-base mt-1">
                      {contact.lastModified ? new Date(contact.lastModified).toLocaleDateString() : 'Not available'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Contact Information */}
        <AccordionItem value="contact-info">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contact.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <a href={`mailto:${contact.email}`} className="text-base mt-1 text-blue-600 hover:text-blue-800 block break-all">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.officePhone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Office Phone
                      </label>
                      <a href={`tel:${contact.officePhone}`} className="text-base mt-1 text-blue-600 hover:text-blue-800 block">
                        {contact.officePhone}
                      </a>
                    </div>
                  )}
                  {contact.mobilePhone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Mobile Phone
                      </label>
                      <a href={`tel:${contact.mobilePhone}`} className="text-base mt-1 text-blue-600 hover:text-blue-800 block">
                        {contact.mobilePhone}
                      </a>
                    </div>
                  )}
                  <InfoItem label="Preferred Contact Method" value={contact.preferredContactMethod} />
                  {contact.preferredShippingAddress && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Preferred Shipping Address
                      </label>
                      <p className="text-base mt-1">{contact.preferredShippingAddress}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Ways of Working */}
        <AccordionItem value="ways-of-working">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Ways of Working
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Support Style */}
                  {contact.relationshipStatus && (
                    <div>
                      <h4 className="font-semibold mb-3 text-sm text-gray-700">Support Style</h4>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{backgroundColor: getSupportStyleColor(contact.relationshipStatus)}}
                        ></div>
                        <p className="text-base">{contact.relationshipStatus}</p>
                      </div>
                    </div>
                  )}

                  {contact.categorySegmentOwnership && contact.categorySegmentOwnership.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Category/Segment Ownership</h4>
                        <div className="flex flex-wrap gap-2">
                          {contact.categorySegmentOwnership.map((category, index) => (
                            <Badge key={index} variant="secondary">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {contact.responsibilityLevels && Object.keys(contact.responsibilityLevels).length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Responsibility Levels</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(contact.responsibilityLevels).map(([key, value]) => {
                            if (value && value !== 'None') {
                              const label = key.replace(/([A-Z])/g, ' $1').trim();
                              return (
                                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <span className="text-sm text-gray-600 capitalize">{label}</span>
                                  <Badge variant="outline">{value}</Badge>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {(contact.entertainment || contact.decisionBiasProfile || contact.followThrough) && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Additional Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Allowed to Entertain" value={contact.entertainment} />
                          <InfoItem label="Decision Bias Profile" value={contact.decisionBiasProfile} />
                          {contact.followThrough && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Follow Through</label>
                              <div className="mt-1">
                                <Badge variant="outline">{contact.followThrough}</Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Important Dates */}
        <AccordionItem value="dates">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Important Dates
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    All Dates ({contactEvents.length + (contact.birthday ? 1 : 0) + (contact.lastContactDate ? 1 : 0) + (contact.nextContactDate ? 1 : 0)})
                  </CardTitle>
                  <Button size="sm" onClick={() => setIsAddEventDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Birthday */}
                  {contact.birthday && (
                    <div>
                      <h4 className="font-semibold mb-3 text-sm text-gray-700">Birthday</h4>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-base font-medium">{formatBirthday(contact.birthday)}</p>
                          {contact.birthdayAlert && (
                            <Badge variant="secondary" className="text-xs">
                              <Bell className="w-3 h-3 mr-1" />
                              Alert Enabled
                            </Badge>
                          )}
                        </div>
                        {contact.birthdayAlert && contact.birthdayAlertOptions && contact.birthdayAlertOptions.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Alert: {formatAlertOptions(contact.birthdayAlertOptions)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Schedule */}
                  {(contact.lastContactDate || contact.nextContactDate) && (
                    <>
                      {contact.birthday && <Separator />}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Contact Schedule</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {contact.lastContactDate && (
                            <div className="p-4 bg-gray-50 rounded-lg border">
                              <label className="text-sm font-medium text-gray-600">Last Contact Date</label>
                              <p className="text-base mt-1">{new Date(contact.lastContactDate).toLocaleDateString()}</p>
                            </div>
                          )}
                          {contact.nextContactDate && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <label className="text-sm font-medium text-gray-600">Next Contact Date</label>
                              <div className="space-y-2 mt-1">
                                <p className="text-base font-medium">{new Date(contact.nextContactDate).toLocaleDateString()}</p>
                                {contact.nextContactAlert && (
                                  <>
                                    <Badge variant="secondary" className="text-xs">
                                      <Bell className="w-3 h-3 mr-1" />
                                      Alert Enabled
                                    </Badge>
                                    {contact.nextContactAlertOptions && contact.nextContactAlertOptions.length > 0 && (
                                      <p className="text-sm text-gray-600">
                                        Alert: {formatAlertOptions(contact.nextContactAlertOptions)}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Custom Events */}
                  {contactEvents.length > 0 && (
                    <>
                      {(contact.birthday || contact.lastContactDate || contact.nextContactDate) && <Separator />}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Custom Events</h4>
                        <ScrollArea className="h-[350px] pr-4">
                          <div className="space-y-3">
                            {contactEvents.map((event) => {
                              const daysUntil = getDaysUntilEvent(event.date);
                              const isUpcoming = daysUntil >= 0 && (event.alertOptions || []).some(opt => {
                                if (opt === 'same_day') return daysUntil === 0;
                                if (opt === 'day_before') return daysUntil <= 1;
                                if (opt === 'week_before') return daysUntil <= 7;
                                return false;
                              });
                              
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

                                    {/* Alert Settings */}
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
                                          <Label className="text-xs text-gray-600">
                                            Alert me:
                                          </Label>
                                          <div className="space-y-1.5">
                                            {(['same_day', 'day_before', 'week_before'] as const).map((option) => (
                                              <div key={option} className="flex items-center space-x-2">
                                                <Checkbox
                                                  id={`event-${event.id}-${option}`}
                                                  checked={(event.alertOptions || []).includes(option)}
                                                  onCheckedChange={() => handleToggleEventAlertOption(event.id, option)}
                                                  className="h-3 w-3"
                                                />
                                                <Label
                                                  htmlFor={`event-${event.id}-${option}`}
                                                  className="text-xs font-normal cursor-pointer"
                                                >
                                                  {getAlertOptionLabel(option)}
                                                </Label>
                                              </div>
                                            ))}
                                          </div>
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
                  {contactEvents.length === 0 && !contact.birthday && !contact.lastContactDate && !contact.nextContactDate && (
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
          </AccordionContent>
        </AccordionItem>

        {/* LinkedIn Profile */}
        {(contact.linkedinProfile || (contact.socialHandles && contact.socialHandles.length > 0)) && (
          <AccordionItem value="linkedin">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Linkedin className="w-5 h-5" />
                LinkedIn Profile
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {contact.linkedinProfile && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">LinkedIn Profile URL</label>
                        <a 
                          href={formatLinkedInUrl(contact.linkedinProfile)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base mt-1 text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 break-all"
                        >
                          View LinkedIn Profile
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                    {contact.socialHandles && contact.socialHandles.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">LinkedIn Profile (Legacy)</label>
                        <div className="space-y-2 mt-1">
                          {contact.socialHandles.map((handle, index) => (
                            <a 
                              key={index}
                              href={formatLinkedInUrl(handle)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-base text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 break-all"
                            >
                              {handle}
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Preferences & Notes */}
        {(contact.knownPreferences || contact.values || contact.painPoints || contact.notes) && (
          <AccordionItem value="preferences">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Preferences & Notes
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {contact.knownPreferences && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm text-gray-700">Known Preferences</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.knownPreferences}</p>
                      </div>
                    )}
                    {contact.values && (
                      <>
                        {contact.knownPreferences && <Separator />}
                        <div>
                          <h4 className="font-semibold mb-2 text-sm text-gray-700">What They Value (Business Perspective)</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.values}</p>
                        </div>
                      </>
                    )}
                    {contact.painPoints && (
                      <>
                        {(contact.knownPreferences || contact.values) && <Separator />}
                        <div>
                          <h4 className="font-semibold mb-2 text-sm text-gray-700">Pain Points</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.painPoints}</p>
                        </div>
                      </>
                    )}
                    {contact.notes && (
                      <>
                        {(contact.knownPreferences || contact.values || contact.painPoints) && <Separator />}
                        <div>
                          <h4 className="font-semibold mb-2 text-sm text-gray-700">General Notes</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Diageo Relationship Owner(s) */}
        {contact.primaryDiageoRelationshipOwners && (
          (contact.primaryDiageoRelationshipOwners.ownerName || 
           contact.primaryDiageoRelationshipOwners.ownerEmail || 
           contact.primaryDiageoRelationshipOwners.svp ||
           Object.keys(contact.primaryDiageoRelationshipOwners.sales || {}).length > 0 || 
           Object.keys(contact.primaryDiageoRelationshipOwners.support || {}).length > 0)
        ) && (
          <AccordionItem value="relationship-owner">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Diageo Relationship Owner(s)
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Primary Owner Info */}
                    {(contact.primaryDiageoRelationshipOwners.ownerName || 
                      contact.primaryDiageoRelationshipOwners.ownerEmail || 
                      contact.primaryDiageoRelationshipOwners.svp) && (
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Primary Owner Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <InfoItem label="Primary Owner" value={contact.primaryDiageoRelationshipOwners.ownerName} />
                          {contact.primaryDiageoRelationshipOwners.ownerEmail && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Primary Owner Email</label>
                              <a 
                                href={`mailto:${contact.primaryDiageoRelationshipOwners.ownerEmail}`}
                                className="text-base mt-1 text-blue-600 hover:text-blue-800 block break-all"
                              >
                                {contact.primaryDiageoRelationshipOwners.ownerEmail}
                              </a>
                            </div>
                          )}
                          <InfoItem label="SVP" value={contact.primaryDiageoRelationshipOwners.svp} />
                        </div>
                      </div>
                    )}

                    {/* Sales Roles */}
                    {contact.primaryDiageoRelationshipOwners.sales && Object.keys(contact.primaryDiageoRelationshipOwners.sales).length > 0 && (
                      <>
                        {(contact.primaryDiageoRelationshipOwners.ownerName || contact.primaryDiageoRelationshipOwners.ownerEmail || contact.primaryDiageoRelationshipOwners.svp) && <Separator />}
                        <div>
                          <h4 className="font-semibold mb-3 text-sm text-gray-700 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Sales Roles
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(contact.primaryDiageoRelationshipOwners.sales).map(([role, cadence]) => {
                              const lastCheckIn = contact.primaryDiageoRelationshipOwners?.salesLastCheckIn?.[role];
                              return (
                                <div key={role} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">{role}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {cadence || 'Not set'}
                                    </Badge>
                                  </div>
                                  {lastCheckIn && (
                                    <p className="text-xs text-gray-600">
                                      Last Check In: {new Date(lastCheckIn).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Support Roles */}
                    {contact.primaryDiageoRelationshipOwners.support && Object.keys(contact.primaryDiageoRelationshipOwners.support).length > 0 && (
                      <>
                        {(contact.primaryDiageoRelationshipOwners.ownerName || contact.primaryDiageoRelationshipOwners.ownerEmail || contact.primaryDiageoRelationshipOwners.svp || Object.keys(contact.primaryDiageoRelationshipOwners.sales || {}).length > 0) && <Separator />}
                        <div>
                          <h4 className="font-semibold mb-3 text-sm text-gray-700 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Support Roles
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(contact.primaryDiageoRelationshipOwners.support).map(([role, cadence]) => {
                              const lastCheckIn = contact.primaryDiageoRelationshipOwners?.supportLastCheckIn?.[role];
                              return (
                                <div key={role} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">{role}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {cadence || 'Not set'}
                                    </Badge>
                                  </div>
                                  {lastCheckIn && (
                                    <p className="text-xs text-gray-600">
                                      Last Check In: {new Date(lastCheckIn).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Additional Notes & Files */}
        {contact.uploadedNotes && contact.uploadedNotes.length > 0 && (
          <AccordionItem value="notes">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Additional Notes & Files
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {contact.uploadedNotes.map((note) => (
                      <div key={note.id} className="p-4 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-gray-700">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(note.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        )}

      </Accordion>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Important Date</DialogTitle>
            <DialogDescription>
              Add a new important date for {displayName}. You can optionally enable alerts to be notified before the event.
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
                <div className="space-y-3 pl-6 pt-2">
                  <Label className="text-sm">
                    Alert me:
                  </Label>
                  <div className="space-y-2">
                    {(['same_day', 'day_before', 'week_before'] as const).map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`new-event-${option}`}
                          checked={newEventAlertOptions.includes(option)}
                          onCheckedChange={() => handleToggleNewEventAlertOption(option)}
                        />
                        <Label
                          htmlFor={`new-event-${option}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {getAlertOptionLabel(option)}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {newEventAlertOptions.length > 0 && (
                    <p className="text-xs text-gray-500">
                      You'll receive {newEventAlertOptions.length} alert{newEventAlertOptions.length !== 1 ? 's' : ''} for this event
                    </p>
                  )}
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
              setNewEventAlertOptions([]);
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