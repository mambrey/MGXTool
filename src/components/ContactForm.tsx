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
  alertOptions?: string[];
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
  'Margin Maximizer': {
    description: 'Focuses primarily on penny profit, margin mix, and trade terms.',
    bestToLeadWith: 'trade structure, margin math, mix improvement, cash efficiency.'
  },
  'Price Leadership': {
    description: 'Prioritizes competitive pricing and market share through aggressive price positioning.',
    bestToLeadWith: 'competitive pricing analysis, market share data, volume growth opportunities, price elasticity studies.'
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
  const [newEventAlertOptions, setNewEventAlertOptions] = useState<string[]>([]);

  // State for custom alert days
  const [birthdayCustomDays, setBirthdayCustomDays] = useState<string>('');
  const [nextContactCustomDays, setNextContactCustomDays] = useState<string>('');
  const [newEventCustomDays, setNewEventCustomDays] = useState<string>('');
  const [eventCustomDays, setEventCustomDays] = useState<{[key: string]: string}>({});

  const [newNote, setNewNote] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountSearchOpen, setAccountSearchOpen] = useState(false);
  const [managerSearchOpen, setManagerSearchOpen] = useState(false);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [headshotFileName, setHeadshotFileName] = useState('');
  const [headshotError, setHeadshotError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Primary Diageo Relationship Owner(s) state - Default to empty string (Not Assigned)
  const [ownerName, setOwnerName] = useState(contact?.primaryDiageoRelationshipOwners?.ownerName || '');
  const [ownerTitle, setOwnerTitle] = useState(contact?.primaryDiageoRelationshipOwners?.ownerTitle || '');
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
      setOwnerTitle(contact.primaryDiageoRelationshipOwners.ownerTitle || '');
      setOwnerName(contact.primaryDiageoRelationshipOwners.ownerName || '');
      setOwnerEmail(contact.primaryDiageoRelationshipOwners.ownerEmail || '');
      setSvp(contact.primaryDiageoRelationshipOwners.svp || '');
      setSalesRoles(contact.primaryDiageoRelationshipOwners.sales || {});
      setSupportRoles(contact.primaryDiageoRelationshipOwners.support || {});
      setSalesLastCheckIn(contact.primaryDiageoRelationshipOwners.salesLastCheckIn || {});
      setSupportLastCheckIn(contact.primaryDiageoRelationshipOwners.supportLastCheckIn || {});
    }
  }, [contact]);

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

  // Helper function to toggle alert options - UPDATED FOR NEW ALERT SYSTEM
  const handleToggleBirthdayAlertOption = (option: string) => {
    setFormData(prev => {
      const currentOptions = prev.birthdayAlertOptions || [];
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter(o => o !== option)
        : [...currentOptions, option];
      return { ...prev, birthdayAlertOptions: newOptions };
    });
  };

  const handleToggleNextContactAlertOption = (option: string) => {
    setFormData(prev => {
      const currentOptions = prev.nextContactAlertOptions || [];
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter(o => o !== option)
        : [...currentOptions, option];
      return { ...prev, nextContactAlertOptions: newOptions };
    });
  };

  const handleToggleNewEventAlertOption = (option: string) => {
    setNewEventAlertOptions(prev => {
      return prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option];
    });
  };

  // Custom days handlers
  const handleBirthdayCustomDaysChange = (value: string) => {
    setBirthdayCustomDays(value);
    const currentOptions = formData.birthdayAlertOptions || [];
    const filteredOptions = currentOptions.filter(opt => !opt.startsWith('custom_'));
    
    if (value && parseInt(value) > 0) {
      const customOption = `custom_${value}`;
      setFormData(prev => ({ ...prev, birthdayAlertOptions: [...filteredOptions, customOption] }));
    } else {
      setFormData(prev => ({ ...prev, birthdayAlertOptions: filteredOptions }));
    }
  };

  const handleNextContactCustomDaysChange = (value: string) => {
    setNextContactCustomDays(value);
    const currentOptions = formData.nextContactAlertOptions || [];
    const filteredOptions = currentOptions.filter(opt => !opt.startsWith('custom_'));
    
    if (value && parseInt(value) > 0) {
      const customOption = `custom_${value}`;
      setFormData(prev => ({ ...prev, nextContactAlertOptions: [...filteredOptions, customOption] }));
    } else {
      setFormData(prev => ({ ...prev, nextContactAlertOptions: filteredOptions }));
    }
  };

  const handleNewEventCustomDaysChange = (value: string) => {
    setNewEventCustomDays(value);
    const filteredOptions = newEventAlertOptions.filter(opt => !opt.startsWith('custom_'));
    
    if (value && parseInt(value) > 0) {
      const customOption = `custom_${value}`;
      setNewEventAlertOptions([...filteredOptions, customOption]);
    } else {
      setNewEventAlertOptions(filteredOptions);
    }
  };

  const handleEventCustomDaysChange = (eventId: string, value: string) => {
    setEventCustomDays(prev => ({ ...prev, [eventId]: value }));
    
    setContactEvents(contactEvents.map(event => {
      if (event.id === eventId) {
        const currentOptions = event.alertOptions || [];
        const filteredOptions = currentOptions.filter(opt => !opt.startsWith('custom_'));
        
        if (value && parseInt(value) > 0) {
          const customOption = `custom_${value}`;
          return { ...event, alertOptions: [...filteredOptions, customOption] };
        }
        return { ...event, alertOptions: filteredOptions };
      }
      return event;
    }));
  };

  const getAlertOptionLabel = (option: string): string => {
    if (option === '30_days_before') return '30 Days Before';
    if (option === '7_days_before') return '7 Days Before';
    if (option === '1_day_before') return '1 Day Before';
    if (option.startsWith('custom_')) {
      const days = option.replace('custom_', '');
      return `${days} Days Before`;
    }
    return option;
  };

  const isBirthdayCustomChecked = (formData.birthdayAlertOptions || []).some(opt => opt.startsWith('custom_'));
  const isNextContactCustomChecked = (formData.nextContactAlertOptions || []).some(opt => opt.startsWith('custom_'));
  const isNewEventCustomChecked = newEventAlertOptions.some(opt => opt.startsWith('custom_'));
  
  const getEventCustomChecked = (event: ContactEventWithAlert) => {
    return (event.alertOptions || []).some(opt => opt.startsWith('custom_'));
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
  
  const handleSalesLastCheckInChange = (role: string, value: string) => {
    if (value) {
      setSalesLastCheckIn(prev => ({
        ...prev,
        [role]: value
      }));
    } else {
      setSalesLastCheckIn(prev => {
        const newLastCheckIn = { ...prev };
        delete newLastCheckIn[role];
        return newLastCheckIn;
      });
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
  
  const handleSupportLastCheckInChange = (role: string, value: string) => {
    if (value) {
      setSupportLastCheckIn(prev => ({
        ...prev,
        [role]: value
      }));
    } else {
      setSupportLastCheckIn(prev => {
        const newLastCheckIn = { ...prev };
        delete newLastCheckIn[role];
        return newLastCheckIn;
      });
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
    setNewEventCustomDays('');
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

  const handleToggleEventAlertOption = (eventId: string, option: string) => {
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
        ownerTitle,
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

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const note = {
          id: Date.now().toString() + Math.random(),
          content: `Uploaded file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
          timestamp: new Date().toISOString(),
          type: 'file' as const,
          fileName: file.name,
          fileData: e.target?.result as string,
          fileType: file.type
        };
        setFormData(prev => ({
          ...prev,
          uploadedNotes: [...prev.uploadedNotes, note]
        }));
      };
      reader.onerror = () => {
        alert(`Failed to read file: ${file.name}`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="officePhone">Office Phone</Label>
                <Input
                  id="officePhone"
                  type="tel"
                  value={formData.officePhone}
                  onChange={(e) => handlePhoneChange('officePhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                />
              </div>
              <div>
                <Label htmlFor="mobilePhone">Mobile Phone</Label>
                <Input
                  id="mobilePhone"
                  type="tel"
                  value={formData.mobilePhone}
                  onChange={(e) => handlePhoneChange('mobilePhone', e.target.value)}
                  placeholder="(555) 987-6543"
                  maxLength={14}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
              <Select value={formData.preferredContactMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredContactMethod: value === 'clear' ? '' : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact method..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                  <SelectItem value="mobile phone">Mobile</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="office phone">Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="preferredShippingAddress">Preferred Shipping Address</Label>
              {isLoaded ? (
                <Input
                  ref={inputRef}
                  id="preferredShippingAddress"
                  onChange={handleShippingAddressChange}
                  placeholder="Start typing address..."
                  className="w-full"
                />
              ) : (
                <Input
                  id="preferredShippingAddress"
                  value={formData.preferredShippingAddress}
                  onChange={handleShippingAddressChange}
                  placeholder="Street address, City, State, ZIP"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                {isLoaded ? 'Start typing to see address suggestions' : 'Enter shipping address'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ways of Working</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="relationshipStatus">Advocacy Style</Label>
              <Select 
                value={formData.relationshipStatus} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, relationshipStatus: value === 'clear' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select advocacy style..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                  <SelectItem value="Promoter | Champions our partnership">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#166534'}}></div>
                      <span>Promoter | Champions our partnership</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Supporter | Leans in consistently">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#16a34a'}}></div>
                      <span>Supporter | Leans in consistently</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Neutral | Transactional, low engagement">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#6b7280'}}></div>
                      <span>Neutral | Transactional, low engagement</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Detractor | Resists our efforts">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#ef4444'}}></div>
                      <span>Detractor | Resists our efforts</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Adversarial | Actively works against">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#991b1b'}}></div>
                      <span>Adversarial | Actively works against</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="categorySegmentOwnership" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Category/Segment Ownership
              </Label>
              <div className="mt-2 p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-blue-50 border border-blue-200 rounded">
                  <Checkbox
                    id="selectAllCategories"
                    checked={isAllCategoriesSelected}
                    onCheckedChange={handleSelectAllCategories}
                  />
                  <Label 
                    htmlFor="selectAllCategories" 
                    className="font-semibold text-blue-900 cursor-pointer flex-1"
                  >
                    Select All
                  </Label>
                  <Badge variant="secondary" className="text-xs">
                    {formData.categorySegmentOwnership.length} / {CATEGORY_OPTIONS.length}
                  </Badge>
                </div>

                <Separator />

                <ScrollArea className="h-[200px] pr-3">
                  <div className="space-y-2">
                    {CATEGORY_OPTIONS.map((category) => (
                      <div key={category} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={`category-${category}`}
                          checked={formData.categorySegmentOwnership.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <Label 
                          htmlFor={`category-${category}`} 
                          className="cursor-pointer flex-1"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              {formData.categorySegmentOwnership.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.categorySegmentOwnership.map((category) => (
                    <Badge key={category} variant="secondary" className="flex items-center gap-1">
                      {category}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-500" 
                        onClick={() => handleCategoryToggle(category)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Select the product categories or segments this contact is responsible for
              </p>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-3">
                <ClipboardList className="w-4 h-4" />
                Responsibility Level
              </Label>
              <div className="space-y-2 p-4 border border-gray-200 rounded-lg">
                {RESPONSIBILITY_OPTIONS.map(({ key, label }) => (
                  <div key={key} className="grid grid-cols-12 gap-3 items-center p-2 hover:bg-gray-50 rounded">
                    <Label 
                      htmlFor={`responsibility-${key}`} 
                      className="col-span-8 text-sm"
                    >
                      {label}
                    </Label>
                    <div className="col-span-4">
                      <Select
                        value={formData.responsibilityLevels[key] || 'None'}
                        onValueChange={(value) => handleResponsibilityLevelChange(key, value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RESPONSIBILITY_LEVEL_OPTIONS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Select the level of responsibility for each area (defaults to None)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Important Dates
              </CardTitle>
              <Button type="button" size="sm" onClick={() => setIsAddEventDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday (Month & Day)</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={birthdayToDateInput(formData.birthday)}
                  onChange={(e) => handleBirthdayChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
                
                <div className="space-y-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-600" />
                      <Label htmlFor="birthday-alert" className="text-sm font-medium cursor-pointer">
                        Enable Alert
                      </Label>
                    </div>
                    <Switch
                      id="birthday-alert"
                      checked={formData.birthdayAlert}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, birthdayAlert: checked }))}
                    />
                  </div>
                  
                  {formData.birthdayAlert && (
                    <div className="space-y-2 pl-6">
                      <Label className="text-sm text-gray-600">
                        Alert me:
                      </Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="birthday-30-days"
                            checked={(formData.birthdayAlertOptions || []).includes('30_days_before')}
                            onCheckedChange={() => handleToggleBirthdayAlertOption('30_days_before')}
                          />
                          <Label htmlFor="birthday-30-days" className="text-sm font-normal cursor-pointer">
                            30 Days Before
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="birthday-7-days"
                            checked={(formData.birthdayAlertOptions || []).includes('7_days_before')}
                            onCheckedChange={() => handleToggleBirthdayAlertOption('7_days_before')}
                          />
                          <Label htmlFor="birthday-7-days" className="text-sm font-normal cursor-pointer">
                            7 Days Before
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="birthday-1-day"
                            checked={(formData.birthdayAlertOptions || []).includes('1_day_before')}
                            onCheckedChange={() => handleToggleBirthdayAlertOption('1_day_before')}
                          />
                          <Label htmlFor="birthday-1-day" className="text-sm font-normal cursor-pointer">
                            1 Day Before
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="birthday-custom"
                            checked={isBirthdayCustomChecked}
                            onCheckedChange={(checked) => {
                              if (!checked) {
                                setBirthdayCustomDays('');
                                const filteredOptions = (formData.birthdayAlertOptions || []).filter(opt => !opt.startsWith('custom_'));
                                setFormData(prev => ({ ...prev, birthdayAlertOptions: filteredOptions }));
                              }
                            }}
                          />
                          <Label htmlFor="birthday-custom" className="text-sm font-normal cursor-pointer">
                            Custom:
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="days"
                            value={birthdayCustomDays}
                            onChange={(e) => handleBirthdayCustomDaysChange(e.target.value)}
                            className="w-20 h-7 text-xs"
                            disabled={!isBirthdayCustomChecked}
                          />
                          <span className="text-sm text-gray-600">days before</span>
                        </div>
                      </div>
                      {(formData.birthdayAlertOptions || []).length > 0 && (
                        <p className="text-xs text-gray-500">
                          You'll receive {(formData.birthdayAlertOptions || []).length} alert{(formData.birthdayAlertOptions || []).length !== 1 ? 's' : ''} for this date
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nextContactDate">Next Contact Date</Label>
                <Input
                  id="nextContactDate"
                  type="date"
                  value={formData.nextContactDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextContactDate: e.target.value }))}
                />
                
                <div className="space-y-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-600" />
                      <Label htmlFor="next-contact-alert" className="text-sm font-medium cursor-pointer">
                        Enable Alert
                      </Label>
                    </div>
                    <Switch
                      id="next-contact-alert"
                      checked={formData.nextContactAlert}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, nextContactAlert: checked }))}
                    />
                  </div>
                  
                  {formData.nextContactAlert && (
                    <div className="space-y-2 pl-6">
                      <Label className="text-sm text-gray-600">
                        Alert me:
                      </Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="next-contact-30-days"
                            checked={(formData.nextContactAlertOptions || []).includes('30_days_before')}
                            onCheckedChange={() => handleToggleNextContactAlertOption('30_days_before')}
                          />
                          <Label htmlFor="next-contact-30-days" className="text-sm font-normal cursor-pointer">
                            30 Days Before
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="next-contact-7-days"
                            checked={(formData.nextContactAlertOptions || []).includes('7_days_before')}
                            onCheckedChange={() => handleToggleNextContactAlertOption('7_days_before')}
                          />
                          <Label htmlFor="next-contact-7-days" className="text-sm font-normal cursor-pointer">
                            7 Days Before
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="next-contact-1-day"
                            checked={(formData.nextContactAlertOptions || []).includes('1_day_before')}
                            onCheckedChange={() => handleToggleNextContactAlertOption('1_day_before')}
                          />
                          <Label htmlFor="next-contact-1-day" className="text-sm font-normal cursor-pointer">
                            1 Day Before
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="next-contact-custom"
                            checked={isNextContactCustomChecked}
                            onCheckedChange={(checked) => {
                              if (!checked) {
                                setNextContactCustomDays('');
                                const filteredOptions = (formData.nextContactAlertOptions || []).filter(opt => !opt.startsWith('custom_'));
                                setFormData(prev => ({ ...prev, nextContactAlertOptions: filteredOptions }));
                              }
                            }}
                          />
                          <Label htmlFor="next-contact-custom" className="text-sm font-normal cursor-pointer">
                            Custom:
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="days"
                            value={nextContactCustomDays}
                            onChange={(e) => handleNextContactCustomDaysChange(e.target.value)}
                            className="w-20 h-7 text-xs"
                            disabled={!isNextContactCustomChecked}
                          />
                          <span className="text-sm text-gray-600">days before</span>
                        </div>
                      </div>
                      {(formData.nextContactAlertOptions || []).length > 0 && (
                        <p className="text-xs text-gray-500">
                          You'll receive {(formData.nextContactAlertOptions || []).length} alert{(formData.nextContactAlertOptions || []).length !== 1 ? 's' : ''} for this date
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="lastContactDate">Last Contact Date</Label>
              <Input
                id="lastContactDate"
                type="date"
                value={formData.lastContactDate}
                onChange={(e) => setFormData(prev => ({ ...prev, lastContactDate: e.target.value }))}
              />
            </div>

            {contactEvents.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Custom Events ({contactEvents.length})</h4>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                      {contactEvents.map((event) => {
                        const daysUntil = getDaysUntilEvent(event.date);
                        const isUpcoming = daysUntil >= 0 && (event.alertOptions || []).some(opt => {
                          if (opt === '30_days_before') return daysUntil <= 30;
                          if (opt === '7_days_before') return daysUntil <= 7;
                          if (opt === '1_day_before') return daysUntil <= 1;
                          if (opt.startsWith('custom_')) {
                            const customDays = parseInt(opt.replace('custom_', ''));
                            return daysUntil <= customDays;
                          }
                          return false;
                        });
                        
                        return (
                          <Card key={event.id} className={`p-3 ${isUpcoming && event.alertEnabled ? 'border-orange-300 bg-orange-50' : ''}`}>
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <CalendarIcon className="w-3 h-3" />
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
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>

                              <div className="pt-2 border-t border-gray-200 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {event.alertEnabled ? (
                                      <Bell className="w-3 h-3 text-orange-600" />
                                    ) : (
                                      <BellOff className="w-3 h-3 text-gray-400" />
                                    )}
                                    <Label htmlFor={`alert-${event.id}`} className="text-xs font-medium cursor-pointer">
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
                                  <div className="space-y-2 pl-5">
                                    <Label className="text-xs text-gray-600">
                                      Alert me:
                                    </Label>
                                    <div className="space-y-1.5">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`event-${event.id}-30-days`}
                                          checked={(event.alertOptions || []).includes('30_days_before')}
                                          onCheckedChange={() => handleToggleEventAlertOption(event.id, '30_days_before')}
                                          className="h-3 w-3"
                                        />
                                        <Label
                                          htmlFor={`event-${event.id}-30-days`}
                                          className="text-xs font-normal cursor-pointer"
                                        >
                                          30 Days Before
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`event-${event.id}-7-days`}
                                          checked={(event.alertOptions || []).includes('7_days_before')}
                                          onCheckedChange={() => handleToggleEventAlertOption(event.id, '7_days_before')}
                                          className="h-3 w-3"
                                        />
                                        <Label
                                          htmlFor={`event-${event.id}-7-days`}
                                          className="text-xs font-normal cursor-pointer"
                                        >
                                          7 Days Before
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`event-${event.id}-1-day`}
                                          checked={(event.alertOptions || []).includes('1_day_before')}
                                          onCheckedChange={() => handleToggleEventAlertOption(event.id, '1_day_before')}
                                          className="h-3 w-3"
                                        />
                                        <Label
                                          htmlFor={`event-${event.id}-1-day`}
                                          className="text-xs font-normal cursor-pointer"
                                        >
                          1 Day Before
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`event-${event.id}-custom`}
                                          checked={getEventCustomChecked(event)}
                                          onCheckedChange={(checked) => {
                                            if (!checked) {
                                              setEventCustomDays(prev => {
                                                const newState = { ...prev };
                                                delete newState[event.id];
                                                return newState;
                                              });
                                              const filteredOptions = (event.alertOptions || []).filter(opt => !opt.startsWith('custom_'));
                                              setContactEvents(contactEvents.map(e => 
                                                e.id === event.id ? { ...e, alertOptions: filteredOptions } : e
                                              ));
                                            }
                                          }}
                                          className="h-3 w-3"
                                        />
                                        <Label htmlFor={`event-${event.id}-custom`} className="text-xs font-normal cursor-pointer">
                                          Custom:
                                        </Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          placeholder="days"
                                          value={eventCustomDays[event.id] || ''}
                                          onChange={(e) => handleEventCustomDaysChange(event.id, e.target.value)}
                                          className="w-16 h-6 text-xs"
                                          disabled={!getEventCustomChecked(event)}
                                        />
                                        <span className="text-xs text-gray-600">days before</span>
                                      </div>
                                    </div>
                                    {isUpcoming && (event.alertOptions || []).length > 0 && (
                                      <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded mt-2">
                                        <Bell className="w-3 h-3" />
                                        <span>Alert active</span>
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

            {contactEvents.length === 0 && (
              <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <CalendarIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm mb-3">No custom events added yet</p>
                <Button type="button" size="sm" variant="outline" onClick={() => setIsAddEventDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LinkedIn Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="linkedinProfile">LinkedIn Profile URL</Label>
              <Input
                id="linkedinProfile"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedinProfile}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedinProfile: e.target.value }))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the full LinkedIn profile URL
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="knownPreferences">Known Preferences</Label>
              <Textarea
                id="knownPreferences"
                value={formData.knownPreferences}
                onChange={(e) => setFormData(prev => ({ ...prev, knownPreferences: e.target.value }))}
                placeholder="Communication style, meeting preferences, interests, etc."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="entertainment">Allowed to Entertain</Label>
              <Select 
                value={formData.entertainment} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, entertainment: value === 'clear' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="Yes with Restrictions">Yes with Restrictions</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="decisionBiasProfile" className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Decision Bias Profile
              </Label>
              <Select 
                value={formData.decisionBiasProfile} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, decisionBiasProfile: value === 'clear' ? '' : value }))}
              >
                <SelectTrigger className="h-auto min-h-[60px] text-left items-start py-2">
                  {formData.decisionBiasProfile && DECISION_BIAS_OPTIONS[formData.decisionBiasProfile as keyof typeof DECISION_BIAS_OPTIONS] ? (
                    <div className="text-left w-full pr-4">
                      <div className="font-medium text-sm">{formData.decisionBiasProfile}</div>
                      <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {DECISION_BIAS_OPTIONS[formData.decisionBiasProfile as keyof typeof DECISION_BIAS_OPTIONS].description}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">Select decision bias profile...</span>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50 absolute right-3 top-1/2 -translate-y-1/2" />
                </SelectTrigger>
                <SelectContent className="max-w-md">
                  <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                  <SelectItem value="Data Centric">
                    <div className="py-1">
                      <div className="font-medium">Data Centric</div>
                      <div className="text-xs text-gray-600">Decides based on numbers, scorecards, consumer insights, and test results.</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Margin Maximizer">
                    <div className="py-1">
                      <div className="font-medium">Margin Maximizer</div>
                      <div className="text-xs text-gray-600">Focuses primarily on penny profit, margin mix, and trade terms.</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Consumer Trend Focused">
                    <div className="py-1">
                      <div className="font-medium">Consumer Trend Focused</div>
                      <div className="text-xs text-gray-600">Drawn to what is new, premium, multicultural, or fast growing.</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Operational Simplicity">
                    <div className="py-1">
                      <div className="font-medium">Operational Simplicity</div>
                      <div className="text-xs text-gray-600">Cares most about ease of execution, low complexity, and low disruption.</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Competitor Reactive">
                    <div className="py-1">
                      <div className="font-medium">Competitor Reactive</div>
                      <div className="text-xs text-gray-600">Reacts to what key competitors and local markets are doing.</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Price Leadership">
                    <div className="py-1">
                      <div className="font-medium">Price Leadership</div>
                      <div className="text-xs text-gray-600">Prioritizes competitive pricing and market share through aggressive price positioning.</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {formData.decisionBiasProfile && DECISION_BIAS_OPTIONS[formData.decisionBiasProfile as keyof typeof DECISION_BIAS_OPTIONS] && (
                <Alert className="mt-3 bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    <p className="text-blue-800">
                      <strong>Best to lead with:</strong> {DECISION_BIAS_OPTIONS[formData.decisionBiasProfile as keyof typeof DECISION_BIAS_OPTIONS].bestToLeadWith}
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div>
              <Label htmlFor="followThrough">Follow Through</Label>
              <Select 
                value={formData.followThrough} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, followThrough: value === 'clear' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">As it pertains to the business:</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="values">What do they value from a business perspective (ie Communication style, Data, Details, etc)</Label>
                  <Textarea
                    id="values"
                    value={formData.values}
                    onChange={(e) => setFormData(prev => ({ ...prev, values: e.target.value }))}
                    placeholder="Communication style, Data, Details, etc."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="painPoints">What are their pain points?</Label>
                  <Textarea
                    id="painPoints"
                    value={formData.painPoints}
                    onChange={(e) => setFormData(prev => ({ ...prev, painPoints: e.target.value }))}
                    placeholder="Enter pain points..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">General Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="General notes about this contact..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

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
                <Label htmlFor="ownerTitle">Primary Owner Title</Label>
                <Input
                  id="ownerTitle"
                  value={ownerTitle}
                  onChange={(e) => setOwnerTitle(e.target.value)}
                  placeholder="Enter owner title"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 bg-white border border-indigo-200 rounded-lg">
                <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Sales
                </h3>
                
                <div className="grid grid-cols-12 gap-2 items-center px-2 pb-2 border-b border-gray-200">
                  <div className="col-span-1"></div>
                  <div className="col-span-3"></div>
                  <div className="col-span-3">
                    <Label className="text-xs font-semibold text-gray-700">Cadence</Label>
                  </div>
                  <div className="col-span-5">
                    <Label className="text-xs font-semibold text-gray-700">Last Check In Date</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {SALES_ROLES.map((role) => (
                    <div key={role} className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-gray-50 rounded">
                      <div className="col-span-1">
                        <Checkbox
                          id={`sales-${role}`}
                          checked={role in salesRoles}
                          onCheckedChange={() => handleSalesRoleToggle(role)}
                        />
                      </div>
                      <Label 
                        htmlFor={`sales-${role}`} 
                        className="col-span-3 cursor-pointer text-sm"
                      >
                        {role}
                      </Label>
                      <div className="col-span-3">
                        <Select
                          value={salesRoles[role] || ''}
                          onValueChange={(value) => handleSalesCadenceChange(role, value)}
                          disabled={!(role in salesRoles)}
                        >
                          <SelectTrigger className={cn("h-9 text-xs", !(role in salesRoles) && "opacity-50")}>
                            <SelectValue placeholder="Cadence..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clear" className="text-gray-500 italic text-xs">Clear</SelectItem>
                            {CADENCE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} className="text-xs">
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-5">
                        <Input
                          type="date"
                          value={salesLastCheckIn[role] || ''}
                          onChange={(e) => handleSalesLastCheckInChange(role, e.target.value)}
                          disabled={!(role in salesRoles)}
                          className={cn(
                            "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            !(role in salesRoles) && "opacity-50"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 p-4 bg-white border border-indigo-200 rounded-lg">
                <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Support
                </h3>
                
                <div className="grid grid-cols-12 gap-2 items-center px-2 pb-2 border-b border-gray-200">
                  <div className="col-span-1"></div>
                  <div className="col-span-3"></div>
                  <div className="col-span-3">
                    <Label className="text-xs font-semibold text-gray-700">Cadence</Label>
                  </div>
                  <div className="col-span-5">
                    <Label className="text-xs font-semibold text-gray-700">Last Check In Date</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {SUPPORT_ROLES.map((role) => (
                    <div key={role} className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-gray-50 rounded">
                      <div className="col-span-1">
                        <Checkbox
                          id={`support-${role}`}
                          checked={role in supportRoles}
                          onCheckedChange={() => handleSupportRoleToggle(role)}
                        />
                      </div>
                      <Label 
                        htmlFor={`support-${role}`} 
                        className="col-span-3 cursor-pointer text-sm"
                      >
                        {role}
                      </Label>
                      <div className="col-span-3">
                        <Select
                          value={supportRoles[role] || ''}
                          onValueChange={(value) => handleSupportCadenceChange(role, value)}
                          disabled={!(role in supportRoles)}
                        >
                          <SelectTrigger className={cn("h-9 text-xs", !(role in supportRoles) && "opacity-50")}>
                            <SelectValue placeholder="Cadence..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clear" className="text-gray-500 italic text-xs">Clear</SelectItem>
                            {CADENCE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} className="text-xs">
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-5">
                        <Input
                          type="date"
                          value={supportLastCheckIn[role] || ''}
                          onChange={(e) => handleSupportLastCheckInChange(role, e.target.value)}
                          disabled={!(role in supportRoles)}
                          className={cn(
                            "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            !(role in supportRoles) && "opacity-50"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Notes & Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a timestamped note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={2}
              />
              <Button type="button" onClick={addUploadedNote} className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Add Note
              </Button>
            </div>
            <div className="space-y-2">
              {formData.uploadedNotes.map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUploadedNote(note.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              accept="*/*"
            />
            <div 
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              )}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Drag and drop files here or click to upload
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports documents, images, and other files
              </p>
            </div>
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

      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Important Date</DialogTitle>
            <DialogDescription>
              Add a new important date for this contact. You can optionally enable alerts to be notified before the event.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Event Title *</Label>
              <Input
                id="event-title"
                placeholder="e.g., Anniversary, Meeting, Milestone, etc."
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
                  <Label className="text-sm">
                    Alert me:
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-event-30-days"
                        checked={newEventAlertOptions.includes('30_days_before')}
                        onCheckedChange={() => handleToggleNewEventAlertOption('30_days_before')}
                      />
                      <Label htmlFor="new-event-30-days" className="text-sm font-normal cursor-pointer">
                        30 Days Before
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-event-7-days"
                        checked={newEventAlertOptions.includes('7_days_before')}
                        onCheckedChange={() => handleToggleNewEventAlertOption('7_days_before')}
                      />
                      <Label htmlFor="new-event-7-days" className="text-sm font-normal cursor-pointer">
                        7 Days Before
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-event-1-day"
                        checked={newEventAlertOptions.includes('1_day_before')}
                        onCheckedChange={() => handleToggleNewEventAlertOption('1_day_before')}
                      />
                      <Label htmlFor="new-event-1-day" className="text-sm font-normal cursor-pointer">
                        1 Day Before
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-event-custom"
                        checked={isNewEventCustomChecked}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            setNewEventCustomDays('');
                            const filteredOptions = newEventAlertOptions.filter(opt => !opt.startsWith('custom_'));
                            setNewEventAlertOptions(filteredOptions);
                          }
                        }}
                      />
                      <Label htmlFor="new-event-custom" className="text-sm font-normal cursor-pointer">
                        Custom:
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="days"
                        value={newEventCustomDays}
                        onChange={(e) => handleNewEventCustomDaysChange(e.target.value)}
                        className="w-20 h-7 text-xs"
                        disabled={!isNewEventCustomChecked}
                      />
                      <span className="text-sm text-gray-600">days before</span>
                    </div>
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
              setNewEventCustomDays('');
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