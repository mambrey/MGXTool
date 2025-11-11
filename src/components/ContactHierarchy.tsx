import React, { useState, useEffect } from 'react';
import { Users, Building, Plus, Star, TrendingUp, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import type { Contact, Account } from '@/types/crm';

interface ContactHierarchyProps {
  contacts: Contact[];
  accounts: Account[];
  onBack: () => void;
  onAddContact: () => void;
  onViewContact: (contact: Contact) => void;
}

interface HierarchyNode {
  contact: Contact;
  children: HierarchyNode[];
  level: number;
}

export default function ContactHierarchy({ contacts, accounts, onBack, onAddContact, onViewContact }: ContactHierarchyProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  // Build reporting hierarchy tree based on managerId
  const buildReportingHierarchy = (accountId: string): HierarchyNode[] => {
    const accountContacts = contacts.filter(c => c.accountId === accountId);
    
    // Find root nodes (contacts without a manager - top executives)
    const rootContacts = accountContacts.filter(c => !c.managerId);
    
    const buildNode = (contact: Contact, level: number = 0): HierarchyNode => {
      // Find all direct reports
      const directReports = accountContacts.filter(c => c.managerId === contact.id);
      
      return {
        contact,
        children: directReports.map(report => buildNode(report, level + 1)),
        level
      };
    };
    
    return rootContacts.map(contact => buildNode(contact));
  };

  const getInfluenceBadgeColor = (influence?: string) => {
    switch (influence) {
      case 'Decision Maker': return 'default';
      case 'Influencer': return 'secondary';
      case 'User': return 'outline';
      case 'Gatekeeper': return 'destructive';
      default: return 'outline';
    }
  };

  const renderOrgChartNode = (node: HierarchyNode, isLast: boolean = false) => {
    const isInfluencer = node.contact.isInfluencer;
    const isPrimary = node.contact.contactType === 'Primary';
    const hasChildren = node.children.length > 0;
    
    return (
      <div key={node.contact.id} className="flex flex-col items-center">
        {/* Contact Card */}
        <div className="relative">
          <Card 
            className={`w-64 transition-all hover:shadow-xl cursor-pointer ${ 
              isInfluencer 
                ? 'border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100 shadow-amber-200 shadow-md' 
                : isPrimary 
                ? 'border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100' 
                : 'bg-white hover:border-gray-400'
            }`}
            onClick={() => onViewContact(node.contact)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                {/* Name and Badges */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-base leading-tight">
                    {node.contact.firstName} {node.contact.lastName}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1">
                    {isInfluencer && (
                      <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        Key Influencer
                      </Badge>
                    )}
                    
                    {isPrimary && (
                      <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600 text-xs">
                        Primary
                      </Badge>
                    )}
                    
                    {node.contact.influence && (
                      <Badge variant={getInfluenceBadgeColor(node.contact.influence)} className="text-xs">
                        {node.contact.influence}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Title */}
                {node.contact.title && (
                  <p className="text-sm font-medium text-gray-700 leading-tight">
                    {node.contact.title}
                  </p>
                )}
                
                {/* Contact Info */}
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="truncate">{node.contact.email}</p>
                  {node.contact.officePhone && (
                    <p>{node.contact.officePhone}</p>
                  )}
                </div>
                
                {/* Direct Reports Count */}
                {hasChildren && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 font-medium pt-1 border-t">
                    <TrendingUp className="w-3 h-3" />
                    <span>{node.children.length} Direct Report{node.children.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Influencer Glow Effect */}
          {isInfluencer && (
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg blur opacity-20 -z-10"></div>
          )}
        </div>
        
        {/* Vertical Connector Line to Children */}
        {hasChildren && (
          <div className="w-0.5 h-8 bg-gray-400"></div>
        )}
        
        {/* Children Container */}
        {hasChildren && (
          <div className="relative">
            {/* Horizontal Line */}
            {node.children.length > 1 && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-400" style={{
                left: '50%',
                right: '50%',
                transform: 'translateX(-50%)',
                width: `${(node.children.length - 1) * 320}px`
              }}></div>
            )}
            
            {/* Children Grid */}
            <div className="flex gap-8 pt-8">
              {node.children.map((child, index) => (
                <div key={child.contact.id} className="relative flex flex-col items-center">
                  {/* Vertical connector from horizontal line to child */}
                  <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-gray-400"></div>
                  {renderOrgChartNode(child, index === node.children.length - 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const selectedAccountData = accounts.find(a => a.id === selectedAccount);
  const hierarchyTree = selectedAccount ? buildReportingHierarchy(selectedAccount) : [];
  const accountContacts = contacts.filter(c => c.accountId === selectedAccount);
  const totalContacts = accountContacts.length;
  const influencerCount = accountContacts.filter(c => c.isInfluencer).length;
  const topLevelExecutives = accountContacts.filter(c => !c.managerId).length;
  const maxDepth = hierarchyTree.length > 0 ? Math.max(...hierarchyTree.map(node => {
    const getMaxDepth = (n: HierarchyNode): number => {
      if (n.children.length === 0) return n.level;
      return Math.max(...n.children.map(getMaxDepth));
    };
    return getMaxDepth(node);
  })) : 0;

  // Get account owner from associated contacts
  const getAccountOwner = (account: Account) => {
    const primaryContact = contacts.find(c => 
      c.accountId === account.id && c.contactType === 'Primary'
    );
    return primaryContact 
      ? `${primaryContact.firstName} ${primaryContact.lastName}`
      : account.accountOwner || 'Not assigned';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building className="w-6 h-6" />
            Organizational Chart
          </h2>
          <p className="text-gray-600">Visual reporting hierarchy with key influencers</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
          <Button onClick={onAddContact} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Account Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Select Account:</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedAccountData ? (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-800">
                <p><strong>Selected Account:</strong> {selectedAccountData.accountName || 'N/A'}</p>
                <p><strong>Account Owner:</strong> {getAccountOwner(selectedAccountData)}</p>
                {selectedAccountData.revenue && (
                  <p><strong>Revenue:</strong> ${selectedAccountData.revenue.toLocaleString()}</p>
                )}
              </div>
            </div>
          ) : selectedAccount ? (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-800">
                <p><strong>Error:</strong> Account with ID "{selectedAccount}" not found in accounts list.</p>
                <p><strong>Available Accounts:</strong> {accounts.map(a => a.accountName).join(', ')}</p>
              </div>
            </div>
          ) : (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="text-sm text-gray-600">
                <p>No account selected. Please choose an account from the dropdown above.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold">{totalContacts}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Key Influencers</p>
                <p className="text-2xl font-bold text-amber-600">{influencerCount}</p>
              </div>
              <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top-Level Executives</p>
                <p className="text-2xl font-bold text-purple-600">{topLevelExecutives}</p>
              </div>
              <Building className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hierarchy Depth</p>
                <p className="text-2xl font-bold text-green-600">
                  {maxDepth + 1} Level{maxDepth !== 0 ? 's' : ''}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <span className="font-semibold text-gray-700 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Legend:
            </span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-400 to-amber-600"></div>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Key Influencer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-400 to-blue-600"></div>
              <span>Primary Contact</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-6 bg-gray-400"></div>
              <span>Reports To</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Has Direct Reports</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizational Chart Visualization */}
      <Card className={isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : ''}>
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center justify-between">
            <span>Reporting Structure - {selectedAccountData?.accountName || 'No Account Selected'}</span>
            {isFullscreen && (
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
                <Minimize2 className="w-4 h-4 mr-2" />
                Exit Fullscreen
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className={isFullscreen ? 'flex-1 overflow-hidden' : ''}>
          <ScrollArea className={isFullscreen ? 'h-full' : 'h-[700px]'}>
            <div className="p-8 min-w-max">
              {hierarchyTree.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No contacts found for this account</p>
                  <p className="text-sm mt-2">Add contacts to {selectedAccountData?.accountName || 'this account'} to see the organizational chart</p>
                  <Button className="mt-6" onClick={onAddContact}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center gap-16">
                  {hierarchyTree.map((node, index) => (
                    <div key={node.contact.id}>
                      {renderOrgChartNode(node, index === hierarchyTree.length - 1)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">i</span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-blue-900">
              <p className="font-semibold">How to use the Organizational Chart:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Contacts at the top are executives without managers (top of hierarchy)</li>
                <li>Lines show reporting relationships - who reports to whom</li>
                <li>Key Influencers are highlighted with amber/gold styling and star badges</li>
                <li>Click on any contact card to view their full details</li>
                <li>Hover over cards to see them highlighted</li>
                <li>Use fullscreen mode for better viewing of large organizations</li>
                <li>Scroll horizontally and vertically to explore the entire structure</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}