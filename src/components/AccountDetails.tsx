import React, { useState } from 'react';
import { Building2, Users, Edit, Trash2, Plus, Phone, Mail, Calendar, CheckSquare, User, Printer, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Account, Contact } from '@/types/crm';
import type { Task } from '@/types/crm-advanced';

interface AccountDetailsProps {
  account: Account;
  contacts: Contact[];
  onBack: () => void;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
  onAddContact: (accountId: string) => void;
  onViewContact: (contact: Contact) => void;
}

export default function AccountDetails({ 
  account, 
  contacts, 
  onBack, 
  onEdit, 
  onDelete, 
  onAddContact, 
  onViewContact 
}: AccountDetailsProps) {
  // Get primary contact for this account
  const primaryContact = account.primaryContactId 
    ? contacts.find(c => c.id === account.primaryContactId)
    : contacts.find(c => c.contactType === 'Primary');

  // Find the relationship owner - look for any contact with a relationship owner set
  const relationshipOwnerContact = contacts.find(c => c.relationshipOwner?.name);
  const relationshipOwnerName = relationshipOwnerContact?.relationshipOwner?.name || 'Mora Ambrey';

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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Account Information - ${account.accountName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              border-bottom: 2px solid #e5e7eb; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .company-name { 
              font-size: 28px; 
              font-weight: bold; 
              color: #1f2937;
              margin-bottom: 5px;
            }
            .parent-company {
              color: #6b7280;
              font-size: 16px;
            }
            .ticker {
              display: inline-block;
              background: #f3f4f6;
              border: 1px solid #d1d5db;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              margin-left: 10px;
            }
            .section { 
              margin-bottom: 30px; 
            }
            .section-title { 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 15px;
              color: #374151;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 15px; 
            }
            .info-item { 
              margin-bottom: 10px; 
            }
            .info-label { 
              font-weight: bold; 
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 2px;
            }
            .info-value { 
              font-size: 16px;
              color: #1f2937;
            }
            .contact-item {
              border: 1px solid #e5e7eb;
              padding: 15px;
              margin-bottom: 10px;
              border-radius: 6px;
              background: #f9fafb;
            }
            .contact-name {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 5px;
            }
            .contact-title {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 5px;
            }
            .contact-type {
              background: #dbeafe;
              color: #1e40af;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 12px;
              display: inline-block;
              margin-bottom: 5px;
            }
            .contact-type.secondary {
              background: #f3f4f6;
              color: #6b7280;
            }
            .contact-details {
              font-size: 14px;
              color: #4b5563;
            }
            .task-item {
              border: 1px solid #e5e7eb;
              padding: 15px;
              margin-bottom: 10px;
              border-radius: 6px;
              background: #f9fafb;
            }
            .task-title {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 5px;
            }
            .task-description {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 8px;
            }
            .task-meta {
              font-size: 12px;
              color: #6b7280;
            }
            .priority {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: bold;
              margin-right: 8px;
            }
            .priority.critical { background: #fee2e2; color: #dc2626; }
            .priority.high { background: #fef3c7; color: #d97706; }
            .priority.medium { background: #dbeafe; color: #2563eb; }
            .priority.low { background: #f3f4f6; color: #6b7280; }
            .status {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: bold;
            }
            .status.completed { background: #dcfce7; color: #16a34a; }
            .status.in-progress { background: #dbeafe; color: #2563eb; }
            .status.pending { background: #fef3c7; color: #d97706; }
            .status.overdue { background: #fee2e2; color: #dc2626; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">
              ${account.accountName}
              ${account.publiclyTraded && account.tickerSymbol ? `<span class="ticker">${account.tickerSymbol}</span>` : ''}
            </div>
            ${account.parentCompany ? `<div class="parent-company">Part of ${account.parentCompany}</div>` : ''}
          </div>

          <div class="section">
            <div class="section-title">Account Information</div>
            <div class="info-grid">
              ${account.address ? `
                <div class="info-item">
                  <div class="info-label">HQ Address</div>
                  <div class="info-value">${account.address}</div>
                </div>
              ` : ''}
              ${account.website ? `
                <div class="info-item">
                  <div class="info-label">Website</div>
                  <div class="info-value">${account.website}</div>
                </div>
              ` : ''}
              ${account.phone ? `
                <div class="info-item">
                  <div class="info-label">Phone</div>
                  <div class="info-value">${account.phone}</div>
                </div>
              ` : ''}
              ${account.email ? `
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">${account.email}</div>
                </div>
              ` : ''}
              ${account.channel ? `
                <div class="info-item">
                  <div class="info-label">Channel</div>
                  <div class="info-value">${account.channel}</div>
                </div>
              ` : ''}
              ${account.footprint ? `
                <div class="info-item">
                  <div class="info-label">Footprint</div>
                  <div class="info-value">${account.footprint}</div>
                </div>
              ` : ''}
              <div class="info-item">
                <div class="info-label">Account Owner</div>
                <div class="info-value">${primaryContact ? `${primaryContact.firstName} ${primaryContact.lastName}` : (account.accountOwner || 'Not assigned')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Relationship Owner</div>
                <div class="info-value">${relationshipOwnerName}</div>
              </div>
              ${account.vp ? `
                <div class="info-item">
                  <div class="info-label">VP</div>
                  <div class="info-value">${account.vp}</div>
                </div>
              ` : ''}
              ${account.revenue ? `
                <div class="info-item">
                  <div class="info-label">Revenue</div>
                  <div class="info-value">$${account.revenue.toLocaleString()}</div>
                </div>
              ` : ''}
              <div class="info-item">
                <div class="info-label">Created</div>
                <div class="info-value">${new Date(account.createdAt).toLocaleDateString()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Last Modified</div>
                <div class="info-value">${new Date(account.lastModified).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          ${contacts.length > 0 ? `
            <div class="section">
              <div class="section-title">Contacts (${contacts.length})</div>
              ${contacts.map(contact => `
                <div class="contact-item">
                  <div class="contact-name">${contact.firstName} ${contact.lastName}</div>
                  ${contact.title ? `<div class="contact-title">${contact.title}</div>` : ''}
                  <div class="contact-type ${contact.contactType === 'Primary' ? 'primary' : 'secondary'}">${contact.contactType}</div>
                  <div class="contact-details">
                    ${contact.email ? `<div>📧 ${contact.email}</div>` : ''}
                    ${contact.phone || contact.officePhone ? `<div>📞 ${contact.phone || contact.officePhone}</div>` : ''}
                    ${contact.influence ? `<div>Influence: ${contact.influence}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${accountTasks.length > 0 ? `
            <div class="section">
              <div class="section-title">Account Tasks (${accountTasks.length})</div>
              ${accountTasks.map(task => `
                <div class="task-item">
                  <div class="task-title">${task.title}</div>
                  <div class="task-description">${task.description}</div>
                  <div class="task-meta">
                    <span class="priority ${task.priority}">${task.priority}</span>
                    <span class="status ${task.status}">${task.status.replace('-', ' ')}</span>
                    <span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
                    <span>Assigned to: ${task.assignedTo}</span>
                    ${task.estimatedHours ? `<span>${task.estimatedHours}h estimated</span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            Generated on ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
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
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={() => onEdit(account)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Account
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
        {/* Account Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {account.address && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      HQ Address
                    </label>
                    <p className="text-lg mt-1">{account.address}</p>
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
                      className="text-lg text-blue-600 hover:underline mt-1 block"
                    >
                      {account.website}
                    </a>
                  </div>
                )}
                {account.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <p className="text-lg mt-1">{account.phone}</p>
                  </div>
                )}
                {account.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <a 
                      href={`mailto:${account.email}`}
                      className="text-lg text-blue-600 hover:underline mt-1 block"
                    >
                      {account.email}
                    </a>
                  </div>
                )}
                {account.channel && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Channel</label>
                    <p className="text-lg mt-1">{account.channel}</p>
                  </div>
                )}
                {account.footprint && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Footprint</label>
                    <p className="text-lg mt-1">{account.footprint}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Owner</label>
                  <p className="text-lg mt-1">
                    {primaryContact 
                      ? `${primaryContact.firstName} ${primaryContact.lastName}` 
                      : (account.accountOwner || 'Not assigned')
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Relationship Owner</label>
                  <p className="text-lg mt-1">
                    {relationshipOwnerName}
                  </p>
                </div>
                {account.vp && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">VP</label>
                    <p className="text-lg mt-1">{account.vp}</p>
                  </div>
                )}
                {account.revenue && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Revenue</label>
                    <p className="text-lg mt-1">${account.revenue.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-lg mt-1">{new Date(account.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Modified</label>
                  <p className="text-lg mt-1">{new Date(account.lastModified).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Account Tasks ({accountTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
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
              <ScrollArea className="h-[500px] pr-4">
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
    </div>
  );
}