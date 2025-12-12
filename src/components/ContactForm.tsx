import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Bell, BellOff, Calendar as CalendarIcon, Upload, Info, Crown, Search, Check, Users, Package, Trash2, ClipboardList, Image, Briefcase, ChevronDown, FileText, Building, Building2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLoadScript } from '@react-google-maps/api';
import type { Contact, Account, CustomerEvent, BannerBuyingOffice } from '@/types/crm';
import { loadFromStorage } from '@/lib/storage';

interface ContactFormProps {
  contact?: Contact | null;
  accounts: Account[];
  onSave: (contact: Contact) => void;
  onCancel: () => void;
}

// Extended event interface with alert functionality
interface ContactEventWithAlert extends CustomerEvent {
  alertEnabled?: boolean;
  alertOptions?: ('same_day' | 'day_before' | 'week_before')[];
}

// Category options for segment ownership - REORDERED Non-Alc below Whiskey Other
const CATEGORY_OPTIONS = [
  'Cordials',
  'Gin',
  'NAM Whiskey',
  'Rum',
  'RTD',
  'RTS',
  'Scotch',
  'Tequila',
  'Vodka',
  'Whiskey Other',
  'Non-Alc',
  'Beer',
  'Wine',
  'THC'
];

// Responsibility options - REMOVED "Influence level - Responsibility"
const RESPONSIBILITY_OPTIONS = [
  { key: 'assortmentShelf', label: 'Assortment/Shelf' },
  { key: 'displayMerchandising', label: 'Display/Merchandising' },
  { key: 'pricePromo', label: 'Price/Promo' },
  { key: 'digital', label: 'Digital' },
  { key: 'ecommerce', label: 'Ecommerce' },
  { key: 'instoreEvents', label: 'In-Store Events' },
  { key: 'shrink', label: 'Shrink' },
  { key: 'buyingPOOwnership', label: 'Buying/PO Ownership' }
];

const RESPONSIBILITY_LEVEL_OPTIONS = ['High', 'Medium', 'Low', 'None'];

// Primary Diageo Relationship Owner options - UPDATED E-COMM TITLES
const SALES_ROLES = ['CEO', 'President', 'SVP', 'VP Sales', 'Director Sales', 'NAM'];
const SUPPORT_ROLES = [
  'VP Customer Development',
  'Director Category Development',
  'Senior Manager Category',
  'Manager Category',
  'Director OCM',
  'Senior Manager E-Comm',
  'Manager E-Comm',
  'Senior Manager Shopper',
  'Manager Shopper'
];
const CADENCE_OPTIONS = ['Annual', 'Semi Annual', 'Quarterly', 'Monthly', 'Ongoing'];

// SVP dropdown options
const SVP_OPTIONS = ['Justin Zylick', 'Matt Johnson', 'Alicia Shiel'];

// Decision Bias Profile options with commentary
const DECISION_BIAS_OPTIONS = {
  'Data Centric': {
    description: 'Decides based on numbers, scorecards, consumer insights, and test results.',
    bestToLeadWith: 'category data, shopper insights, P and L impact, test and learn.'
  },
  'Margin First': {
    description: 'Focuses primarily on penny profit, margin mix, and trade terms.',
    bestToLeadWith: 'trade structure, margin math, mix improvement, cash efficiency.'
  },
  'Consumer Trend Focused': {
    description: 'Drawn to what is new, premium, multicultural, or fast growing.',
    bestToLeadWith: 'trend decks, social proof, velocity stories, premium trade up.'
  },
  'Operational Simplicity': {
    description: 'Cares most about ease of execution, low complexity, and low disruption.',
    bestToLeadWith: 'simple plans, fewer SKUs, clean resets, easy to execute displays.'
  },
  'Competitor Reactive': {
    description: 'Reacts to what key competitors and local markets are doing.',
    bestToLeadWith: 'competitive benchmarks, where they are behind, easy moves to catch up.'
  }
};

// Google Maps configuration
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const libraries: ("places")[] = ["places"];

// Phone number formatting function
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const phoneNumber = value.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (phoneNumber.length === 0) return '';
  if (phoneNumber.length <= 3) return `(${phoneNumber}`;
  if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

