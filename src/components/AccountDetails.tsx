import React, { useState } from 'react';
import { Building2, Users, Edit, Trash2, Plus, Phone, Mail, Calendar, CheckSquare, User, Printer, MapPin, Globe, X, ChevronDown, ChevronUp, DollarSign, TrendingUp, Package, FileText, Target, Briefcase, ShoppingCart, Truck, Bell, BellOff, MessageSquare, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { AddressMap } from '@/components/AddressMap';
import type { Account, Contact, CustomerEvent, BannerBuyingOffice } from '@/types/crm';
import type { Task } from '@/types/crm-advanced';
import { formatBirthday } from '@/lib/dateUtils';

interface AccountDetailsProps {
  account: Account;
  contacts: Contact[];
  onBack: () => void;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
  onAddContact: (accountId: string) => void;
  onViewContact: (contact: Contact) => void;
  onUpdateAccount?: (account: Account) => void;
}

// Extended CustomerEvent interface with alert functionality
interface CustomerEventWithAlert extends CustomerEvent {
  alertEnabled?: boolean;
  alertDays?: number;
}

// Helper function to get Support Style color matching ContactForm
const getSupportStyleColor = (status: string) => {
  if (status.startsWith('Promoter')) return '#166534'; // dark green
  if (status.startsWith('Supporter')) return '#16a34a'; // green
  if (status.startsWith('Neutral')) return '#6b7280'; // gray
  if (status.startsWith('Detractor')) return '#ea580c'; // orange
  if (status.startsWith('Adversarial')) return '#991b1b'; // red
  return '#6b7280'; // default gray
};

// Helper function to get Support Style label (first word only)
const getSupportStyleLabel = (status: string) => {
  return status.split(' ')[0]; // Get first word only (Promoter, Supporter, Neutral, Detractor, Adversarial)
};

// Helper function to get preferred contact info based on preferredContactMethod
const getPreferredContactInfo = (contact: Contact): { 
  value: string | undefined; 
  icon: React.ComponentType<{ className?: string }>; 
  label: string;
  href: string;
} | null => {
  const method = contact.preferredContactMethod;
  
  if (!method) {
    // Fallback: show email if available, otherwise mobile, otherwise office
    if (contact.email) {
      return {
        value: contact.email,
        icon: Mail,
        label: 'Email',
        href: `mailto:${contact.email}`
      };
    }
    if (contact.mobilePhone) {
      return {
        value: contact.mobilePhone,
        icon: Phone,
        label: 'Mobile',
        href: `tel:${contact.mobilePhone}`
      };
    }
    if (contact.officePhone) {
      return {
        value: contact.officePhone,
        icon: Phone,
        label: 'Office',
        href: `tel:${contact.officePhone}`
      };
    }
    return null;
  }

  switch (method) {
    case 'email':
      return contact.email ? {
        value: contact.email,
        icon: Mail,
        label: 'Email (Preferred)',
        href: `mailto:${contact.email}`
      } : null;
    
    case 'mobile phone':
      return contact.mobilePhone ? {
        value: contact.mobilePhone,
        icon: Phone,
        label: 'Mobile (Preferred)',
        href: `tel:${contact.mobilePhone}`
      } : null;
    
    case 'office phone':
      return contact.officePhone ? {
        value: contact.officePhone,
        icon: Phone,
        label: 'Office (Preferred)',
        href: `tel:${contact.officePhone}`
      } : null;
    
    case 'text':
      return contact.mobilePhone ? {
        value: contact.mobilePhone,
        icon: MessageSquare,
        label: 'Text (Preferred)',
        href: `sms:${contact.mobilePhone}`
      } : null;
    
    default:
      return null;
  }
};

export default function AccountDetails({ 
  account, 
  contacts, 
  onBack, 
  onEdit, 
  onDelete, 
  onAddContact, 
  onViewContact,
  onUpdateAccount
}: AccountDetailsProps) {
  // Get primary contact for this account
  const primaryContact = account.primaryContactId 
    ? contacts.find(c => c.id === account.primaryContactId)
    : contacts.find(c => c.contactType === 'Primary');

  // Find the relationship owner - look for any contact with a relationship owner set
  const relationshipOwnerContact = contacts.find(c => c.relationshipOwner?.name);
  const relationshipOwnerName = relationshipOwnerContact?.relationshipOwner?.name || 'No Assigned';

  // Customer Events state with alert functionality
  const [customerEvents, setCustomerEvents] = useState<CustomerEventWithAlert[]>(
    (account.customerEvents || []).map(event => ({
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
  const [expandAll, setExpandAll] = useState(false);

  // Sample tasks related to this account
  const [accountTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Follow up on Q4 proposal',
      description: 'Schedule meeting to discuss pricing proposal with procurement team',
      type: 'follow-up',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: primaryContact ? `${primaryContact.firstName} ${primaryContact.lastName}` : account.accountOwner,
      relatedId: account.id,
      relatedType: 'account',
      relatedName: account.accountName,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: 2,
      tags: ['proposal', 'pricing', 'urgent']
    },
    {
      id: '2',
      title: 'Prepare contract renewal',
      description: 'Review current contract terms and prepare renewal documentation',
      type: 'contract',
      priority: 'critical',
      status: 'in-progress',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: primaryContact ? `${primaryContact.firstName} ${primaryContact.lastName}` : account.accountOwner,
      relatedId: account.id,
      relatedType: 'account',
      relatedName: account.accountName,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: 8,
      actualHours: 4,
      tags: ['contract', 'renewal', 'legal']
    }
  ]);

  const handleAddEvent = () => {
    if (!newEventTitle.trim() || !newEventDate) {
      alert('Please enter both event title and date');
      return;
    }

    const newEvent: CustomerEventWithAlert = {
      id: Date.now().toString(),
      title: newEventTitle.trim(),
      date: newEventDate,
      alertEnabled: newEventAlertEnabled,
      alertDays: newEventAlertDays
    };

    const updatedEvents = [...customerEvents, newEvent];
    setCustomerEvents(updatedEvents);

    // Update the account with new events
    const updatedAccount = {
      ...account,
      customerEvents: updatedEvents.map(({ alertEnabled, alertDays, ...event }) => event),
      lastModified: new Date().toISOString()
    };

    if (onUpdateAccount) {
      onUpdateAccount(updatedAccount);
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
      const updatedEvents = customerEvents.filter(e => e.id !== eventId);
      setCustomerEvents(updatedEvents);

      // Update the account with new events
      const updatedAccount = {
        ...account,
        customerEvents: updatedEvents.map(({ alertEnabled, alertDays, ...event }) => event),
        lastModified: new Date().toISOString()
      };

      if (onUpdateAccount) {
        onUpdateAccount(updatedAccount);
      }
    }
  };

  const handleToggleEventAlert = (eventId: string) => {
    const updatedEvents = customerEvents.map(event => 
      event.id === eventId 
        ? { ...event, alertEnabled: !event.alertEnabled }
        : event
    );
    setCustomerEvents(updatedEvents);

    // Update the account
    const updatedAccount = {
      ...account,
      customerEvents: updatedEvents.map(({ alertEnabled, alertDays, ...event }) => event),
      lastModified: new Date().toISOString()
    };

    if (onUpdateAccount) {
      onUpdateAccount(updatedAccount);
    }
  };

  const handleUpdateEventAlertDays = (eventId: string, days: number) => {
    const updatedEvents = customerEvents.map(event => 
      event.id === eventId 
        ? { ...event, alertDays: days }
        : event
    );
    setCustomerEvents(updatedEvents);

    // Update the account
    const updatedAccount = {
      ...account,
      customerEvents: updatedEvents.map(({ alertEnabled, alertDays, ...event }) => event),
      lastModified: new Date().toISOString()
    };

    if (onUpdateAccount) {
      onUpdateAccount(updatedAccount);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getDaysUntilEvent = (eventDate: string) => {
    const days = Math.ceil((new Date(eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const InfoItem = ({ label, value, icon: Icon, muted }: { label: string; value: string | number | undefined; icon?: React.ComponentType<{ className?: string }>; muted?: boolean }) => {
    if (!value) return null;
    return (
      <div>
        <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </label>
        <p className={`text-base mt-1 ${muted ? 'text-muted-foreground' : ''}`}>{value}</p>
      </div>
    );
  };

  // Helper to display spirits outlets by state
  const renderSpiritsOutletsByState = () => {
    if (!account.spiritsOutletsByState || account.spiritsOutletsByState.length === 0) return null;
    
    return (
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-gray-600">Spirits Outlets by State</label>
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {account.spiritsOutletsByState.map((outlet, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-medium">{outlet.state}:</span> {outlet.outletCount || 'N/A'}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Accounts
          </Button>
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">{account.accountName}</h1>
              {account.parentCompany && (
                <p className="text-gray-600">Part of {account.parentCompany}</p>
              )}
            </div>
            {account.publiclyTraded && account.tickerSymbol && (
              <Badge variant="outline" className="ml-2">
                {account.tickerSymbol}
              </Badge>
            )}
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
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={() => onEdit(account)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this account? This will also delete all associated contacts.')) {
                onDelete(account.id);
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Collapsible Sections */}
        <div className="lg:col-span-2 space-y-4">
          <Accordion type="multiple" defaultValue={expandAll ? ['overview', 'parent-info', 'hq-influence', 'strategy', 'planogram', 'additional-info', 'banners', 'events', 'tasks'] : ['overview']} value={expandAll ? ['overview', 'parent-info', 'hq-influence', 'strategy', 'planogram', 'additional-info', 'banners', 'events', 'tasks'] : undefined}>
            
            {/* Customer Overview */}
            <AccordionItem value="overview">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Customer Overview
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Basic Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Account Name" value={account.accountName} icon={Building2} />
                          <InfoItem label="Parent Company" value={account.parentCompany} />
                          <InfoItem label="Ticker Symbol" value={account.tickerSymbol} />
                          <InfoItem label="Publicly Traded" value={account.publiclyTraded ? 'Yes' : 'No'} />
                        </div>
                      </div>

                      <Separator />

                      {/* Channel & Footprint */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Channel & Footprint</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Channel" value={account.channel} />
                          <InfoItem label="Sub-Channel" value={account.subChannel} />
                          <InfoItem label="Channel Mapping" value={account.footprint} />
                          <InfoItem label="Operating States" value={Array.isArray(account.operatingStates) ? account.operatingStates.join(', ') : account.operatingStates} />
                          {renderSpiritsOutletsByState()}
                          <InfoItem label="Full Proof Outlets" value={account.fullProofOutlets} />
                          <InfoItem label="Total Buying Offices" value={account.totalBuyingOffices} />
                        </div>
                      </div>

                      <Separator />

                      {/* Execution Reliability */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Execution Reliability</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Execution Reliability Score" value={account.executionReliabilityScore} />
                          {account.executionReliabilityRationale && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-gray-600">Rationale/Notes</label>
                              <p className="text-sm mt-1 whitespace-pre-wrap">{account.executionReliabilityRationale}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Team Information */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Team Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Primary Contact" value={primaryContact ? `${primaryContact.firstName} ${primaryContact.lastName}` : account.accountOwner} icon={User} />
                          <InfoItem 
                            label="Relationship Owner" 
                            value={relationshipOwnerName} 
                            icon={User} 
                            muted={relationshipOwnerName === 'No Assigned'}
                          />
                          <InfoItem label="VP" value={account.vp} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Parent Information */}
            <AccordionItem value="parent-info">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Parent Information
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Address with embedded Google Map */}
                      {account.address && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Parent Company Address
                          </label>
                          <p className="text-base mt-1 mb-3">{account.address}</p>
                          <AddressMap address={account.address} />
                        </div>
                      )}
                      
                      {/* Clickable Company Website */}
                      {account.website && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Company Website
                          </label>
                          <a 
                            href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base mt-1 text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                          >
                            {account.website}
                            <Globe className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* HQ Level of Influence */}
            <AccordionItem value="hq-influence">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  HQ Level of Influence
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem label="Assortment / Shelf" value={account.influenceAssortmentShelf} />
                      <InfoItem label="Price / Promo" value={account.influencePricePromo} />
                      <InfoItem label="Display / Merchandising" value={account.influenceDisplayMerchandising} />
                      <InfoItem label="Digital" value={account.influenceDigital} />
                      <InfoItem label="eCommerce" value={account.influenceEcommerce} />
                      <InfoItem label="In Store Events" value={account.influenceInStoreEvents} />
                      <InfoItem label="Shrink Management" value={account.influenceShrinkManagement} />
                      <InfoItem label="Buying / PO Ownership" value={account.influenceBuyingPOOwnership} />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Strategy and Capabilities */}
            <AccordionItem value="strategy">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Strategy and Capabilities
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* JBP Information */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">JBP Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="JBP Customer" value={account.isJBP ? 'Yes' : 'No'} />
                          {account.isJBP && (
                            <>
                              <InfoItem label="Last JBP" value={account.lastJBPDate} />
                              <InfoItem label="Next JBP" value={account.nextJBPDate} />
                            </>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Business Strategy */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Business Strategy</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Pricing Strategy" value={account.pricingStrategy} />
                          <InfoItem label="Private Label" value={account.privateLabel} />
                          <InfoItem label="Display Mandates" value={account.displayMandates} />
                          <InfoItem label="Innovation Appetite" value={account.innovationAppetite} />
                          <InfoItem label="Category Captain" value={account.categoryCaptain} />
                          <InfoItem label="Category Validator" value={account.categoryAdvisor} />
                        </div>
                      </div>

                      <Separator />

                      {/* E-commerce & Fulfillment */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">E-commerce & Fulfillment</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="E-commerce Maturity Level" value={account.ecommerceMaturityLevel} />
                          <InfoItem label="% of Sales from E-Commerce" value={account.ecommerceSalesPercentage ? `${account.ecommerceSalesPercentage}%` : undefined} />
                          <InfoItem label="Fulfillment Types" value={Array.isArray(account.fulfillmentTypes) ? account.fulfillmentTypes.join(', ') : account.fulfillmentTypes} />
                          <InfoItem label="E-commerce Partners" value={Array.isArray(account.ecommercePartners) ? account.ecommercePartners.join(', ') : account.ecommercePartners} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Planogram Information */}
            <AccordionItem value="planogram">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Planogram Information
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem label="Has Planogram" value={account.hasPlanograms ? 'Yes' : 'No'} />
                        <InfoItem label="Planogram Written By" value={account.planogramWrittenBy} />
                      </div>

                      {account.hasPlanograms && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-gray-700">Reset Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InfoItem label="Affected Categories" value={Array.isArray(account.affectedCategories) ? account.affectedCategories.join(', ') : account.affectedCategories} />
                              <InfoItem label="Reset Frequency" value={account.resetFrequency} />
                              <InfoItem label="Reset Window Lead Time" value={account.resetWindowLeadTime} />
                              <InfoItem label="Different Reset Windows per Category" value={account.hasDifferentResetWindows} />
                              {account.hasDifferentResetWindows !== 'Yes' && (
                                <InfoItem label="Reset Window Months" value={Array.isArray(account.resetWindowMonths) ? account.resetWindowMonths.join(', ') : account.resetWindowMonths} />
                              )}
                            </div>

                            {/* Category-Specific Reset Windows */}
                            {account.hasDifferentResetWindows === 'Yes' && account.categoryResetWindows && account.categoryResetWindows.length > 0 && (
                              <div className="mt-4">
                                <label className="text-sm font-medium text-gray-600 mb-2 block">Category-Specific Reset Windows</label>
                                <div className="space-y-2">
                                  {account.categoryResetWindows.map((crw, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                                      <p className="text-sm font-medium">{crw.category}</p>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {Array.isArray(crw.months) ? crw.months.join(', ') : 'No months specified'}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Additional Information */}
            <AccordionItem value="additional-info">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Additional Information
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {account.strategicPriorities && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Customer Strategic Priorities</label>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{account.strategicPriorities}</p>
                        </div>
                      )}
                      {account.keyCompetitors && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Key Competitors</label>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{account.keyCompetitors}</p>
                        </div>
                      )}
                      {account.designatedCharities && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Designated Charities</label>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{account.designatedCharities}</p>
                        </div>
                      )}
                      {!account.strategicPriorities && !account.keyCompetitors && !account.designatedCharities && (
                        <p className="text-gray-500 text-sm">No additional information available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Banners/Buying Offices */}
            <AccordionItem value="banners">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Banners/Buying Offices ({(account.bannerBuyingOffices || []).length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    {(!account.bannerBuyingOffices || account.bannerBuyingOffices.length === 0) ? (
                      <div className="text-center py-8 text-gray-500">
                        <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm">No Banner/Buying Offices added to this account</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[500px] pr-4">
                        <Accordion type="multiple" className="space-y-3">
                          {account.bannerBuyingOffices.map((banner, index) => (
                            <AccordionItem key={index} value={`banner-${index}`} className="border rounded-lg">
                              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <div className="flex items-center gap-3">
                                    <Building className="w-5 h-5 text-blue-600" />
                                    <div className="text-left">
                                      <h4 className="font-semibold text-base">
                                        {banner.accountName || `Banner/Buying Office #${index + 1}`}
                                      </h4>
                                      {banner.channel && (
                                        <Badge variant="outline" className="mt-1">
                                          {banner.channel}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="space-y-4 pt-2">
                                  {/* Basic Information */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {banner.address && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                          <MapPin className="w-4 h-4" />
                                          Address
                                        </label>
                                        <p className="text-sm mt-1">{banner.address}</p>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="mt-2"
                                          onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(banner.address || '')}`, '_blank')}
                                        >
                                          <MapPin className="w-3 h-3 mr-2" />
                                          View on Map
                                        </Button>
                                      </div>
                                    )}
                                    {banner.website && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                          <Globe className="w-4 h-4" />
                                          Website
                                        </label>
                                        <a 
                                          href={banner.website.startsWith('http') ? banner.website : `https://${banner.website}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm mt-1 text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                                        >
                                          {banner.website}
                                          <Globe className="w-3 h-3" />
                                        </a>
                                      </div>
                                    )}
                                    {banner.footprint && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Channel Mapping</label>
                                        <p className="text-sm mt-1">{banner.footprint}</p>
                                      </div>
                                    )}
                                    {banner.operatingStates && banner.operatingStates.length > 0 && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Operating States</label>
                                        <p className="text-sm mt-1">
                                          {banner.operatingStates.join(', ')} ({banner.operatingStates.length} states)
                                        </p>
                                      </div>
                                    )}
                                    {banner.allSpiritsOutlets && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">All Spirits Outlets</label>
                                        <p className="text-sm mt-1">{banner.allSpiritsOutlets}</p>
                                      </div>
                                    )}
                                    {banner.fullProofOutlets && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">Full Proof Outlets</label>
                                        <p className="text-sm mt-1">{banner.fullProofOutlets}</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Level of Influence */}
                                  {(banner.influenceAssortmentShelf || banner.influencePricePromo || 
                                    banner.influenceDisplayMerchandising || banner.influenceDigital || 
                                    banner.influenceEcommerce || banner.influenceInStoreEvents || 
                                    banner.influenceShrinkManagement || banner.influenceBuyingPOOwnership) && (
                                    <>
                                      <Separator />
                                      <div>
                                        <h5 className="font-semibold mb-3">Level of Influence</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {banner.influenceAssortmentShelf && <InfoItem label="Assortment/Shelf" value={banner.influenceAssortmentShelf} />}
                                          {banner.influencePricePromo && <InfoItem label="Price/Promo" value={banner.influencePricePromo} />}
                                          {banner.influenceDisplayMerchandising && <InfoItem label="Display/Merchandising" value={banner.influenceDisplayMerchandising} />}
                                          {banner.influenceDigital && <InfoItem label="Digital" value={banner.influenceDigital} />}
                                          {banner.influenceEcommerce && <InfoItem label="E-commerce" value={banner.influenceEcommerce} />}
                                          {banner.influenceInStoreEvents && <InfoItem label="In-Store Events" value={banner.influenceInStoreEvents} />}
                                          {banner.influenceShrinkManagement && <InfoItem label="Shrink Management" value={banner.influenceShrinkManagement} />}
                                          {banner.influenceBuyingPOOwnership && <InfoItem label="Buying/PO Ownership" value={banner.influenceBuyingPOOwnership} />}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {/* Strategy Fields */}
                                  {(banner.categoryCaptain || banner.categoryAdvisor || banner.pricingStrategy || 
                                    banner.privateLabel || banner.innovationAppetite || banner.displayMandates || 
                                    banner.ecommerceMaturityLevel) && (
                                    <>
                                      <Separator />
                                      <div>
                                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                                          <Target className="w-4 h-4" />
                                          Strategy
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {banner.categoryCaptain && <InfoItem label="Category Captain" value={banner.categoryCaptain} />}
                                          {banner.categoryAdvisor && <InfoItem label="Category Advisor" value={banner.categoryAdvisor} />}
                                          {banner.pricingStrategy && <InfoItem label="Pricing Strategy" value={banner.pricingStrategy} />}
                                          {banner.privateLabel && <InfoItem label="Private Label" value={banner.privateLabel} />}
                                          {banner.innovationAppetite && <InfoItem label="Innovation Appetite" value={banner.innovationAppetite} />}
                                          {banner.displayMandates && <InfoItem label="Display Mandates" value={banner.displayMandates} />}
                                          {banner.ecommerceMaturityLevel && <InfoItem label="E-commerce Maturity" value={banner.ecommerceMaturityLevel} />}
                                          {banner.ecommerceSalesPercentage && <InfoItem label="% of Sales from E-Commerce" value={`${banner.ecommerceSalesPercentage}%`} />}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {/* JBP Information */}
                                  {(banner.isJBP || banner.lastJBPDate || banner.nextJBPDate) && (
                                    <>
                                      <Separator />
                                      <div>
                                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                                          <Calendar className="w-4 h-4" />
                                          JBP Information
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">JBP Customer</label>
                                            <p className="text-sm mt-1">{banner.isJBP ? 'Yes' : 'No'}</p>
                                          </div>
                                          {banner.lastJBPDate && <InfoItem label="Last JBP Date" value={banner.lastJBPDate} />}
                                          {banner.nextJBPDate && <InfoItem label="Next JBP Date" value={banner.nextJBPDate} />}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {/* Fulfillment & E-commerce */}
                                  {(banner.fulfillmentTypes && banner.fulfillmentTypes.length > 0) && (
                                    <>
                                      <Separator />
                                      <div>
                                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                                          <Truck className="w-4 h-4" />
                                          Fulfillment & E-commerce
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Fulfillment Types</label>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {banner.fulfillmentTypes.map((type, idx) => (
                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                  {type}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                          {banner.ecommercePartners && banner.ecommercePartners.length > 0 && (
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">E-commerce Partners</label>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {banner.ecommercePartners.map((partner, idx) => (
                                                  <Badge key={idx} variant="secondary" className="text-xs">
                                                    {partner}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {/* Planogram Information */}
                                  {(banner.hasPlanograms || banner.planogramWrittenBy) && (
                                    <>
                                      <Separator />
                                      <div>
                                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                                          <Package className="w-4 h-4" />
                                          Planogram
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Has Planogram</label>
                                            <p className="text-sm mt-1">{banner.hasPlanograms ? 'Yes' : 'No'}</p>
                                          </div>
                                          {banner.planogramWrittenBy && <InfoItem label="Written By" value={banner.planogramWrittenBy} />}
                                          {banner.resetFrequency && <InfoItem label="Reset Frequency" value={banner.resetFrequency} />}
                                          {banner.resetWindowLeadTime && <InfoItem label="Reset Window Lead Time" value={banner.resetWindowLeadTime} />}
                                          {banner.affectedCategories && banner.affectedCategories.length > 0 && (
                                            <div className="md:col-span-2">
                                              <label className="text-sm font-medium text-gray-600">Affected Categories</label>
                                              <p className="text-sm mt-1">{banner.affectedCategories.join(', ')}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {/* Strategic Information */}
                                  {(banner.strategicPriorities || banner.keyCompetitors || banner.designatedCharities) && (
                                    <>
                                      <Separator />
                                      <div>
                                        <h5 className="font-semibold mb-3">Strategic Information</h5>
                                        <div className="space-y-3">
                                          {banner.strategicPriorities && (
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">Strategic Priorities</label>
                                              <p className="text-sm mt-1 whitespace-pre-wrap">{banner.strategicPriorities}</p>
                                            </div>
                                          )}
                                          {banner.keyCompetitors && (
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">Key Competitors</label>
                                              <p className="text-sm mt-1 whitespace-pre-wrap">{banner.keyCompetitors}</p>
                                            </div>
                                          )}
                                          {banner.designatedCharities && (
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">Designated Charities</label>
                                              <p className="text-sm mt-1 whitespace-pre-wrap">{banner.designatedCharities}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {/* Customer Events */}
                                  {banner.customerEvents && banner.customerEvents.length > 0 && (
                                    <>
                                      <Separator />
                                      <div>
                                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                                          <Calendar className="w-4 h-4" />
                                          Customer Events
                                        </h5>
                                        <div className="space-y-2">
                                          {banner.customerEvents.map((event, idx) => (
                                            <div key={idx} className="p-2 bg-gray-50 rounded border">
                                              <p className="text-sm font-medium">{event.title}</p>
                                              <p className="text-xs text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Important Dates (Customer Events) */}
            <AccordionItem value="events">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Important Dates ({customerEvents.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Events</CardTitle>
                      <Button size="sm" onClick={() => setIsAddEventDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Event
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[350px] pr-4">
                      <div className="space-y-3">
                        {customerEvents.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-sm mb-4">No important dates added yet</p>
                            <Button size="sm" onClick={() => setIsAddEventDialogOpen(true)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add First Event
                            </Button>
                          </div>
                        ) : (
                          customerEvents.map((event) => {
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
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Account Tasks */}
            <AccordionItem value="tasks">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  Account Tasks ({accountTasks.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-3">
                        {accountTasks.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No tasks for this account</p>
                          </div>
                        ) : (
                          accountTasks.map(task => {
                            const daysUntil = getDaysUntilDue(task.dueDate);
                            
                            return (
                              <Card key={task.id} className="p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium">{task.title}</h4>
                                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                                        {task.priority}
                                      </Badge>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                        {task.status.replace('-', ' ')}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {task.status === 'overdue' ? `${Math.abs(daysUntil)} days overdue` : 
                                         daysUntil === 0 ? 'Due today' :
                                         daysUntil === 1 ? 'Due tomorrow' :
                                         daysUntil > 0 ? `Due in ${daysUntil} days` :
                                         'Past due'}
                                      </span>
                                      <span>Assigned to: {task.assignedTo}</span>
                                      {task.estimatedHours && (
                                        <span>{task.estimatedHours}h estimated</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Contacts Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Contacts ({contacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[800px] pr-4">
                <div className="space-y-3">
                  {contacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">No contacts yet for {account.accountName}</p>
                    </div>
                  ) : (
                    contacts.map((contact, index) => {
                      const preferredContactInfo = getPreferredContactInfo(contact);
                      
                      return (
                        <div key={contact.id}>
                          <Card 
                            className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => onViewContact(contact)}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-sm">
                                      {contact.firstName} {contact.lastName}
                                    </h3>
                                  </div>
                                  {contact.title && (
                                    <p className="text-xs text-gray-600">{contact.title}</p>
                                  )}
                                  {contact.contactType && (
                                    <Badge variant={contact.contactType === 'Primary' ? 'default' : 'secondary'} className="text-xs mt-1">
                                      {contact.contactType}
                                    </Badge>
                                  )}
                                </div>
                                {contact.relationshipStatus && (
                                  <Badge 
                                    className="text-xs text-white"
                                    style={{ backgroundColor: getSupportStyleColor(contact.relationshipStatus) }}
                                  >
                                    {getSupportStyleLabel(contact.relationshipStatus)}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="space-y-1">
                                {/* Display preferred contact method */}
                                {preferredContactInfo && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <a 
                                      href={preferredContactInfo.href}
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      <preferredContactInfo.icon className="w-3 h-3" />
                                      <span className="truncate">{preferredContactInfo.value}</span>
                                    </a>
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      {preferredContactInfo.label}
                                    </Badge>
                                  </div>
                                )}
                                
                                {/* Show "Not specified" if no preferred contact method data available */}
                                {!preferredContactInfo && (
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Mail className="w-3 h-3" />
                                    <span>Contact method not specified</span>
                                  </div>
                                )}
                                
                                {/* Preferred Shipping Address Display */}
                                {contact.preferredShippingAddress && (
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">Ship to: {contact.preferredShippingAddress}</span>
                                  </div>
                                )}
                                
                                {/* Birthday Display */}
                                {contact.birthday && (
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Calendar className="w-3 h-3" />
                                    <span>Birthday: {formatBirthday(contact.birthday)}</span>
                                  </div>
                                )}
                                
                                {contact.influence && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Badge variant="outline" className="text-xs">
                                      {contact.influence}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                          {index < contacts.length - 1 && <Separator className="my-2" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Important Date</DialogTitle>
            <DialogDescription>
              Add a new important date for {account.accountName}. You can optionally enable alerts to be notified before the event.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Event Title *</Label>
              <Input
                id="event-title"
                placeholder="e.g., Annual Review Meeting, Contract Renewal"
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