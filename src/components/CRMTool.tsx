import React, { useState, useEffect } from 'react';
import { Home, Building2, Users, BarChart3, FolderOpen, Network, CheckSquare, Bell, Menu, X, Search, Plus, Calendar, AlertTriangle, User, Phone, Mail, MessageCircle, UserCog, TrendingUp, HelpCircle, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import WelcomeScreen from './WelcomeScreen';
import AccountForm from './AccountForm';
import ContactForm from './ContactForm';
import AccountDetails from './AccountDetails';
import ContactDetails from './ContactDetails';
import DataView from './DataView';
import DocumentStorage from './DocumentStorage';
import ContactHierarchy from './ContactHierarchy';
import TaskManagement from './TaskManagement';
import AlertSystem from './AlertSystem';
import SharePointSync from './SharePointSync';
import SharePointImport from './SharePointImport';
import ContactImport from './ContactImport';
import MarketSnapshotUpload from './MarketSnapshotUpload';
import RelationshipOwnerDirectory from './RelationshipOwnerDirectory';
import FAQPage from '../pages/FAQPage';
import type { Account, Contact, RelationshipOwner } from '@/types/crm';
import { saveToStorage, loadFromStorage } from '@/lib/storage';

type View = 'welcome' | 'accounts' | 'contacts' | 'data-view' | 'document-storage' | 'contact-hierarchy' | 'task-management' | 'alert-system' | 'sharepoint-sync' | 'relationship-owners' | 'faq';

interface CRMToolProps {
  userName: string;
}

export default function CRMTool({ userName }: CRMToolProps) {
  const [currentView, setCurrentView] = useState<View>('welcome');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  // Track if we're viewing a contact from an account page
  const [viewingContactFromAccount, setViewingContactFromAccount] = useState<string | null>(null);

  // One-time data cleaning on component mount
  useEffect(() => {
    console.log('=== CRM TOOL: CLEANING EMAIL DATA ===');
    
    // Clean relationship owners
    const relationshipOwners = loadFromStorage<RelationshipOwner[]>('crm-relationship-owners', []);
    if (relationshipOwners && relationshipOwners.length > 0) {
      const cleanedOwners = relationshipOwners.map(owner => ({
        ...owner,
        email: owner.email?.trim().replace(/[\r\n\t]/g, '') || '',
        teamsChannelId: owner.teamsChannelId?.trim() || undefined,
        teamsChatId: owner.teamsChatId?.trim() || undefined
      }));
      
      // Check if any cleaning was needed
      const needsCleaning = relationshipOwners.some((owner, index) => 
        owner.email !== cleanedOwners[index].email
      );
      
      if (needsCleaning) {
        console.log('Cleaning relationship owner emails...');
        saveToStorage('crm-relationship-owners', cleanedOwners);
        console.log('✅ Relationship owner emails cleaned');
      } else {
        console.log('✅ Relationship owner emails already clean');
      }
    }
    
    // Clean contacts
    const savedContacts = loadFromStorage<Contact[]>('crm-contacts', []);
    if (savedContacts && savedContacts.length > 0) {
      const cleanedContacts = savedContacts.map(contact => ({
        ...contact,
        email: contact.email?.trim().replace(/[\r\n\t]/g, '') || '',
        notificationEmail: contact.notificationEmail?.trim().replace(/[\r\n\t]/g, '') || undefined,
        relationshipOwner: contact.relationshipOwner ? {
          ...contact.relationshipOwner,
          email: contact.relationshipOwner.email?.trim().replace(/[\r\n\t]/g, '') || undefined
        } : undefined
      }));
      
      const needsCleaning = savedContacts.some((contact, index) => 
        contact.email !== cleanedContacts[index].email ||
        contact.notificationEmail !== cleanedContacts[index].notificationEmail
      );
      
      if (needsCleaning) {
        console.log('Cleaning contact emails...');
        saveToStorage('crm-contacts', cleanedContacts);
        console.log('✅ Contact emails cleaned');
      } else {
        console.log('✅ Contact emails already clean');
      }
    }
    
    console.log('=== EMAIL CLEANING COMPLETE ===');
  }, []);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedAccounts = loadFromStorage<Account[]>('crm-accounts', []);
    const savedContacts = loadFromStorage<Contact[]>('crm-contacts', []);
    setAccounts(savedAccounts || []);
    setContacts(savedContacts || []);
  }, []);

  // Save data to localStorage whenever accounts or contacts change
  useEffect(() => {
    if (accounts) {
      saveToStorage('crm-accounts', accounts);
    }
  }, [accounts]);

  useEffect(() => {
    if (contacts) {
      saveToStorage('crm-contacts', contacts);
    }
  }, [contacts]);

  const handleAccountSave = (account: Account) => {
    if (editingAccount) {
      setAccounts(prev => (prev || []).map(a => a.id === account.id ? account : a));
    } else {
      setAccounts(prev => [...(prev || []), account]);
    }
    setEditingAccount(null);
    setShowAccountForm(false);
    setCurrentView('accounts');
  };

  const handleAccountUpdate = (account: Account) => {
    setAccounts(prev => (prev || []).map(a => a.id === account.id ? account : a));
    setSelectedAccount(account); // Update the selected account to reflect changes
  };

  const handleContactSave = (contact: Contact) => {
    if (editingContact) {
      setContacts(prev => (prev || []).map(c => c.id === contact.id ? contact : c));
    } else {
      setContacts(prev => [...(prev || []), contact]);
    }
    setEditingContact(null);
    setShowContactForm(false);
    setCurrentView('contacts');
  };

  const handleAccountEdit = (account: Account) => {
    setEditingAccount(account);
    setShowAccountForm(true);
  };

  const handleContactEdit = (contact: Contact) => {
    setEditingContact(contact);
    setShowContactForm(true);
  };

  const handleAccountDelete = (accountId: string) => {
    setAccounts(prev => (prev || []).filter(a => a.id !== accountId));
    setContacts(prev => (prev || []).filter(c => c.accountId !== accountId));
    setSelectedAccount(null);
    setCurrentView('accounts');
  };

  const handleContactDelete = (contactId: string) => {
    setContacts(prev => (prev || []).filter(c => c.id !== contactId));
    setSelectedContact(null);
    // If we were viewing from account page, go back to that account
    if (viewingContactFromAccount) {
      const account = accounts.find(a => a.id === viewingContactFromAccount);
      if (account) {
        setSelectedAccount(account);
      }
      setViewingContactFromAccount(null);
    }
  };

  const handleViewAccount = (account: Account) => {
    setSelectedAccount(account);
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  // New handler for viewing contact from account page
  const handleViewContactFromAccount = (contact: Contact, accountId: string) => {
    setSelectedContact(contact);
    setViewingContactFromAccount(accountId);
    setSelectedAccount(null); // Hide account details while viewing contact
  };

  // New handler for going back from contact to account
  const handleBackToAccount = () => {
    if (viewingContactFromAccount) {
      const account = accounts.find(a => a.id === viewingContactFromAccount);
      if (account) {
        setSelectedAccount(account);
      }
      setSelectedContact(null);
      setViewingContactFromAccount(null);
    } else {
      handleBackToList();
    }
  };

  const handleBackToList = () => {
    setSelectedAccount(null);
    setSelectedContact(null);
    setEditingAccount(null);
    setEditingContact(null);
    setShowAccountForm(false);
    setShowContactForm(false);
    setViewingContactFromAccount(null);
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowAccountForm(true);
  };

  const handleAddContact = (accountId?: string) => {
    setEditingContact(null);
    // If accountId is provided, we can pre-populate the contact form with the account
    if (accountId) {
      // Create a new contact with the accountId pre-filled
      const newContact = {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        accountId: accountId,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      } as Contact;
      setEditingContact(newContact);
    }
    setShowContactForm(true);
  };

  const handleExploreFeatures = () => {
    setCurrentView('document-storage');
  };

  const handleImportAccounts = (importedAccounts: Account[]) => {
    setAccounts(prev => {
      const existingAccounts = prev || [];
      const updatedAccounts = [...existingAccounts];
      
      importedAccounts.forEach(importedAccount => {
        // Try to find existing account by name (case-insensitive)
        const existingIndex = updatedAccounts.findIndex(
          a => a.accountName.toLowerCase() === importedAccount.accountName.toLowerCase()
        );
        
        if (existingIndex >= 0) {
          // Update existing account, preserve the original ID
          updatedAccounts[existingIndex] = {
            ...importedAccount,
            id: updatedAccounts[existingIndex].id,
            createdAt: updatedAccounts[existingIndex].createdAt,
            lastModified: new Date().toISOString()
          };
        } else {
          // Add new account
          updatedAccounts.push(importedAccount);
        }
      });
      
      return updatedAccounts;
    });
  };

  const handleImportContacts = (importedContacts: Contact[]) => {
    setContacts(prev => {
      const existingContacts = prev || [];
      const updatedContacts = [...existingContacts];
      
      importedContacts.forEach(importedContact => {
        // Try to find existing contact by email (case-insensitive)
        const existingIndex = updatedContacts.findIndex(
          c => c.email.toLowerCase() === importedContact.email.toLowerCase()
        );
        
        if (existingIndex >= 0) {
          // Update existing contact, preserve the original ID
          updatedContacts[existingIndex] = {
            ...importedContact,
            id: updatedContacts[existingIndex].id,
            createdAt: updatedContacts[existingIndex].createdAt,
            lastModified: new Date().toISOString()
          };
        } else {
          // Add new contact
          updatedContacts.push(importedContact);
        }
      });
      
      return updatedContacts;
    });
  };

  const handleUpdateAccounts = (updatedAccounts: Account[]) => {
    setAccounts(updatedAccounts);
  };

  // Helper function to check if a date is coming up (within 7 days)
  const isDateUpcoming = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  // Helper function to check if a date is overdue
  const isDateOverdue = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date < today;
  };

  // Helper function to get influencer level badge style
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
      <Badge variant="outline" className={`text-xs flex items-center gap-1 ${className}`}>
        <TrendingUp className="w-3 h-3" />
        Influence: {level}/10 ({label})
      </Badge>
    );
  };

  // Helper function to get receptiveness badge
  const getReceptivenessBadge = (receptiveness?: string) => {
    if (!receptiveness) return null;

    let className = '';
    let label = '';

    switch (receptiveness) {
      case 'very-receptive':
        className = 'bg-green-500 text-white border-green-600';
        label = 'Very Receptive';
        break;
      case 'receptive':
        className = 'bg-green-100 text-green-800 border-green-300';
        label = 'Receptive';
        break;
      case 'neutral':
        className = 'bg-gray-100 text-gray-800 border-gray-300';
        label = 'Neutral';
        break;
      case 'not-very-receptive':
        className = 'bg-orange-100 text-orange-800 border-orange-300';
        label = 'Not Very Receptive';
        break;
      case 'not-receptive':
        className = 'bg-red-500 text-white border-red-600';
        label = 'Not Receptive';
        break;
      default:
        return null;
    }

    return (
      <Badge variant="outline" className={`text-xs flex items-center gap-1 ${className}`}>
        <ThumbsUp className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  // Enhanced filter for accounts - includes all badge content for search
  const filteredAccounts = (accounts || []).filter(account => {
    const primaryContact = account.primaryContactId 
      ? (contacts || []).find(c => c.id === account.primaryContactId)
      : (contacts || []).find(c => c.accountId === account.id && c.contactType === 'Primary');
    
    const ownerName = primaryContact 
      ? `${primaryContact.firstName} ${primaryContact.lastName}` 
      : (account.accountOwner || '');

    // Find relationship owner from contacts - look for any contact with a relationship owner set
    const relationshipOwnerContact = (contacts || []).find(c => 
      c.accountId === account.id && c.relationshipOwner?.name
    );
    const relationshipOwner = relationshipOwnerContact?.relationshipOwner?.name || 'Mora Ambrey';

    const searchTerm = accountSearchTerm.toLowerCase();
    
    return (
      (account.accountName || '').toLowerCase().includes(searchTerm) ||
      (account.industry || '').toLowerCase().includes(searchTerm) ||
      (account.accountOwner || '').toLowerCase().includes(searchTerm) ||
      (account.accountStatus || '').toLowerCase().includes(searchTerm) ||
      (account.channel || '').toLowerCase().includes(searchTerm) ||
      ownerName.toLowerCase().includes(searchTerm) ||
      relationshipOwner.toLowerCase().includes(searchTerm) ||
      (account.revenue && account.revenue.toString().includes(searchTerm))
    );
  });

  // Filter contacts based on search term - FIXED: Added null checks
  const filteredContacts = (contacts || []).filter(contact => {
    const account = (accounts || []).find(a => a.id === contact.accountId);
    return (
      (contact.firstName || '').toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      (contact.lastName || '').toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      (contact.email || '').toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      (contact.title && contact.title.toLowerCase().includes(contactSearchTerm.toLowerCase())) ||
      (contact.relationshipOwner?.name && contact.relationshipOwner.name.toLowerCase().includes(contactSearchTerm.toLowerCase())) ||
      (contact.relationshipStatus && contact.relationshipStatus.toLowerCase().includes(contactSearchTerm.toLowerCase())) ||
      (account && (account.accountName || '').toLowerCase().includes(contactSearchTerm.toLowerCase()))
    );
  });

  const navigationItems = [
    { id: 'welcome', label: 'Home', icon: Home },
    { id: 'accounts', label: 'Customer Accounts', icon: Building2 },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'data-view', label: 'Data View', icon: BarChart3 },
    { id: 'contact-hierarchy', label: 'Contact Hierarchy', icon: Network },
    { id: 'task-management', label: 'Task Management', icon: CheckSquare },
    { id: 'document-storage', label: 'Document Storage', icon: FolderOpen },
    { id: 'alert-system', label: 'Alert System', icon: Bell },
    { id: 'sharepoint-sync', label: 'SharePoint Sync', icon: FolderOpen },
    { id: 'relationship-owners', label: 'Relationship Owners', icon: UserCog },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  const renderNavigation = () => (
    <nav className="space-y-2">
      {navigationItems.map(item => (
        <Button
          key={item.id}
          variant={currentView === item.id ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => {
            setCurrentView(item.id as View);
            setIsMobileMenuOpen(false);
            handleBackToList();
          }}
        >
          <item.icon className="w-4 h-4 mr-2" />
          {item.label}
        </Button>
      ))}
    </nav>
  );

  const getPreferredContactIcon = (method?: string) => {
    switch (method) {
      case 'email':
        return <Mail className="w-3 h-3" />;
      case 'mobile phone':
        return <MessageCircle className="w-3 h-3" />;
      case 'office phone':
        return <Phone className="w-3 h-3" />;
      default:
        return <Mail className="w-3 h-3" />;
    }
  };

  const renderContent = () => {
    // Handle form states
    if (showAccountForm) {
      return (
        <AccountForm
          account={editingAccount}
          contacts={contacts || []}
          onSave={handleAccountSave}
          onCancel={handleBackToList}
        />
      );
    }

    if (showContactForm) {
      return (
        <ContactForm
          contact={editingContact}
          accounts={accounts || []}
          onSave={handleContactSave}
          onCancel={handleBackToList}
        />
      );
    }

    // Handle detail views
    if (selectedAccount) {
      return (
        <AccountDetails
          account={selectedAccount}
          contacts={(contacts || []).filter(c => c.accountId === selectedAccount.id)}
          onEdit={handleAccountEdit}
          onDelete={handleAccountDelete}
          onBack={handleBackToList}
          onAddContact={handleAddContact}
          onViewContact={(contact) => handleViewContactFromAccount(contact, selectedAccount.id)}
          onUpdateAccount={handleAccountUpdate}
        />
      );
    }

    if (selectedContact) {
      return (
        <ContactDetails
          contact={selectedContact}
          account={(accounts || []).find(a => a.id === selectedContact.accountId)}
          onEdit={handleContactEdit}
          onDelete={handleContactDelete}
          onBack={handleBackToAccount}
        />
      );
    }

    // Handle main views
    switch (currentView) {
      case 'welcome':
        return (
          <WelcomeScreen 
            userName={userName} 
            accounts={accounts} 
            contacts={contacts}
            onAddAccount={handleAddAccount}
            onAddContact={() => handleAddContact()}
            onExploreFeatures={handleExploreFeatures}
          />
        );
      
      case 'accounts':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Customer Accounts</h2>
                <p className="text-gray-600">Manage your strategic business relationships</p>
              </div>
              <Button onClick={handleAddAccount} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Account
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search accounts by name, industry, owner, relationship owner, channel, status, or revenue..."
                value={accountSearchTerm}
                onChange={(e) => setAccountSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredAccounts.length} of {(accounts || []).length} accounts
              </p>
            </div>

            {/* Accounts List */}
            <div className="space-y-4">
              {filteredAccounts.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="space-y-4">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {accountSearchTerm ? 'No accounts found' : 'No accounts yet'}
                      </h3>
                      <p className="text-gray-600">
                        {accountSearchTerm 
                          ? 'Try adjusting your search terms'
                          : 'Get started by adding your first strategic account'
                        }
                      </p>
                    </div>
                    {!accountSearchTerm && (
                      <Button onClick={handleAddAccount} className="mx-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Account
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                filteredAccounts.map(account => {
                  // Find the primary contact for this account
                  const primaryContact = account.primaryContactId 
                    ? (contacts || []).find(c => c.id === account.primaryContactId)
                    : (contacts || []).find(c => c.accountId === account.id && c.contactType === 'Primary');

                  // Find relationship owner contact - look for any contact with a relationship owner set
                  const relationshipOwnerContact = (contacts || []).find(c => 
                    c.accountId === account.id && c.relationshipOwner?.name
                  );

                  return (
                    <Card key={account.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div onClick={() => handleViewAccount(account)} className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                  {account.accountName || 'Unnamed Account'}
                                </h3>
                                {account.industry && (
                                  <p className="text-gray-600 mt-1">{account.industry}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {account.accountStatus && (
                                    <Badge variant="outline" className="text-xs">
                                      {account.accountStatus}
                                    </Badge>
                                  )}
                                  {account.channel && (
                                    <Badge variant="secondary" className="text-xs">
                                      Channel: {account.channel}
                                    </Badge>
                                  )}
                                  <Badge variant="default" className="text-xs">
                                    Owner: {primaryContact 
                                      ? `${primaryContact.firstName} ${primaryContact.lastName}` 
                                      : (account.accountOwner || 'No owner')
                                    }
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Relationship Owner: {relationshipOwnerContact?.relationshipOwner?.name || 'Mora Ambrey'}
                                  </Badge>
                                  {account.revenue && (
                                    <Badge variant="outline" className="text-xs">
                                      Revenue: ${account.revenue.toLocaleString()}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccountEdit(account);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      
      case 'contacts':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
                <p className="text-gray-600">Build and maintain key relationships</p>
              </div>
              <Button onClick={() => handleAddContact()} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search contacts by name, email, title, relationship status, owner, or company..."
                value={contactSearchTerm}
                onChange={(e) => setContactSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredContacts.length} of {(contacts || []).length} contacts
              </p>
            </div>

            {/* Contacts List */}
            <div className="space-y-4">
              {filteredContacts.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="space-y-4">
                    <Users className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {contactSearchTerm ? 'No contacts found' : 'No contacts yet'}
                      </h3>
                      <p className="text-gray-600">
                        {contactSearchTerm 
                          ? 'Try adjusting your search terms'
                          : 'Start building your network by adding key contacts'
                        }
                      </p>
                    </div>
                    {!contactSearchTerm && (
                      <Button onClick={() => handleAddContact()} className="mx-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Contact
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                filteredContacts.map(contact => {
                  const account = (accounts || []).find(a => a.id === contact.accountId);
                  const birthdayUpcoming = contact.birthday && contact.birthdayAlert && isDateUpcoming(contact.birthday);
                  const nextContactOverdue = contact.nextContactDate && isDateOverdue(contact.nextContactDate);
                  const nextContactUpcoming = contact.nextContactDate && contact.nextContactAlert && isDateUpcoming(contact.nextContactDate);
                  
                  return (
                    <Card key={contact.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div onClick={() => handleViewContact(contact)} className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                    {contact.firstName || 'Unknown'} {contact.lastName || 'Contact'}
                                  </h3>
                                  {(birthdayUpcoming || nextContactOverdue || nextContactUpcoming) && (
                                    <div className="flex gap-1">
                                      {birthdayUpcoming && (
                                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                          🎂 Birthday Soon
                                        </Badge>
                                      )}
                                      {nextContactOverdue && (
                                        <Badge variant="destructive" className="text-xs">
                                          <AlertTriangle className="w-3 h-3 mr-1" />
                                          Overdue
                                        </Badge>
                                      )}
                                      {nextContactUpcoming && !nextContactOverdue && (
                                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                          📅 Contact Due
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-1 mb-3">
                                  <p className="text-gray-600">{contact.title || 'No title specified'}</p>
                                  <p className="text-sm text-gray-500">
                                    {account ? account.accountName : 'No account assigned'}
                                  </p>
                                  {contact.relationshipStatus && (
                                    <p className="text-sm text-gray-500">
                                      Relationship: {contact.relationshipStatus}
                                    </p>
                                  )}
                                </div>

                                {/* Contact Information */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {contact.email && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {contact.email}
                                    </Badge>
                                  )}
                                  {contact.officePhone && (
                                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      Office: {contact.officePhone}
                                    </Badge>
                                  )}
                                  {contact.mobilePhone && (
                                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                      <MessageCircle className="w-3 h-3" />
                                      Mobile: {contact.mobilePhone}
                                    </Badge>
                                  )}
                                  {contact.preferredContactMethod && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      {getPreferredContactIcon(contact.preferredContactMethod)}
                                      Prefers: {contact.preferredContactMethod}
                                    </Badge>
                                  )}
                                </div>

                                {/* Influence, Receptiveness and Relationship Owner */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {contact.influence && (
                                    <Badge variant="outline" className="text-xs">
                                      Influence: {contact.influence}
                                    </Badge>
                                  )}
                                  {getInfluencerLevelBadge(contact.influencerLevel)}
                                  {getReceptivenessBadge(contact.receptiveness)}
                                  {contact.relationshipOwner?.name && (
                                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      Owner: {contact.relationshipOwner.name}
                                    </Badge>
                                  )}
                                </div>

                                {/* Contact Dates - Side by side layout */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-xs text-gray-500">
                                  {/* First row: Birthday and Next Contact */}
                                  <div className="space-y-2">
                                    {contact.birthday && (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Birthday: {new Date(contact.birthday).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    {contact.nextContactDate && (
                                      <div className={`flex items-center gap-1 ${nextContactOverdue ? 'text-red-600 font-medium' : nextContactUpcoming ? 'text-yellow-600 font-medium' : ''}`}>
                                        <Calendar className="w-3 h-3" />
                                        Next Contact: {new Date(contact.nextContactDate).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Second row: Last Contact (spans full width) */}
                                  {contact.lastContactDate && (
                                    <div className="md:col-span-2">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Last Contact: {new Date(contact.lastContactDate).toLocaleDateString()}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Social Handles */}
                                {contact.socialHandles && contact.socialHandles.length > 0 && (
                                  <div className="mb-3">
                                    <div className="flex flex-wrap gap-1">
                                      {contact.socialHandles.slice(0, 3).map((handle, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {handle}
                                        </Badge>
                                      ))}
                                      {contact.socialHandles.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{contact.socialHandles.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Preferences Preview */}
                                {contact.knownPreferences && (
                                  <div className="mb-2">
                                    <p className="text-xs text-gray-500 italic">
                                      Preferences: {contact.knownPreferences.length > 80 ? contact.knownPreferences.substring(0, 80) + '...' : contact.knownPreferences}
                                    </p>
                                  </div>
                                )}

                                {/* Notes Preview */}
                                {contact.notes && (
                                  <div className="mb-2">
                                    <p className="text-xs text-gray-500 italic">
                                      Notes: {contact.notes.length > 80 ? contact.notes.substring(0, 80) + '...' : contact.notes}
                                    </p>
                                  </div>
                                )}

                                {/* Uploaded Notes Count */}
                                {contact.uploadedNotes && contact.uploadedNotes.length > 0 && (
                                  <div>
                                    <Badge variant="outline" className="text-xs">
                                      📎 {contact.uploadedNotes.length} additional note{contact.uploadedNotes.length !== 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContactEdit(contact);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      
      case 'data-view':
        return <DataView accounts={accounts || []} contacts={contacts || []} onBack={() => setCurrentView('welcome')} />;
      
      case 'document-storage':
        return (
          <DocumentStorage
            accounts={accounts || []}
            contacts={contacts || []}
            onBack={() => setCurrentView('welcome')}
          />
        );
      
      case 'contact-hierarchy':
        return (
          <ContactHierarchy
            accounts={accounts || []}
            contacts={contacts || []}
            onBack={() => setCurrentView('welcome')}
            onAddContact={handleAddContact}
            onViewContact={handleViewContact}
          />
        );
      
      case 'task-management':
        return (
          <TaskManagement
            accounts={accounts || []}
            contacts={contacts || []}
            onBack={() => setCurrentView('welcome')}
          />
        );
      
      case 'alert-system':
        return (
          <AlertSystem
            accounts={accounts || []}
            contacts={contacts || []}
            onBack={() => setCurrentView('welcome')}
          />
        );
      
      case 'sharepoint-sync':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Button variant="ghost" onClick={() => setCurrentView('welcome')} className="mb-2">
                  ← Back to Dashboard
                </Button>
                <h2 className="text-2xl font-bold">SharePoint Data Sync</h2>
                <p className="text-gray-600">Synchronize CRM data with SharePoint files</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SharePointImport onImport={handleImportAccounts} existingAccounts={accounts || []} />
              <ContactImport onImport={handleImportContacts} existingContacts={contacts || []} existingAccounts={accounts || []} />
            </div>
            
            <MarketSnapshotUpload 
              accounts={accounts || []} 
              onUpdate={handleUpdateAccounts}
            />
            
            <SharePointSync accounts={accounts || []} contacts={contacts || []} />
          </div>
        );
      
      case 'relationship-owners':
        return <RelationshipOwnerDirectory onBack={() => setCurrentView('welcome')} />;
      
      case 'faq':
        return <FAQPage />;
      
      default:
        return (
          <WelcomeScreen 
            userName={userName} 
            accounts={accounts} 
            contacts={contacts}
            onAddAccount={handleAddAccount}
            onAddContact={() => handleAddContact()}
            onExploreFeatures={handleExploreFeatures}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Made Sticky */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold">Strategic Accounts CRM</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white border-r min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold mb-6">Strategic Accounts CRM</h1>
            {renderNavigation()}
          </div>
        </div>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="w-64 bg-white h-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl font-bold">Strategic Accounts CRM</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                {renderNavigation()}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}