import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Bell, BellOff, Calendar, Upload, Info, Crown, Search, Check, Users, Package, Trash2, ClipboardList, Image, Briefcase } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
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

// Primary Diageo Relationship Owner options
const SALES_ROLES = ['CEO', 'President', 'SVP', 'VP Sales', 'Director Sales', 'NAM'];
const SUPPORT_ROLES = [
  'VP Customer Development',
  'Director Category Development',
  'Senior Manager Category',
  'Manager Category',
  'Director OCM',
  'Senior Manager E-Com',
  'Manager eComm',
  'Senior Manager Shopper',
  'Manager Shopper'
];
const CADENCE_OPTIONS = ['Annual', 'Semi Annual', 'Quarterly', 'Monthly', 'Ongoing'];

// SVP dropdown options
const SVP_OPTIONS = ['Justin Zylick', 'Matt Johnson', 'Alicia Shiel'];

// Google Maps configuration
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const libraries: ("places")[] = ["places"];

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
    nextContactDate: contact?.nextContactDate || '',
    nextContactAlert: contact?.nextContactAlert || false,
    lastContactDate: contact?.lastContactDate || '',
    socialHandles: contact?.socialHandles || [],
    knownPreferences: contact?.knownPreferences || '',
    entertainment: contact?.entertainment || '',
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

  const [newSocialHandle, setNewSocialHandle] = useState('');
  const [newNote, setNewNote] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountSearchOpen, setAccountSearchOpen] = useState(false);
  const [managerSearchOpen, setManagerSearchOpen] = useState(false);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [headshotFileName, setHeadshotFileName] = useState('');
  const [headshotError, setHeadshotError] = useState('');

  // Primary Diageo Relationship Owner(s) state - UPDATED to store role->cadence mapping
  const [ownerName, setOwnerName] = useState(contact?.primaryDiageoRelationshipOwners?.ownerName || '');
  const [ownerEmail, setOwnerEmail] = useState(contact?.primaryDiageoRelationshipOwners?.ownerEmail || '');
  const [svp, setSvp] = useState(contact?.primaryDiageoRelationshipOwners?.svp || '');
  const [salesRoles, setSalesRoles] = useState<{[role: string]: string}>(
    contact?.primaryDiageoRelationshipOwners?.sales || {}
  );
  const [supportRoles, setSupportRoles] = useState<{[role: string]: string}>(
    contact?.primaryDiageoRelationshipOwners?.support || {}
  );

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
  useEffect(() => {
    if (isLoaded && inputRef.current && window.google) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['formatted_address', 'address_components']
      });
      
      autocompleteRef.current.addListener('place_changed', onPlaceChanged);
    }

    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded]);

  // Handle headshot file upload
  const handleHeadshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setHeadshotError('');

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg)/)) {
      setHeadshotError('Please upload a JPG or JPEG image file');
      e.target.value = '';
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setHeadshotError('File size must be less than 5MB');
      e.target.value = '';
      return;
    }

    // Read file and convert to base64
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

  // Remove headshot
  const removeHeadshot = () => {
    setFormData(prev => ({ ...prev, headshot: '' }));
    setHeadshotFileName('');
    setHeadshotError('');
    // Reset file input
    const fileInput = document.getElementById('headshot') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Category/Segment Ownership handlers
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

  // Responsibility Level handlers - UPDATED to default to None
  const handleResponsibilityLevelChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      responsibilityLevels: {
        ...prev.responsibilityLevels,
        [key]: value
      }
    }));
  };

  // Initialize responsibility levels with 'None' if not set
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

  // Primary Diageo Relationship Owner handlers - UPDATED
  const handleSalesRoleToggle = (role: string) => {
    setSalesRoles(prev => {
      const newRoles = { ...prev };
      if (role in newRoles) {
        // Remove the role
        delete newRoles[role];
      } else {
        // Add the role with empty cadence
        newRoles[role] = '';
      }
      return newRoles;
    });
  };

  const handleSalesCadenceChange = (role: string, cadence: string) => {
    setSalesRoles(prev => ({
      ...prev,
      [role]: cadence
    }));
  };

  const handleSupportRoleToggle = (role: string) => {
    setSupportRoles(prev => {
      const newRoles = { ...prev };
      if (role in newRoles) {
        // Remove the role
        delete newRoles[role];
      } else {
        // Add the role with empty cadence
        newRoles[role] = '';
      }
      return newRoles;
    });
  };

  const handleSupportCadenceChange = (role: string, cadence: string) => {
    setSupportRoles(prev => ({
      ...prev,
      [role]: cadence
    }));
  };

  // Event management functions
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

    // Reset form and close dialog
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

  // Load all contacts for manager selection
  useEffect(() => {
    const savedContacts = loadFromStorage<Contact[]>('crm-contacts', []);
    setAllContacts(savedContacts);
  }, []);

  // Filter available managers - NOW SHOWS ALL CONTACTS (excluding current contact only)
  const availableManagers = allContacts.filter(c => c.id !== contact?.id);

  // Get selected manager
  const selectedManager = allContacts.find(c => c.id === formData.managerId);

  // Get account name for selected manager
  const getManagerAccountName = (managerId: string) => {
    const manager = allContacts.find(c => c.id === managerId);
    if (!manager?.accountId) return '';
    const account = accounts.find(a => a.id === manager.accountId);
    return account?.accountName || '';
  };

  // Effect to handle account selection
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
        support: supportRoles
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

  const addSocialHandle = () => {
    if (newSocialHandle.trim()) {
      setFormData(prev => ({
        ...prev,
        socialHandles: [...prev.socialHandles, newSocialHandle.trim()]
      }));
      setNewSocialHandle('');
    }
  };

  const removeSocialHandle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialHandles: prev.socialHandles.filter((_, i) => i !== index)
    }));
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {contact ? 'Edit Contact' : 'Add New Contact'}
        </h2>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
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
            
            {/* Primary Contact Checkbox */}
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
            {/* Headshot File Upload */}
            <div>
              <Label htmlFor="headshot" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Headshot
              </Label>
              <div className="space-y-2">
                <Input
                  id="headshot"
                  type="file"
                  accept=".jpg,.jpeg"
                  onChange={handleHeadshotUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500">
                  Upload a JPG or JPEG image (max 5MB)
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
                onValueChange={(value) => setFormData(prev => ({ ...prev, currentRoleTenure: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tenure..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1 Years">0-1 Years</SelectItem>
                  <SelectItem value="1-3 Years">1-3 Years</SelectItem>
                  <SelectItem value="3-5 Years">3-5 Years</SelectItem>
                  <SelectItem value="5-10 Years">5-10 Years</SelectItem>
                  <SelectItem value="10+ Years">10+ Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Account Selection - FIXED LABEL */}
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
                    {formData.accountId
                      ? accounts.find(account => account.id === formData.accountId)?.accountName
                      : "Select"}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command shouldFilter={true}>
                    <CommandInput 
                      placeholder="Search accounts by name, industry, or owner..." 
                    />
                    <CommandList>
                      <CommandEmpty>No account found.</CommandEmpty>
                      <CommandGroup>
                        {accounts.map((account) => {
                          const searchableText = `${account.accountName} ${account.industry || ''} ${account.accountOwner || ''}`;
                          return (
                            <CommandItem
                              key={account.id}
                              value={searchableText}
                              onSelect={() => handleAccountChange(account.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.accountId === account.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{account.accountName}</span>
                                <span className="text-xs text-gray-500">
                                  {account.industry && `${account.industry} • `}
                                  {account.accountOwner && `Owner: ${account.accountOwner}`}
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
            </div>

            {/* Manager Selection - UPDATED TO SHOW ALL CONTACTS */}
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
                Select who this contact reports to in the organizational hierarchy (from any company in your contact list)
              </p>
            </div>


            {/* Contact Active Status */}
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

        {/* Contact Information */}
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
                  value={formData.officePhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, officePhone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="mobilePhone">Mobile Phone</Label>
                <Input
                  id="mobilePhone"
                  value={formData.mobilePhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobilePhone: e.target.value }))}
                  placeholder="(555) 987-6543"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
              <Select value={formData.preferredContactMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredContactMethod: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact method..." />
                </SelectTrigger>
                <SelectContent>
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
                  value={formData.preferredShippingAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredShippingAddress: e.target.value }))}
                  placeholder="Start typing address..."
                  className="w-full"
                />
              ) : (
                <Input
                  id="preferredShippingAddress"
                  value={formData.preferredShippingAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredShippingAddress: e.target.value }))}
                  placeholder="Street address, City, State, ZIP"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                {isLoaded ? 'Start typing to see address suggestions' : 'Enter shipping address'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ways of Working */}
        <Card>
          <CardHeader>
            <CardTitle>Ways of Working</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Support Style - UPDATED WITH DARKER COLORS */}
            <div>
              <Label htmlFor="relationshipStatus">Support Style</Label>
              <Select 
                value={formData.relationshipStatus} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, relationshipStatus: value }))}
              >
                <SelectTrigger className="bg-gradient-to-r from-green-50 to-blue-50 border-2">
                  <SelectValue placeholder="Select support style..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Promoter — Champions our partnership" style={{backgroundColor: '#166534', color: 'white'}}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                      <div className="flex flex-col">
                        <span className="font-medium">Promoter</span>
                        <span className="text-xs text-gray-200">Champions our partnership</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Supporter — Leans in consistently" style={{backgroundColor: '#16a34a', color: 'white'}}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                      <div className="flex flex-col">
                        <span className="font-medium">Supporter</span>
                        <span className="text-xs text-gray-200">Leans in consistently</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Neutral — Transactional, low engagement" style={{backgroundColor: '#eab308', color: '#1f2937'}}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                      <div className="flex flex-col">
                        <span className="font-medium">Neutral</span>
                        <span className="text-xs text-gray-700">Transactional, low engagement</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Detractor — Resists our efforts" style={{backgroundColor: '#ea580c', color: 'white'}}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                      <div className="flex flex-col">
                        <span className="font-medium">Detractor</span>
                        <span className="text-xs text-gray-200">Resists our efforts</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Adversarial — Actively working against" style={{backgroundColor: '#991b1b', color: 'white'}}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                      <div className="flex flex-col">
                        <span className="font-medium">Adversarial</span>
                        <span className="text-xs text-gray-200">Actively working against</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category/Segment Ownership - MULTI-SELECT */}
            <div>
              <Label htmlFor="categorySegmentOwnership" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Category/Segment Ownership
              </Label>
              <div className="mt-2 p-4 border border-gray-200 rounded-lg space-y-3">
                {/* Select All Option */}
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

                {/* Individual Category Options */}
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

            {/* Responsibility Level - REMOVED CHECKBOXES */}
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

        {/* Important Dates with Event Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Important Dates
              </CardTitle>
              <Button type="button" size="sm" onClick={() => setIsAddEventDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* System Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={formData.birthdayAlert ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, birthdayAlert: !prev.birthdayAlert }))}
                    className="flex items-center gap-1"
                  >
                    <Bell className="w-3 h-3" />
                    {formData.birthdayAlert ? 'Alert On' : 'Alert Off'}
                  </Button>
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
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={formData.nextContactAlert ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, nextContactAlert: !prev.nextContactAlert }))}
                    className="flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3" />
                    {formData.nextContactAlert ? 'Alert On' : 'Alert Off'}
                  </Button>
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

            {/* Custom Events */}
            {contactEvents.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Custom Events ({contactEvents.length})</h4>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                      {contactEvents.map((event) => {
                        const daysUntil = getDaysUntilEvent(event.date);
                        const isUpcoming = daysUntil >= 0 && daysUntil <= (event.alertDays || 7);
                        
                        return (
                          <Card key={event.id} className={`p-3 ${isUpcoming && event.alertEnabled ? 'border-orange-300 bg-orange-50' : ''}`}>
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
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
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>

                              {/* Alert Settings */}
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
                                  <div className="space-y-1 pl-5">
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
                                        className="w-16 h-7 text-xs"
                                      />
                                      <span className="text-xs text-gray-500">days</span>
                                    </div>
                                    {isUpcoming && (
                                      <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
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

            {/* Empty State */}
            {contactEvents.length === 0 && (
              <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm mb-3">No custom events added yet</p>
                <Button type="button" size="sm" variant="outline" onClick={() => setIsAddEventDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* LinkedIn Profile */}
        <Card>
          <CardHeader>
            <CardTitle>LinkedIn Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add LinkedIn profile URL (e.g., https://linkedin.com/in/username)"
                value={newSocialHandle}
                onChange={(e) => setNewSocialHandle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSocialHandle())}
              />
              <Button type="button" onClick={addSocialHandle}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.socialHandles.map((handle, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {handle}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeSocialHandle(index)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preferences & Notes - REORDERED */}
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
                onValueChange={(value) => setFormData(prev => ({ ...prev, entertainment: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="followThrough">Follow Through</Label>
              <Select 
                value={formData.followThrough} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, followThrough: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <Label htmlFor="painPoints">Pain Points</Label>
              <Textarea
                id="painPoints"
                value={formData.painPoints}
                onChange={(e) => setFormData(prev => ({ ...prev, painPoints: e.target.value }))}
                placeholder="Enter pain points..."
                rows={3}
              />
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

        {/* Primary Diageo Relationship Owner(s) - REMOVED DIRECTOR/VP/SVP HIERARCHY */}
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Diageo Relationship Owner(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Owner Name, Owner Email, and SVP fields */}
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
                <Label htmlFor="ownerEmail">Primary Owner Email</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="owner@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sales Section */}
              <div className="space-y-4 p-4 bg-white border border-indigo-200 rounded-lg">
                <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Sales
                </h3>
                
                {/* Sales Roles with Individual Cadence */}
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
                        className="col-span-5 cursor-pointer text-sm"
                      >
                        {role}
                      </Label>
                      <div className="col-span-6">
                        <Select
                          value={salesRoles[role] || ''}
                          onValueChange={(value) => handleSalesCadenceChange(role, value)}
                          disabled={!(role in salesRoles)}
                        >
                          <SelectTrigger className={cn("h-9 text-xs", !(role in salesRoles) && "opacity-50")}>
                            <SelectValue placeholder="Cadence..." />
                          </SelectTrigger>
                          <SelectContent>
                            {CADENCE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} className="text-xs">
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Section */}
              <div className="space-y-4 p-4 bg-white border border-indigo-200 rounded-lg">
                <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Support
                </h3>
                
                {/* Support Roles with Individual Cadence */}
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
                        className="col-span-5 cursor-pointer text-sm"
                      >
                        {role}
                      </Label>
                      <div className="col-span-6">
                        <Select
                          value={supportRoles[role] || ''}
                          onValueChange={(value) => handleSupportCadenceChange(role, value)}
                          disabled={!(role in supportRoles)}
                        >
                          <SelectTrigger className={cn("h-9 text-xs", !(role in supportRoles) && "opacity-50")}>
                            <SelectValue placeholder="Cadence..." />
                          </SelectTrigger>
                          <SelectContent>
                            {CADENCE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} className="text-xs">
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes & Files */}
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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {contact ? 'Update Contact' : 'Create Contact'}
          </Button>
        </div>
      </form>

      {/* Add Event Dialog */}
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