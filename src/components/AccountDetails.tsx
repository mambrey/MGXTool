import React, { useState } from 'react';
import { Building2, Users, Edit, Trash2, Plus, Phone, Mail, Calendar, CheckSquare, User, Printer, MapPin, Globe, X, ChevronDown, ChevronUp, DollarSign, TrendingUp, Package, FileText, Target, Briefcase, ShoppingCart, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Account, Contact, CustomerEvent } from '@/types/crm';
import type { Task } from '@/types/crm-advanced';

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
  const relationshipOwnerName = relationshipOwnerContact?.relationshipOwner?.name || 'Mora Ambrey';

  // Customer Events state
  const [customerEvents, setCustomerEvents] = useState<CustomerEvent[]>(account.customerEvents || []);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
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

    const newEvent: CustomerEvent = {
      id: Date.now().toString(),
      title: newEventTitle.trim(),
      date: newEventDate
    };

    const updatedEvents = [...customerEvents, newEvent];
    setCustomerEvents(updatedEvents);

    // Update the account with new events
    const updatedAccount = {
      ...account,
      customerEvents: updatedEvents,
      lastModified: new Date().toISOString()
    };

    if (onUpdateAccount) {
      onUpdateAccount(updatedAccount);
    }

    // Reset form and close dialog
    setNewEventTitle('');
    setNewEventDate('');
    setIsAddEventDialogOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = customerEvents.filter(e => e.id !== eventId);
      setCustomerEvents(updatedEvents);

      // Update the account with new events
      const updatedAccount = {
        ...account,
        customerEvents: updatedEvents,
        lastModified: new Date().toISOString()
      };

      if (onUpdateAccount) {
        onUpdateAccount(updatedAccount);
      }
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

  const InfoItem = ({ label, value, icon: Icon }: { label: string; value: string | number | undefined; icon?: any }) => {
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
          <Accordion type="multiple" defaultValue={expandAll ? ['overview', 'market', 'headquarters', 'strategy', 'strategic-info', 'events', 'tasks'] : ['overview']} value={expandAll ? ['overview', 'market', 'headquarters', 'strategy', 'strategic-info', 'events', 'tasks'] : undefined}>
            
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem label="Account Name" value={account.accountName} icon={Building2} />
                      <InfoItem label="Parent Company" value={account.parentCompany} />
                      <InfoItem label="Ticker Symbol" value={account.tickerSymbol} />
                      <InfoItem label="Publicly Traded" value={account.publiclyTraded ? 'Yes' : 'No'} />
                      <InfoItem label="Channel" value={account.channel} />
                      <InfoItem label="Sub-Channel" value={account.subChannel} />
                      <InfoItem label="Footprint" value={account.footprint} />
                      <InfoItem label="Operating States" value={account.operatingStates} />
                      <InfoItem label="Spirits Outlets" value={account.spiritsOutlets} />
                      <InfoItem label="HQ Influence" value={account.hqInfluence} />
                      <InfoItem label="Display Mandates" value={account.displayMandates} />
                      <InfoItem label="Primary Contact" value={primaryContact ? `${primaryContact.firstName} ${primaryContact.lastName}` : account.accountOwner} icon={User} />
                      <InfoItem label="Relationship Owner" value={relationshipOwnerName} icon={User} />
                      <InfoItem label="VP" value={account.vp} />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Market Snapshot */}
            <AccordionItem value="market">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Market Snapshot
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem label="Current Price" value={account.currentPrice ? `$${account.currentPrice}` : undefined} icon={DollarSign} />
                      <InfoItem label="Percent Change" value={account.percentChange ? `${account.percentChange}%` : undefined} />
                      <InfoItem label="Market Cap" value={account.marketCap} />
                      <InfoItem label="High Price" value={account.highPrice ? `$${account.highPrice}` : undefined} />
                      <InfoItem label="Low Price" value={account.lowPrice ? `$${account.lowPrice}` : undefined} />
                      <InfoItem label="Open Price" value={account.openPrice ? `$${account.openPrice}` : undefined} />
                      <InfoItem label="Previous Close" value={account.previousClose ? `$${account.previousClose}` : undefined} />
                      <InfoItem label="Annual Sales" value={account.annualSales} />
                      <InfoItem label="Revenue" value={account.revenue ? `$${account.revenue.toLocaleString()}` : undefined} />
                      <InfoItem label="Dividend Yield" value={account.dividendYield ? `${account.dividendYield}%` : undefined} />
                      <InfoItem label="52-Week High" value={account.fiftyTwoWeekHigh ? `$${account.fiftyTwoWeekHigh}` : undefined} />
                      <InfoItem label="52-Week Low" value={account.fiftyTwoWeekLow ? `$${account.fiftyTwoWeekLow}` : undefined} />
                      <InfoItem label="PEG Ratio" value={account.pegRatio} />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Headquarters */}
            <AccordionItem value="headquarters">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Headquarters
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {account.address && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            HQ Address
                          </label>
                          <p className="text-base mt-1">{account.address}</p>
                          {account.address && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(account.address || '')}`, '_blank')}
                            >
                              <MapPin className="w-4 h-4 mr-2" />
                              View on Map
                            </Button>
                          )}
                        </div>
                      )}
                      {account.website && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Website
                          </label>
                          <a 
                            href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-blue-600 hover:underline mt-1 block"
                          >
                            {account.website}
                          </a>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => window.open(account.website?.startsWith('http') ? account.website : `https://${account.website}`, '_blank')}
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            Visit Website
                          </Button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem label="Phone" value={account.phone} icon={Phone} />
                        <InfoItem label="Email" value={account.email} icon={Mail} />
                        <InfoItem label="Total Buying Offices" value={account.totalBuyingOffices} />
                      </div>
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
                      {/* Planograms */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Planograms
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Planograms" value={account.planograms} />
                          <InfoItem label="Written By" value={account.planogramWrittenBy} />
                        </div>
                      </div>

                      <Separator />

                      {/* Reset Windows */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Reset Windows
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Q1 Reset Window" value={account.resetWindowQ1} />
                          <InfoItem label="Q2 Reset Window" value={account.resetWindowQ2} />
                          <InfoItem label="Q3 Reset Window" value={account.resetWindowQ3} />
                          <InfoItem label="Q4 Reset Window" value={account.resetWindowQ4} />
                          <InfoItem label="Spring Reset" value={account.resetWindowSpring} />
                          <InfoItem label="Summer Reset" value={account.resetWindowSummer} />
                          <InfoItem label="Fall Reset" value={account.resetWindowFall} />
                          <InfoItem label="Winter Reset" value={account.resetWindowWinter} />
                        </div>
                      </div>

                      <Separator />

                      {/* Business Strategy */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Business Strategy
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Category Captain/Advisor" value={account.categoryCaptainAdvisor} />
                          <InfoItem label="JBP Status" value={account.jbpStatus} />
                          <InfoItem label="JBP Date" value={account.jbpDate} />
                          <InfoItem label="Pricing Strategy" value={account.pricingStrategy} />
                          <InfoItem label="Private Label" value={account.privateLabel} />
                          <InfoItem label="Innovation Appetite" value={account.innovationAppetite} />
                        </div>
                      </div>

                      <Separator />

                      {/* E-commerce & Fulfillment */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          E-commerce & Fulfillment
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="E-commerce" value={account.ecommerce} />
                          <InfoItem label="Fulfillment Types" value={account.fulfillmentTypes} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Strategic Information */}
            <AccordionItem value="strategic-info">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Strategic Information
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {account.strategicPriorities && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Strategic Priorities</label>
                          <p className="text-base mt-1 whitespace-pre-wrap">{account.strategicPriorities}</p>
                        </div>
                      )}
                      {account.keyCompetitors && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Key Competitors</label>
                          <p className="text-base mt-1 whitespace-pre-wrap">{account.keyCompetitors}</p>
                        </div>
                      )}
                      {!account.strategicPriorities && !account.keyCompetitors && (
                        <p className="text-gray-500 text-sm">No strategic information available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Customer Events */}
            <AccordionItem value="events">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Customer Events ({customerEvents.length})
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
                    <ScrollArea className="h-[250px] pr-4">
                      <div className="space-y-3">
                        {customerEvents.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-sm mb-4">No customer events added yet</p>
                            <Button size="sm" onClick={() => setIsAddEventDialogOpen(true)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add First Event
                            </Button>
                          </div>
                        ) : (
                          customerEvents.map((event) => (
                            <Card key={event.id} className="p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <h4 className="font-medium mb-1">{event.title}</h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(event.date).toLocaleDateString()}</span>
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
                            </Card>
                          ))
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  All Contacts ({contacts.length})
                </CardTitle>
                <Button size="sm" onClick={() => onAddContact(account.id)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[800px] pr-4">
                <div className="space-y-3">
                  {contacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm mb-4">No contacts yet for {account.accountName}</p>
                      <Button size="sm" onClick={() => onAddContact(account.id)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Contact
                      </Button>
                    </div>
                  ) : (
                    contacts.map((contact, index) => (
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
                                  variant={
                                    contact.relationshipStatus === 'Excellent' ? 'default' :
                                    contact.relationshipStatus === 'Good' ? 'secondary' :
                                    contact.relationshipStatus === 'Neutral' ? 'outline' :
                                    'destructive'
                                  }
                                  className="text-xs"
                                >
                                  {contact.relationshipStatus}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              {contact.email && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate">{contact.email}</span>
                                </div>
                              )}
                              {(contact.phone || contact.officePhone) && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Phone className="w-3 h-3" />
                                  <span>{contact.phone || contact.officePhone}</span>
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
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Customer Event</DialogTitle>
            <DialogDescription>
              Add a new event for {account.accountName}. Events will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Event Title *</Label>
              <Input
                id="event-title"
                placeholder="e.g., Annual Review Meeting"
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
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