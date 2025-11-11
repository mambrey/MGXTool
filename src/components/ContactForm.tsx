import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Bell, Calendar, Upload, Info, Crown, User, Search, Check, Mail, MessageSquare, Users, Star, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Contact, Account, RelationshipOwner } from '@/types/crm';
import { loadFromStorage } from '@/lib/storage';

interface ContactFormProps {
  contact?: Contact | null;
  accounts: Account[];
  onSave: (contact: Contact) => void;
  onCancel: () => void;
}

export default function ContactForm({ contact, accounts, onSave, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    email: contact?.email || '',
    officePhone: contact?.officePhone || '',
    mobilePhone: contact?.mobilePhone || '',
    preferredContactMethod: contact?.preferredContactMethod || 'email',
    title: contact?.title || '',
    managerId: contact?.managerId || '',
    accountId: contact?.accountId || '',
    contactType: contact?.contactType || 'Secondary',
    influence: contact?.influence || 'User',
    isInfluencer: contact?.isInfluencer || false,
    influencerLevel: contact?.influencerLevel || undefined,
    birthday: contact?.birthday || '',
    birthdayAlert: contact?.birthdayAlert || false,
    relationshipStatus: contact?.relationshipStatus || '',
    nextContactDate: contact?.nextContactDate || '',
    nextContactAlert: contact?.nextContactAlert || false,
    lastContactDate: contact?.lastContactDate || '',
    socialHandles: contact?.socialHandles || [],
    knownPreferences: contact?.knownPreferences || '',
    notes: contact?.notes || '',
    relationshipOwner: contact?.relationshipOwner || { name: '', email: '', vicePresident: '' },
    notificationEmail: contact?.notificationEmail || '',
    teamsChannelId: contact?.teamsChannelId || '',
    uploadedNotes: contact?.uploadedNotes || []
  });

  const [newSocialHandle, setNewSocialHandle] = useState('');
  const [newNote, setNewNote] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [ownerAutoPopulated, setOwnerAutoPopulated] = useState(false);
  const [accountSearchOpen, setAccountSearchOpen] = useState(false);
  const [relationshipOwners, setRelationshipOwners] = useState<RelationshipOwner[]>([]);
  const [ownerSearchOpen, setOwnerSearchOpen] = useState(false);
  const [managerSearchOpen, setManagerSearchOpen] = useState(false);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);

  // New state for relationship owner hierarchy - Initialize from contact data
  const [director, setDirector] = useState(contact?.director || '');
  const [vicePresident, setVicePresident] = useState(contact?.vicePresident || '');
  const [seniorVicePresident, setSeniorVicePresident] = useState(contact?.seniorVicePresident || '');

  const seniorVPOptions = ['Justin Zylick', 'Matt Johnson', 'Alicia Shiel'];

  // Load relationship owners from directory
  useEffect(() => {
    const savedOwners = loadFromStorage<RelationshipOwner[]>('crm-relationship-owners', []);
    setRelationshipOwners(savedOwners);
  }, []);

  // Load all contacts for manager selection
  useEffect(() => {
    const savedContacts = loadFromStorage<Contact[]>('crm-contacts', []);
    setAllContacts(savedContacts);
  }, []);

  // Filter available managers (exclude current contact and only show contacts from same account)
  const availableManagers = allContacts.filter(c => 
    c.id !== contact?.id && 
    c.accountId === formData.accountId
  );

  // Get selected manager
  const selectedManager = allContacts.find(c => c.id === formData.managerId);

  // Effect to handle account selection and auto-populate owner information
  useEffect(() => {
    if (formData.accountId) {
      const account = accounts.find(acc => acc.id === formData.accountId);
      if (account) {
        setSelectedAccount(account);
        
        // Auto-populate relationship owner with account owner information for primary contacts
        // Only auto-populate if the relationship owner fields are empty or this is a new contact
        const shouldAutoPopulate = !contact || 
          (!formData.relationshipOwner.name && !formData.relationshipOwner.email);
        
        if (shouldAutoPopulate && account.accountOwner && formData.contactType === 'Primary') {
          // Try to find owner in directory first
          const ownerInDirectory = relationshipOwners.find(
            owner => owner.name.toLowerCase() === account.accountOwner.toLowerCase()
          );

          if (ownerInDirectory) {
            setFormData(prev => ({
              ...prev,
              relationshipOwner: {
                name: ownerInDirectory.name,
                email: ownerInDirectory.email,
                vicePresident: ownerInDirectory.vicePresident
              },
              notificationEmail: ownerInDirectory.email,
              teamsChannelId: ownerInDirectory.teamsChannelId || ownerInDirectory.teamsChatId || ''
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              relationshipOwner: {
                name: account.accountOwner,
                email: prev.relationshipOwner.email || `${account.accountOwner.toLowerCase().replace(/\s+/g, '.')}@company.com`,
                vicePresident: account.vp || prev.relationshipOwner.vicePresident || ''
              }
            }));
          }
          setOwnerAutoPopulated(true);
        }
      }
    } else {
      setSelectedAccount(null);
      setOwnerAutoPopulated(false);
    }
  }, [formData.accountId, formData.contactType, accounts, contact, relationshipOwners]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contactData: Contact = {
      id: contact?.id || Date.now().toString(),
      ...formData,
      director,
      vicePresident,
      seniorVicePresident,
      createdAt: contact?.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    onSave(contactData);
  };

  const handleAccountChange = (accountId: string) => {
    setFormData(prev => ({ ...prev, accountId, managerId: '' })); // Reset manager when account changes
    setAccountSearchOpen(false);
  };

  const handleManagerChange = (managerId: string) => {
    setFormData(prev => ({ ...prev, managerId: managerId === 'none' ? '' : managerId }));
    setManagerSearchOpen(false);
  };

  const handleOwnerSelect = (owner: RelationshipOwner) => {
    setFormData(prev => ({
      ...prev,
      relationshipOwner: {
        name: owner.name,
        email: owner.email,
        vicePresident: owner.vicePresident
      },
      notificationEmail: owner.email,
      teamsChannelId: owner.teamsChannelId || owner.teamsChatId || ''
    }));
    setOwnerSearchOpen(false);
  };

  const handleContactTypeChange = (contactType: string) => {
    setFormData(prev => ({ ...prev, contactType }));
    
    // If changing to Primary and we have an account selected, auto-populate owner info
    if (contactType === 'Primary' && selectedAccount?.accountOwner) {
      const ownerInDirectory = relationshipOwners.find(
        owner => owner.name.toLowerCase() === selectedAccount.accountOwner.toLowerCase()
      );

      if (ownerInDirectory) {
        setFormData(prev => ({
          ...prev,
          contactType,
          relationshipOwner: {
            name: ownerInDirectory.name,
            email: ownerInDirectory.email,
            vicePresident: ownerInDirectory.vicePresident
          },
          notificationEmail: ownerInDirectory.email,
          teamsChannelId: ownerInDirectory.teamsChannelId || ownerInDirectory.teamsChatId || ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          contactType,
          relationshipOwner: {
            name: selectedAccount.accountOwner,
            email: prev.relationshipOwner.email || `${selectedAccount.accountOwner.toLowerCase().replace(/\s+/g, '.')}@company.com`,
            vicePresident: selectedAccount.vp || prev.relationshipOwner.vicePresident || ''
          }
        }));
      }
      setOwnerAutoPopulated(true);
    } else if (contactType === 'Secondary') {
      setOwnerAutoPopulated(false);
    }
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

  // Helper function to get color coding for influencer level
  const getInfluencerLevelColor = (level: number) => {
    if (level <= 3) return 'bg-gray-100 text-gray-800';
    if (level <= 6) return 'bg-blue-100 text-blue-800';
    if (level <= 8) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getInfluencerLevelLabel = (level: number) => {
    if (level <= 3) return 'Low';
    if (level <= 6) return 'Medium';
    if (level <= 8) return 'High';
    return 'Very High';
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
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
            
            {/* Account Selection */}
            <div>
              <Label htmlFor="accountId">Account *</Label>
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
                      : "Select an account..."}
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

            {/* Manager Selection */}
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
                    disabled={!formData.accountId}
                  >
                    {formData.managerId && selectedManager
                      ? `${selectedManager.firstName} ${selectedManager.lastName}`
                      : formData.accountId 
                        ? "Select a manager..."
                        : "Select an account first..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command shouldFilter={true}>
                    <CommandInput 
                      placeholder="Search contacts by name or title..." 
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
                          const searchableText = `${manager.firstName} ${manager.lastName} ${manager.title || ''}`;
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
                                {manager.title && (
                                  <span className="text-xs text-gray-500">{manager.title}</span>
                                )}
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
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.accountId 
                  ? "Select who this contact reports to in the organizational hierarchy"
                  : "Please select an account first to choose a manager"}
              </p>
            </div>

            <div>
              <Label htmlFor="contactType">Contact Type *</Label>
              <Select value={formData.contactType} onValueChange={handleContactTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      <span>Primary Contact</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Secondary">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span>Secondary Contact</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2 text-sm text-gray-600">
                {formData.contactType === 'Primary' ? (
                  <div className="flex items-center gap-1 text-yellow-700">
                    <Crown className="w-3 h-3" />
                    <span>Primary contacts are automatically linked to the account owner for relationship management.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-600">
                    <User className="w-3 h-3" />
                    <span>Secondary contacts can have different relationship owners as needed.</span>
                  </div>
                )}
              </div>
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="mobile phone">Mobile Phone</SelectItem>
                  <SelectItem value="office phone">Office Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Relationship Information */}
        <Card>
          <CardHeader>
            <CardTitle>Relationship Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="influence">Influence Level</Label>
              <Select value={formData.influence} onValueChange={(value) => setFormData(prev => ({ ...prev, influence: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Decision Maker">Decision Maker</SelectItem>
                  <SelectItem value="Influencer">Influencer</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Gatekeeper">Gatekeeper</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                General influence category in the organization
              </p>
            </div>
            
            {/* NEW: Influencer Rating Slider (1-10) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="influencerLevel" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Influencer Rating (1-10)
                </Label>
                {formData.influencerLevel && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, influencerLevel: undefined }))}
                    className="text-gray-500 hover:text-red-500 h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {formData.influencerLevel !== undefined ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Slider
                      id="influencerLevel"
                      min={1}
                      max={10}
                      step={1}
                      value={[formData.influencerLevel]}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, influencerLevel: value[0] }))}
                      className="flex-1"
                    />
                    <Badge className={cn("min-w-[120px] justify-center", getInfluencerLevelColor(formData.influencerLevel))}>
                      Rating: {formData.influencerLevel}/10
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center">
                    <Badge className={cn("text-sm", getInfluencerLevelColor(formData.influencerLevel))}>
                      {getInfluencerLevelLabel(formData.influencerLevel)} Influence
                    </Badge>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData(prev => ({ ...prev, influencerLevel: 5 }))}
                  className="w-full"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Set Influencer Rating
                </Button>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Rate the contact's influence on a scale of 1 (low) to 10 (high). Drag the slider to adjust.
              </p>
            </div>
            
            {/* Influencer Toggle */}
            <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <Checkbox
                id="isInfluencer"
                checked={formData.isInfluencer}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isInfluencer: checked as boolean }))}
              />
              <div className="flex-1">
                <Label 
                  htmlFor="isInfluencer" 
                  className="flex items-center gap-2 font-semibold text-amber-900 cursor-pointer"
                >
                  <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                  Mark as Key Influencer
                </Label>
                <p className="text-xs text-amber-700 mt-1">
                  Key influencers are individuals who have significant impact on decisions and organizational direction, regardless of their formal position in the reporting hierarchy. They will be highlighted in the contact hierarchy view.
                </p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="relationshipStatus">Relationship Status</Label>
              <Input
                id="relationshipStatus"
                value={formData.relationshipStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, relationshipStatus: e.target.value }))}
                placeholder="e.g., Alumni, Former Colleague, Industry Contact"
              />
            </div>
          </CardContent>
        </Card>

        {/* Important Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Important Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Social Handles */}
        <Card>
          <CardHeader>
            <CardTitle>Social Handles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add social media handle (e.g., @username)"
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

        {/* Preferences & Notes */}
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

        {/* Relationship Owner - UPDATED STRUCTURE */}
        <Card className={`${formData.contactType === 'Primary' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
          <CardHeader>
            <CardTitle className={`${formData.contactType === 'Primary' ? 'text-yellow-900' : 'text-blue-900'} flex items-center gap-2`}>
              {formData.contactType === 'Primary' ? (
                <>
                  <Crown className="w-5 h-5" />
                  Primary Contact - Relationship Owner
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  Relationship Owner
                </>
              )}
            </CardTitle>
            {ownerAutoPopulated && formData.contactType === 'Primary' && (
              <Alert className="bg-green-50 border-green-200">
                <Info className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  As a primary contact, owner information has been automatically linked to the account owner: <strong>{selectedAccount?.accountOwner}</strong>
                </AlertDescription>
              </Alert>
            )}
            {formData.contactType === 'Primary' && !ownerAutoPopulated && selectedAccount && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <Crown className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  This is a primary contact for <strong>{selectedAccount.accountName}</strong>. The relationship owner should typically be the account owner: <strong>{selectedAccount.accountOwner || 'Not assigned'}</strong>
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {relationshipOwners.length > 0 && (
              <div>
                <Label>Select from Directory</Label>
                <Popover open={ownerSearchOpen} onOpenChange={setOwnerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={ownerSearchOpen}
                      className="w-full justify-between"
                    >
                      {formData.relationshipOwner.name || "Select owner from directory..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command shouldFilter={true}>
                      <CommandInput placeholder="Search owners..." />
                      <CommandList>
                        <CommandEmpty>No owner found.</CommandEmpty>
                        <CommandGroup>
                          {relationshipOwners.map((owner) => (
                            <CommandItem
                              key={owner.id}
                              value={`${owner.name} ${owner.email} ${owner.vicePresident}`}
                              onSelect={() => handleOwnerSelect(owner)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.relationshipOwner.name === owner.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{owner.name}</span>
                                <span className="text-xs text-gray-500">
                                  {owner.email} • VP: {owner.vicePresident}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500 mt-1">
                  Or enter manually below
                </p>
              </div>
            )}
            
            {/* NEW: Relationship Owner Hierarchy */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label htmlFor="director">Director</Label>
                <Input
                  id="director"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  placeholder="Enter Director name"
                />
              </div>
              
              <div>
                <Label htmlFor="vicePresident">Vice President</Label>
                <Input
                  id="vicePresident"
                  value={vicePresident}
                  onChange={(e) => {
                    setVicePresident(e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      relationshipOwner: { ...prev.relationshipOwner, vicePresident: e.target.value }
                    }));
                  }}
                  placeholder="Enter Vice President name"
                />
              </div>
              
              <div>
                <Label htmlFor="seniorVicePresident">Senior Vice President</Label>
                <Select value={seniorVicePresident} onValueChange={setSeniorVicePresident}>
                  <SelectTrigger id="seniorVicePresident">
                    <SelectValue placeholder="Select Senior Vice President" />
                  </SelectTrigger>
                  <SelectContent>
                    {seniorVPOptions.map((svp) => (
                      <SelectItem key={svp} value={svp}>
                        {svp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Original Owner Fields (kept for backward compatibility) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="ownerName">Owner Name (Legacy)</Label>
                <Input
                  id="ownerName"
                  value={formData.relationshipOwner.name}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    relationshipOwner: { ...prev.relationshipOwner, name: e.target.value }
                  }))}
                  placeholder="Contact owner name"
                />
              </div>
              <div>
                <Label htmlFor="ownerEmail">Owner Email</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={formData.relationshipOwner.email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    relationshipOwner: { ...prev.relationshipOwner, email: e.target.value }
                  }))}
                  placeholder="owner@company.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Overrides */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alert Notification Settings (Optional Overrides)
            </CardTitle>
            <Alert className="bg-purple-100 border-purple-300">
              <Info className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-900">
                <strong>Optional:</strong> Override default notification settings for this contact's alerts. If left empty, the system will use the relationship owner's default settings from the directory.
              </AlertDescription>
            </Alert>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notificationEmail" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Notification Email Override
              </Label>
              <Input
                id="notificationEmail"
                type="email"
                value={formData.notificationEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, notificationEmail: e.target.value }))}
                placeholder="Leave empty to use owner's default email"
              />
              <p className="text-xs text-gray-600 mt-1">
                Power Automate will send alerts to this email instead of the owner's default
              </p>
            </div>
            <div>
              <Label htmlFor="teamsChannelId" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Teams Channel/Chat ID Override
              </Label>
              <Input
                id="teamsChannelId"
                value={formData.teamsChannelId}
                onChange={(e) => setFormData(prev => ({ ...prev, teamsChannelId: e.target.value }))}
                placeholder="Leave empty to use owner's default Teams settings"
              />
              <p className="text-xs text-gray-600 mt-1">
                Teams channel or chat ID for sending alerts (e.g., 19:abc123...)
              </p>
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
    </div>
  );
}