import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Bell, BellOff, Calendar as CalendarIcon, Upload, Info, Crown, Search, Check, Users, Package, Trash2, ClipboardList, Image, Briefcase, ChevronDown, FileText } from 'lucide-react';
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
import type { Contact, Account, CustomerEvent } from '@/types/crm';
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
  alertDays?: number;
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
    isPrimaryContact: contact?.isPrimaryContact || false,
    contactActiveStatus: contact?.contactActiveStatus || 'Active',
    relationshipStatus: contact?.relationshipStatus || '',
    categorySegmentOwnership: contact?.categorySegmentOwnership || [],
    responsibilityLevels: contact?.responsibilityLevels || {},
    birthday: contact?.birthday || '',
    birthdayAlert: contact?.birthdayAlert || false,
    birthdayAlertDays: contact?.birthdayAlertDays || 7,
    nextContactDate: contact?.nextContactDate || '',
    nextContactAlert: contact?.nextContactAlert || false,
    nextContactAlertDays: contact?.nextContactAlertDays || 7,
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
      alertEnabled: false,
      alertDays: 7
    }))
  );
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventAlertEnabled, setNewEventAlertEnabled] = useState(false);
  const [newEventAlertDays, setNewEventAlertDays] = useState(7);

  const [newNote, setNewNote] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountSearchOpen, setAccountSearchOpen] = useState(false);
  const [managerSearchOpen, setManagerSearchOpen] = useState(false);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [headshotFileName, setHeadshotFileName] = useState('');
  const [headshotError, setHeadshotError] = useState('');

  // Primary Diageo Relationship Owner(s) state
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

  // Popover states for calendar date pickers
  const [salesCalendarOpen, setSalesCalendarOpen] = useState<{[role: string]: boolean}>({});
  const [supportCalendarOpen, setSupportCalendarOpen] = useState<{[role: string]: boolean}>({});

  // Google Places PlaceAutocompleteElement
  const shippingAddressRef = useRef<HTMLDivElement | null>(null);
  const placeAutocompleteRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  // Initialize Google Places PlaceAutocompleteElement
  useEffect(() => {
    if (isLoaded && shippingAddressRef.current && GOOGLE_MAPS_API_KEY && window.google?.maps?.places?.PlaceAutocompleteElement) {
      try {
        // Create the PlaceAutocompleteElement
        const placeAutocomplete = new window.google.maps.places.PlaceAutocompleteElement({
          componentRestrictions: { country: ['us'] },
        });
        
        placeAutocompleteRef.current = placeAutocomplete;
        
        // Clear the container and append the element
        shippingAddressRef.current.innerHTML = '';
        shippingAddressRef.current.appendChild(placeAutocomplete);
        
        // Set initial value if exists
        if (formData.preferredShippingAddress) {
          const input = placeAutocomplete.querySelector('input');
          if (input) {
            input.value = formData.preferredShippingAddress;
          }
        }
        
        // Listen for place selection
        placeAutocomplete.addEventListener('gmp-placeselect', async (event: Event) => {
          const customEvent = event as CustomEvent;
          const place = customEvent.detail?.place;
          if (place) {
            await place.fetchFields({
              fields: ['formattedAddress', 'addressComponents']
            });
            
            if (place.formattedAddress) {
              setFormData(prev => ({ ...prev, preferredShippingAddress: place.formattedAddress || '' }));
            }
          }
        });
      } catch (error) {
        console.error('Error initializing Google Places PlaceAutocompleteElement:', error);
      }
    }

    return () => {
      if (placeAutocompleteRef.current && shippingAddressRef.current) {
        shippingAddressRef.current.innerHTML = '';
      }
    };
  }, [isLoaded]);

  // Update PlaceAutocompleteElement input when formData.preferredShippingAddress changes externally
  useEffect(() => {
    if (placeAutocompleteRef.current && formData.preferredShippingAddress) {
      const input = placeAutocompleteRef.current.querySelector('input');
      if (input && input.value !== formData.preferredShippingAddress) {
        input.value = formData.preferredShippingAddress;
      }
    }
  }, [formData.preferredShippingAddress]);

  const handleHeadshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeadshotError('');

    if (!file.type.match(/image\/(jpeg|jpg)/)) {
      setHeadshotError('Please upload a JPG or JPEG image file');
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
      alertDays: newEventAlertDays
    };

    setContactEvents([...contactEvents, newEvent]);

    setNewEventTitle('');
    setNewEventDate('');
    setNewEventAlertEnabled(false);
    setNewEventAlertDays(7);
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

  const handleUpdateEventAlertDays = (eventId: string, days: number) => {
    setContactEvents(contactEvents.map(event => 
      event.id === eventId 
        ? { ...event, alertDays: days }
        : event
    ));
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
      contactEvents: contactEvents.map(({ alertEnabled, alertDays, ...event }) => event),
      createdAt: contact?.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    onSave(contactData);
  };

  const handleAccountChange = (accountId: string) => {
    setFormData(prev => ({ ...prev, accountId }));
    setAccountSearchOpen(false);
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
        {/* Rest of the form remains unchanged - keeping all existing JSX */}
        {/* Basic Information, Contact Information, Ways of Working, Important Dates, LinkedIn Profile, Preferences & Notes, Diageo Relationship Owner(s), Additional Notes & Files sections */}
        
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ... other fields ... */}
            <div>
              <Label htmlFor="preferredShippingAddress">
                Preferred Shipping Address
                {isLoaded && GOOGLE_MAPS_API_KEY && (
                  <span className="ml-2 text-xs text-green-600">(Google Autocomplete enabled)</span>
                )}
              </Label>
              <div ref={shippingAddressRef} className="mt-1" />
              {loadError && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Error loading Google Maps. Address can still be entered manually.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ... rest of the form sections remain unchanged ... */}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {contact ? 'Update Contact' : 'Create Contact'}
          </Button>
        </div>
      </form>

      {/* Dialog for adding events remains unchanged */}
    </div>
  );
}