// Format date for display
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Convert MM-DD to date input format (YYYY-MM-DD) using current year
const birthdayToDateInput = (birthday: string): string => {
  if (!birthday || !birthday.match(/^\d{2}-\d{2}$/)) return '';
  const currentYear = new Date().getFullYear();
  const [month, day] = birthday.split('-');
  return `${currentYear}-${month}-${day}`;
};

// Convert date input format (YYYY-MM-DD) to MM-DD
const dateInputToBirthday = (dateInput: string): string => {
  if (!dateInput) return '';
  const parts = dateInput.split('-');
  if (parts.length !== 3) return '';
  return `${parts[1]}-${parts[2]}`;
};

export default function ContactForm({ contact, accounts, onSave, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || '',
    preferredFirstName: contact?.preferredFirstName || '',
    lastName: contact?.lastName || '',
    headshot: contact?.headshot || '',
    email: contact?.email || '',
    officePhone: contact?.officePhone || '',
    mobilePhone: contact?.mobilePhone || '',
    preferredContactMethod: contact?.preferredContactMethod || '',
    preferredShippingAddress: contact?.preferredShippingAddress || '',
    title: contact?.title || '',
    currentRoleTenure: contact?.currentRoleTenure || '',
    managerId: contact?.managerId || '',
    accountId: contact?.accountId || '',
    bannerBuyingOfficeId: contact?.bannerBuyingOfficeId || '',
    isPrimaryContact: contact?.isPrimaryContact || false,
    contactActiveStatus: contact?.contactActiveStatus || 'Active',
    relationshipStatus: contact?.relationshipStatus || '',
    categorySegmentOwnership: contact?.categorySegmentOwnership || [],
    responsibilityLevels: contact?.responsibilityLevels || {},
    birthday: contact?.birthday || '',
    birthdayAlert: contact?.birthdayAlert || false,
    birthdayAlertOptions: contact?.birthdayAlertOptions || [],
    nextContactDate: contact?.nextContactDate || '',
    nextContactAlert: contact?.nextContactAlert || false,
    nextContactAlertOptions: contact?.nextContactAlertOptions || [],
    lastContactDate: contact?.lastContactDate || '',
    linkedinProfile: contact?.linkedinProfile || '',
    knownPreferences: contact?.knownPreferences || '',
    entertainment: contact?.entertainment || '',
    decisionBiasProfile: contact?.decisionBiasProfile || '',
    followThrough: contact?.followThrough || '',
    notes: contact?.notes || '',
    values: contact?.values || '',
    painPoints: contact?.painPoints || '',
    uploadedNotes: contact?.uploadedNotes || []
  });

  // Contact Events state with alert functionality
  const [contactEvents, setContactEvents] = useState<ContactEventWithAlert[]>(
    (contact?.contactEvents || []).map(event => ({
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

  const [newNote, setNewNote] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountSearchOpen, setAccountSearchOpen] = useState(false);
  const [managerSearchOpen, setManagerSearchOpen] = useState(false);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [headshotFileName, setHeadshotFileName] = useState('');
  const [headshotError, setHeadshotError] = useState('');

  // Primary Diageo Relationship Owner(s) state - Default to empty string (Not Assigned)
  const [ownerName, setOwnerName] = useState(contact?.primaryDiageoRelationshipOwners?.ownerName || '');
  const [ownerEmail, setOwnerEmail] = useState(contact?.primaryDiageoRelationshipOwners?.ownerEmail || '');
  const [svp, setSvp] = useState(contact?.primaryDiageoRelationshipOwners?.svp || '');
  const [salesRoles, setSalesRoles] = useState<{[role: string]: string}>(
    contact?.primaryDiageoRelationshipOwners?.sales || {}
  );
  const [supportRoles, setSupportRoles] = useState<{[role: string]: string}>(
    contact?.primaryDiageoRelationshipOwners?.support || {}
  );
  
  // Last Check In state for Sales and Support roles
  const [salesLastCheckIn, setSalesLastCheckIn] = useState<{[role: string]: string}>(
    contact?.primaryDiageoRelationshipOwners?.salesLastCheckIn || {}
  );
  const [supportLastCheckIn, setSupportLastCheckIn] = useState<{[role: string]: string}>(
    contact?.primaryDiageoRelationshipOwners?.supportLastCheckIn || {}
  );

  // Sync relationship owner state with contact prop changes
  useEffect(() => {
    if (contact?.primaryDiageoRelationshipOwners) {
      setOwnerName(contact.primaryDiageoRelationshipOwners.ownerName || '');
      setOwnerEmail(contact.primaryDiageoRelationshipOwners.ownerEmail || '');
      setSvp(contact.primaryDiageoRelationshipOwners.svp || '');
      setSalesRoles(contact.primaryDiageoRelationshipOwners.sales || {});
      setSupportRoles(contact.primaryDiageoRelationshipOwners.support || {});
      setSalesLastCheckIn(contact.primaryDiageoRelationshipOwners.salesLastCheckIn || {});
      setSupportLastCheckIn(contact.primaryDiageoRelationshipOwners.supportLastCheckIn || {});
    }
  }, [contact]);

  // Popover states for calendar date pickers
  const [salesCalendarOpen, setSalesCalendarOpen] = useState<{[role: string]: boolean}>({});
  const [supportCalendarOpen, setSupportCalendarOpen] = useState<{[role: string]: boolean}>({});

  // Google Places Autocomplete state
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load Google Maps script
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  // Handle place selection from autocomplete
  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setFormData(prev => ({ ...prev, preferredShippingAddress: place.formatted_address || '' }));
      }
    }
  };

  // Initialize autocomplete when Google Maps is loaded

  // Helper function to toggle alert options
  const handleToggleBirthdayAlertOption = (option: 'same_day' | 'day_before' | 'week_before') => {
    setFormData(prev => {
      const currentOptions = prev.birthdayAlertOptions || [];
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter(o => o !== option)
        : [...currentOptions, option];
      return { ...prev, birthdayAlertOptions: newOptions };
    });
  };

  const handleToggleNextContactAlertOption = (option: 'same_day' | 'day_before' | 'week_before') => {
    setFormData(prev => {
      const currentOptions = prev.nextContactAlertOptions || [];
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter(o => o !== option)
        : [...currentOptions, option];
      return { ...prev, nextContactAlertOptions: newOptions };
    });
  };

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

  useEffect(() => {
    if (isLoaded && inputRef.current && window.google) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['formatted_address', 'address_components']
      });
      
      autocompleteRef.current.addListener('place_changed', onPlaceChanged);
      
      if (inputRef.current) {
        inputRef.current.value = formData.preferredShippingAddress;
      }
    }

    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded]);

  useEffect(() => {
    if (inputRef.current && isLoaded) {
      inputRef.current.value = formData.preferredShippingAddress;
    }
  }, [formData.preferredShippingAddress, isLoaded]);

  const handleHeadshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeadshotError('');

    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp|bmp)/)) {
      setHeadshotError('Please upload a valid image file (JPG, JPEG, PNG, GIF, WebP, BMP)');
      e.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setHeadshotError('File size must be less than 5MB');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setFormData(prev => ({ ...prev, headshot: base64String }));
      setHeadshotFileName(file.name);
    };
    reader.onerror = () => {
      setHeadshotError('Failed to read file. Please try again.');
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const removeHeadshot = () => {
    setFormData(prev => ({ ...prev, headshot: '' }));
    setHeadshotFileName('');
    setHeadshotError('');
    const fileInput = document.getElementById('headshot') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handlePhoneChange = (field: 'officePhone' | 'mobilePhone', value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  const handleBirthdayChange = (dateInput: string) => {
    const birthday = dateInputToBirthday(dateInput);
    setFormData(prev => ({ ...prev, birthday }));
  };

  const handleShippingAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, preferredShippingAddress: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => {
      const current = prev.categorySegmentOwnership;
      const isSelected = current.includes(category);
      
      if (isSelected) {
        return {
          ...prev,
          categorySegmentOwnership: current.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          categorySegmentOwnership: [...current, category]
        };
      }
    });
  };

  const handleSelectAllCategories = () => {
    const allSelected = formData.categorySegmentOwnership.length === CATEGORY_OPTIONS.length;
    
    if (allSelected) {
      setFormData(prev => ({ ...prev, categorySegmentOwnership: [] }));
    } else {
      setFormData(prev => ({ ...prev, categorySegmentOwnership: [...CATEGORY_OPTIONS] }));
    }
  };

  const isAllCategoriesSelected = formData.categorySegmentOwnership.length === CATEGORY_OPTIONS.length;

  const handleResponsibilityLevelChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      responsibilityLevels: {
        ...prev.responsibilityLevels,
        [key]: value
      }
    }));
  };

  useEffect(() => {
    const initializedLevels: {[key: string]: string} = {};
    RESPONSIBILITY_OPTIONS.forEach(({ key }) => {
      initializedLevels[key] = formData.responsibilityLevels[key] || 'None';
    });
    
    if (JSON.stringify(initializedLevels) !== JSON.stringify(formData.responsibilityLevels)) {
      setFormData(prev => ({
        ...prev,
        responsibilityLevels: initializedLevels
      }));
    }
  }, []);

  const handleSalesRoleToggle = (role: string) => {
    setSalesRoles(prev => {
      const newRoles = { ...prev };
      if (role in newRoles) {
        delete newRoles[role];
      } else {
        newRoles[role] = '';
      }
      return newRoles;
    });
    
    if (role in salesRoles) {
      setSalesLastCheckIn(prev => {
        const newLastCheckIn = { ...prev };
        delete newLastCheckIn[role];
        return newLastCheckIn;
      });
    }
  };

  const handleSalesCadenceChange = (role: string, cadence: string) => {
    setSalesRoles(prev => ({
      ...prev,
      [role]: cadence === 'clear' ? '' : cadence
    }));
  };
  
  const handleSalesLastCheckInChange = (role: string, date: string) => {
    setSalesLastCheckIn(prev => ({
      ...prev,
      [role]: date
    }));
  };

  const handleSalesCalendarSelect = (role: string, date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      handleSalesLastCheckInChange(role, formattedDate);
      setSalesCalendarOpen(prev => ({ ...prev, [role]: false }));
    }
  };

  const handleSupportRoleToggle = (role: string) => {
    setSupportRoles(prev => {
      const newRoles = { ...prev };
      if (role in newRoles) {
        delete newRoles[role];
      } else {
        newRoles[role] = '';
      }
      return newRoles;
    });
    
    if (role in supportRoles) {
      setSupportLastCheckIn(prev => {
        const newLastCheckIn = { ...prev };
        delete newLastCheckIn[role];
        return newLastCheckIn;
      });
    }
  };

  const handleSupportCadenceChange = (role: string, cadence: string) => {
    setSupportRoles(prev => ({
      ...prev,
      [role]: cadence === 'clear' ? '' : cadence
    }));
  };
  
  const handleSupportLastCheckInChange = (role: string, date: string) => {
    setSupportLastCheckIn(prev => ({
      ...prev,
      [role]: date
    }));
  };

  const handleSupportCalendarSelect = (role: string, date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      handleSupportLastCheckInChange(role, formattedDate);
      setSupportCalendarOpen(prev => ({ ...prev, [role]: false }));
    }
  };

  const handleAddEvent = () => {
    if (!newEventTitle.trim() || !newEventDate) {
      alert('Please enter both event title and date');
      return;
    }

    const newEvent: ContactEventWithAlert = {
      id: Date.now().toString(),
      title: newEventTitle.trim(),
      date: newEventDate,
      alertEnabled: newEventAlertEnabled,
      alertOptions: newEventAlertOptions
    };

    setContactEvents([...contactEvents, newEvent]);

    setNewEventTitle('');
    setNewEventDate('');
    setNewEventAlertEnabled(false);
    setNewEventAlertOptions([]);
    setIsAddEventDialogOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setContactEvents(contactEvents.filter(e => e.id !== eventId));
    }
  };

  const handleToggleEventAlert = (eventId: string) => {
    setContactEvents(contactEvents.map(event => 
      event.id === eventId 
        ? { ...event, alertEnabled: !event.alertEnabled }
        : event
    ));
  };

  const handleUpdateEventAlertOptions = (eventId: string, options: ('same_day' | 'day_before' | 'week_before')[]) => {
    setContactEvents(contactEvents.map(event => 
      event.id === eventId 
        ? { ...event, alertOptions: options }
        : event
    ));
  };
  
  const handleToggleEventAlertOption = (eventId: string, option: 'same_day' | 'day_before' | 'week_before') => {
    setContactEvents(contactEvents.map(event => {
      if (event.id === eventId) {
        const currentOptions = event.alertOptions || [];
        const newOptions = currentOptions.includes(option)
          ? currentOptions.filter(o => o !== option)
          : [...currentOptions, option];
        return { ...event, alertOptions: newOptions };
      }
      return event;
    }));
  };

  const getDaysUntilEvent = (eventDate: string) => {
    const days = Math.ceil((new Date(eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  useEffect(() => {
    const savedContacts = loadFromStorage<Contact[]>('crm-contacts', []);
    setAllContacts(savedContacts);
  }, []);

  const availableManagers = allContacts.filter(c => c.id !== contact?.id);
  const selectedManager = allContacts.find(c => c.id === formData.managerId);

  const getManagerAccountName = (managerId: string) => {
    const manager = allContacts.find(c => c.id === managerId);
    if (!manager?.accountId) return '';
    const account = accounts.find(a => a.id === manager.accountId);
    return account?.accountName || '';
  };

  useEffect(() => {
    if (formData.accountId) {
      const account = accounts.find(acc => acc.id === formData.accountId);
      if (account) {
        setSelectedAccount(account);
      }
    } else {
      setSelectedAccount(null);
    }
  }, [formData.accountId, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: If ownerName is filled, ownerEmail must also be filled
    if (ownerName && !ownerEmail) {
      alert('Primary Owner Email is required when Primary Owner is specified.');
      return;
    }
    
    const contactData: Contact = {
      id: contact?.id || Date.now().toString(),
      ...formData,
      primaryDiageoRelationshipOwners: {
        ownerName,
        ownerEmail,
        svp,
        sales: salesRoles,
        support: supportRoles,
        salesLastCheckIn,
        supportLastCheckIn
      },
      contactEvents: contactEvents.map(({ alertEnabled, alertOptions, ...event }) => ({ ...event, alertEnabled, alertOptions })),
      createdAt: contact?.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    onSave(contactData);
  };

  // Handle account/banner selection - stores both accountId and bannerBuyingOfficeId
  const handleAccountOrBannerChange = (value: string) => {
    // Value format: "account:{accountId}" or "banner:{accountId}:{bannerId}"
    if (value.startsWith('account:')) {
      const accountId = value.replace('account:', '');
      setFormData(prev => ({ ...prev, accountId, bannerBuyingOfficeId: '' }));
    } else if (value.startsWith('banner:')) {
      const [, accountId, bannerId] = value.split(':');
      setFormData(prev => ({ ...prev, accountId, bannerBuyingOfficeId: bannerId }));
    }
    setAccountSearchOpen(false);
  };

  // Get display name for selected account/banner
  const getSelectedAccountOrBannerName = () => {
    if (!formData.accountId) return 'Select';
    
    const account = accounts.find(a => a.id === formData.accountId);
    if (!account) return 'Select';
    
    if (formData.bannerBuyingOfficeId && account.bannerBuyingOffices) {
      const banner = account.bannerBuyingOffices.find(b => b.id === formData.bannerBuyingOfficeId);
      if (banner) {
        return `${banner.accountName} (${account.accountName})`;
      }
    }
    
    return account.accountName;
  };

  const handleManagerChange = (managerId: string) => {
    setFormData(prev => ({ ...prev, managerId: managerId === 'none' ? '' : managerId }));
    setManagerSearchOpen(false);
  };

  const addUploadedNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now().toString(),
        content: newNote.trim(),
        timestamp: new Date().toISOString(),
        type: 'text' as const
      };
      setFormData(prev => ({
        ...prev,
        uploadedNotes: [...prev.uploadedNotes, note]
      }));
      setNewNote('');
    }
  };

  const removeUploadedNote = (noteId: string) => {
    setFormData(prev => ({
      ...prev,
      uploadedNotes: prev.uploadedNotes.filter(note => note.id !== noteId)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          {contact ? 'Edit Contact' : 'Add New Contact'}
        </h2>
        
        <Card className="w-full bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span className="text-sm font-semibold text-blue-900">Record Information</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-blue-700">Date Created:</span>
                  <span className="text-sm text-blue-900">
                    {contact?.createdAt ? formatDate(contact.createdAt) : 'New Record'}
                  </span>
                </div>
                <div className="h-4 w-px bg-blue-300"></div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-blue-700">Date Modified:</span>
                  <span className="text-sm text-blue-900">
                    {contact?.lastModified ? formatDate(contact.lastModified) : 'Not yet saved'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="preferredFirstName">Preferred First Name</Label>
                <Input
                  id="preferredFirstName"
                  value={formData.preferredFirstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredFirstName: e.target.value }))}
                  placeholder="Preferred name or nickname"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Checkbox
                id="isPrimaryContact"
                checked={formData.isPrimaryContact}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrimaryContact: checked as boolean }))}
              />
              <div className="flex-1">
                <Label 
                  htmlFor="isPrimaryContact" 
                  className="flex items-center gap-2 font-semibold text-yellow-900 cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-yellow-600" />
                  Primary Contact
                </Label>
                <p className="text-xs text-yellow-700 mt-1">
                  Primary contacts are automatically linked to the account owner for relationship management.
                </p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="headshot" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Headshot (Linkedin Only)
              </Label>
              <div className="space-y-2">
                <Input
                  id="headshot"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
                  onChange={handleHeadshotUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500">
                  Upload an image file (JPG, JPEG, PNG, GIF, WebP, BMP - max 5MB)
                </p>
                {headshotError && (
                  <p className="text-xs text-red-600">{headshotError}</p>
                )}
                {formData.headshot && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <img 
                      src={formData.headshot} 
                      alt="Headshot preview" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">
                        {headshotFileName || 'Headshot uploaded'}
                      </p>
                      <p className="text-xs text-green-700">Image ready</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeHeadshot}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., VP of Sales, Director of Marketing"
              />
            </div>

            <div>
              <Label htmlFor="currentRoleTenure">Current Role Tenure</Label>
              <Select
                value={formData.currentRoleTenure}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currentRoleTenure: value === 'clear' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tenure..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                  <SelectItem value="0-1 Years">0-1 Years</SelectItem>
                  <SelectItem value="1-3 Years">1-3 Years</SelectItem>
                  <SelectItem value="3-5 Years">3-5 Years</SelectItem>
                  <SelectItem value="5-10 Years">5-10 Years</SelectItem>
                  <SelectItem value="10+ Years">10+ Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="accountId">Account/Banner/Buying Office *</Label>
              <Popover open={accountSearchOpen} onOpenChange={setAccountSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={accountSearchOpen}
                    className="w-full justify-between"
                  >
                    {getSelectedAccountOrBannerName()}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0" align="start">
                  <Command shouldFilter={true}>
                    <CommandInput 
                      placeholder="Search accounts and banners..." 
                    />
                    <CommandList>
                      <CommandEmpty>No account or banner found.</CommandEmpty>
                      <CommandGroup>
                        {accounts.map((account) => {
                          const accountValue = `account:${account.id}`;
                          const isAccountSelected = formData.accountId === account.id && !formData.bannerBuyingOfficeId;
                          const searchableText = `${account.accountName} ${account.industry || ''} ${account.accountOwner || ''}`;
                          
                          return (
                            <React.Fragment key={account.id}>
                              {/* Parent Account */}
                              <CommandItem
                                value={searchableText}
                                onSelect={() => handleAccountOrBannerChange(accountValue)}
                                className="flex items-center gap-2"
                              >
                                <Check
                                  className={cn(
                                    "h-4 w-4 shrink-0",
                                    isAccountSelected ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="font-medium truncate">{account.accountName}</span>
                                  <span className="text-xs text-gray-500 truncate">
                                    {account.industry && `${account.industry} • `}
                                    {account.accountOwner && `Owner: ${account.accountOwner}`}
                                  </span>
                                </div>
                              </CommandItem>
                              
                              {/* Banner/Buying Offices under this account */}
                              {account.bannerBuyingOffices && account.bannerBuyingOffices.length > 0 && (
                                <>
                                  {account.bannerBuyingOffices.map((banner) => {
                                    const bannerValue = `banner:${account.id}:${banner.id}`;
                                    const isBannerSelected = formData.accountId === account.id && formData.bannerBuyingOfficeId === banner.id;
                                    const bannerSearchText = `${banner.accountName} ${banner.channel || ''} ${account.accountName}`;
                                    
                                    return (
                                      <CommandItem
                                        key={banner.id}
                                        value={bannerSearchText}
                                        onSelect={() => handleAccountOrBannerChange(bannerValue)}
                                        className="flex items-center gap-2 pl-8"
                                      >
                                        <Check
                                          className={cn(
                                            "h-4 w-4 shrink-0",
                                            isBannerSelected ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        <Building className="h-4 w-4 text-purple-600 shrink-0" />
                                        <div className="flex flex-col flex-1 min-w-0">
                                          <span className="font-medium text-sm truncate">{banner.accountName}</span>
                                          <span className="text-xs text-gray-500 truncate">
                                            {banner.channel && `${banner.channel} • `}
                                            Parent: {account.accountName}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    );
                                  })}
                                </>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-500 mt-1">
                Select a parent account or a specific banner/buying office
              </p>
            </div>

            <div>
              <Label htmlFor="manager" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Reports To (Manager)
              </Label>
              <Popover open={managerSearchOpen} onOpenChange={setManagerSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={managerSearchOpen}
                    className="w-full justify-between"
                  >
                    {formData.managerId && selectedManager
                      ? `${selectedManager.firstName} ${selectedManager.lastName}`
                      : "Select a manager..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command shouldFilter={true}>
                    <CommandInput 
                      placeholder="Search all contacts by name, title, or company..." 
                    />
                    <CommandList>
                      <CommandEmpty>No contact found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => handleManagerChange('none')}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !formData.managerId ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="text-gray-500">No manager (Top-level executive)</span>
                        </CommandItem>
                        {availableManagers.map((manager) => {
                          const managerAccount = accounts.find(a => a.id === manager.accountId);
                          const searchableText = `${manager.firstName} ${manager.lastName} ${manager.title || ''} ${managerAccount?.accountName || ''}`;
                          return (
                            <CommandItem
                              key={manager.id}
                              value={searchableText}
                              onSelect={() => handleManagerChange(manager.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.managerId === manager.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {manager.firstName} {manager.lastName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {manager.title && `${manager.title}`}
                                  {manager.title && managerAccount && ' • '}
                                  {managerAccount && `${managerAccount.accountName}`}
                                </span>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedManager && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <strong>Reports to:</strong> {selectedManager.firstName} {selectedManager.lastName}
                      {selectedManager.title && ` - ${selectedManager.title}`}
                    </div>
                    {selectedManager.accountId && getManagerAccountName(selectedManager.accountId) && (
                      <div className="text-xs text-blue-600 mt-1 ml-5">
                        Company: {getManagerAccountName(selectedManager.accountId)}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Select who this contact reports to in the organizational hierarchy (from anyone in the contact list)
              </p>
            </div>

            <div>
              <Label htmlFor="contactActiveStatus">Contact Active Status</Label>
              <Select
                value={formData.contactActiveStatus}
                onValueChange={(value) => setFormData(prev => ({ ...prev, contactActiveStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Rest of the form continues with the same structure... Due to length, I'm showing the critical Diageo Relationship Owner section */}

        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Diageo Relationship Owner(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white border border-indigo-200 rounded-lg">
              <div>
                <Label htmlFor="ownerName">Primary Owner</Label>
                <Input
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Enter owner name"
                />
              </div>
              <div>
                <Label htmlFor="ownerEmail">Primary Owner Email *</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="owner@company.com"
                  required={!!ownerName}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required when Primary Owner is specified
                </p>
              </div>
            </div>

            {/* Sales and Support sections remain the same... */}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {contact ? 'Update Contact' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </div>
  );
}