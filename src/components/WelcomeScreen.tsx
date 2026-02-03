import React, { useState } from 'react';
import { Building2, Users, Database, TrendingUp, BarChart3, Target, ArrowRight, Plus, Eye, Menu, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Account, Contact } from '@/types/crm';
import diageoLogo from '@/assets/diageo-logo.png';

interface WelcomeScreenProps {
  userName: string;
  accounts?: Account[];
  contacts?: Contact[];
  onAddAccount?: () => void;
  onAddContact?: () => void;
  onExploreFeatures?: () => void;
}

export default function WelcomeScreen({ 
  userName, 
  accounts = [], 
  contacts = [],
  onAddAccount,
  onAddContact,
  onExploreFeatures
}: WelcomeScreenProps) {
  const [ownerFilter, setOwnerFilter] = useState<string>('all');

  // Helper functions for KPI calculations
  const isDateUpcoming = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const isDateOverdue = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date < today;
  };

  // Get unique relationship owners from accounts
  const getRelationshipOwners = () => {
    const ownersSet = new Set<string>();
    
    accounts.forEach(account => {
      if (account.accountOwner) {
        ownersSet.add(account.accountOwner);
      }
    });
    
    contacts.forEach(contact => {
      if (contact.relationshipOwner?.name) {
        ownersSet.add(contact.relationshipOwner.name);
      }
    });
    
    return Array.from(ownersSet).sort();
  };

  const relationshipOwners = getRelationshipOwners();

  // Filter accounts by owner
  const filteredAccounts = ownerFilter === 'all' ? accounts : accounts.filter(account => {
    return account.accountOwner === ownerFilter;
  });

  // Filter contacts by owner
  const filteredContacts = ownerFilter === 'all' ? contacts : contacts.filter(contact => {
    // Check if the contact's relationship owner matches
    const contactOwnerMatch = contact.relationshipOwner?.name === ownerFilter;
    // Check if the contact's account owner matches
    const account = accounts.find(acc => acc.id === contact.accountId);
    const accountOwnerMatch = account?.accountOwner === ownerFilter;
    
    return contactOwnerMatch || accountOwnerMatch;
  });

  // Calculate Strategic Accounts KPI - count unique accounts based on relationship owner from contacts
  const strategicAccountsCount = ownerFilter === 'all' 
    ? accounts.length 
    : new Set(
        contacts
          .filter(contact => contact.relationshipOwner?.name === ownerFilter && contact.accountId)
          .map(contact => contact.accountId)
      ).size;

  // Calculate KPIs based on filtered data
  const upcomingBirthdays = filteredContacts.filter(contact => 
    contact.birthday && contact.birthdayAlert && isDateUpcoming(contact.birthday)
  ).length;

  const overdueContacts = filteredContacts.filter(contact => 
    contact.nextContactDate && isDateOverdue(contact.nextContactDate)
  ).length;

  const upcomingContacts = filteredContacts.filter(contact => 
    contact.nextContactDate && contact.nextContactAlert && isDateUpcoming(contact.nextContactDate)
  ).length;

  const totalTasks = upcomingBirthdays + overdueContacts + upcomingContacts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={diageoLogo} 
                  alt="Diageo Logo" 
                  className="h-16 w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  AccountIQ
                </h1>
                <p className="text-gray-600 mt-1">U.S. Strategic Accounts Platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Owner Filter */}
        {relationshipOwners.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 mb-8">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter KPIs by Relationship Owner:</span>
                </div>
                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue placeholder="Select relationship owner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Relationship Owners</SelectItem>
                    {relationshipOwners.map(owner => (
                      <SelectItem key={owner} value={owner}>
                        👤 {owner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {ownerFilter !== 'all' && (
                  <Button variant="outline" size="sm" onClick={() => setOwnerFilter('all')}>
                    Clear Filter
                  </Button>
                )}
              </div>
              {ownerFilter !== 'all' && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Filtering by:</strong> {ownerFilter} - Showing {strategicAccountsCount} unique account{strategicAccountsCount !== 1 ? 's' : ''} and {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} where {ownerFilter} is the relationship owner.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Strategic Accounts</p>
                  <p className="text-3xl font-bold text-gray-900">{strategicAccountsCount}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {ownerFilter === 'all' ? 'Total accounts' : 'Unique accounts'}
                  </p>
                  {ownerFilter !== 'all' && (
                    <p className="text-xs text-blue-600 mt-1">Owned by {ownerFilter}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Key Contacts</p>
                  <p className="text-3xl font-bold text-gray-900">{filteredContacts.length}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {filteredContacts.length === 0 ? 'Build your network' : 'Active contacts'}
                  </p>
                  {ownerFilter !== 'all' && (
                    <p className="text-xs text-blue-600 mt-1">Related to {ownerFilter}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Birthdays</p>
                  <p className="text-3xl font-bold text-purple-600">{upcomingBirthdays}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {upcomingBirthdays === 0 ? 'None this week' : 'This week'}
                  </p>
                  {ownerFilter !== 'all' && (
                    <p className="text-xs text-blue-600 mt-1">For {ownerFilter}'s contacts</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {overdueContacts > 0 ? 'Overdue Connects' : 'Upcoming Connects'}
                  </p>
                  <p className={`text-3xl font-bold ${overdueContacts > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                    {overdueContacts > 0 ? overdueContacts : upcomingContacts}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {overdueContacts > 0 ? 'Need attention' : upcomingContacts === 0 ? 'None this week' : 'This week'}
                  </p>
                  {ownerFilter !== 'all' && (
                    <p className="text-xs text-blue-600 mt-1">For {ownerFilter}'s contacts</p>
                  )}
                </div>
                <div className={`w-12 h-12 ${overdueContacts > 0 ? 'bg-red-100' : 'bg-orange-100'} rounded-xl flex items-center justify-center`}>
                  <Target className={`w-6 h-6 ${overdueContacts > 0 ? 'text-red-600' : 'text-orange-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to AccountIQ {userName}!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 text-lg">
              Built for Strategic Accounts. Designed to scale with how we work.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-900">Account Management</h3>
                <p className="text-sm text-blue-700">Manage strategic accounts and track key metrics</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-900">Contact Relationships</h3>
                <p className="text-sm text-green-700">Build and maintain key stakeholder relationships</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-900">SharePoint Integration</h3>
                <p className="text-sm text-purple-700">Seamless document storage and collaboration</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-900">Analytics & Insights</h3>
                <p className="text-sm text-orange-700">Data-driven decision making tools</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">1. Add Your First Account</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Start by adding your strategic accounts with key information like industry, revenue, and contact details.
                </p>
                <Button size="sm" className="w-full" onClick={onAddAccount}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-green-900 mb-2">2. Build Your Network</h3>
                <p className="text-sm text-green-700 mb-4">
                  Add key contacts, decision makers, and influencers to build strong business relationships.
                </p>
                <Button size="sm" className="w-full" onClick={onAddContact}>
                  <Users className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-purple-900 mb-2">3. Organize Documents</h3>
                <p className="text-sm text-purple-700 mb-4">
                  Upload and organize contracts, proposals, and presentations in SharePoint integration.
                </p>
                <Button size="sm" className="w-full" onClick={onExploreFeatures}>
                  <Database className="w-4 h-4 mr-2" />
                  Explore Features
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}