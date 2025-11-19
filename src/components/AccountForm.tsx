import React, { useState, useEffect } from 'react';
import { Save, X, Building2, TrendingUp, MapPin, Calendar, Package, Target, ShoppingCart, CheckSquare, Square, Crown, Globe, Plus, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import type { Account, Contact } from '@/types/crm';
import { powerAutomateService, type TickerSymbolData } from '@/services/power-automate';
import { useMarketData } from '@/hooks/useMarketData';

interface AccountFormProps {
  account: Account | null;
  contacts?: Contact[];
  onSave: (account: Account) => void;
  onCancel: () => void;
}

interface CustomerEvent {
  id: string;
  title: string;
  date: string;
}

// US States for multi-select
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function AccountForm({ account, contacts = [], onSave, onCancel }: AccountFormProps) {
  const currentTime = new Date().toISOString();
  
  const [formData, setFormData] = useState<Account>(account || {
    id: Date.now().toString(),
    accountName: '',
    parentCompany: '',
    publiclyTraded: false,
    tickerSymbol: '',
    channel: '',
    subChannel: '',
    footprint: '',
    operatingStates: '',
    allSpiritsOutlets: '',
    fullProofOutlets: '',
    hqInfluence: false,
    displayMandates: false,
    currentPrice: '',
    percentChange: '',
    highPrice: '',
    lowPrice: '',
    openPrice: '',
    previousClose: '',
    marketCap: '',
    pegRatio: '',
    annualSales: '',
    dividendYield: '',
    fiftyTwoWeekLow: '',
    fiftyTwoWeekHigh: '',
    percentOfGeneralMarket: '',
    sales52Weeks: '',
    sales12Weeks: '',
    sales4Weeks: '',
    address: '',
    website: '',
    totalBuyingOffices: '',
    hasPlanograms: false,
    planogramWrittenBy: '',
    resetWindows: '',
    categoryCaptain: 'none',
    categoryAdvisor: 'none',
    isJBP: false,
    lastJBPDate: '',
    nextJBPDate: '',
    pricingStrategy: 'none',
    privateLabel: false,
    innovationAppetite: 5,
    hasEcommerce: false,
    fulfillmentTypes: '',
    strategicPriorities: '',
    keyCompetitors: '',
    keyEvents: '',
    customerEvents: [],
    createdAt: account?.createdAt || currentTime,
    lastModified: currentTime,
    accountOwnerName: '',
    primaryContactId: '',
    // Reset window dates
    resetWindowQ1: '',
    resetWindowQ2: '',
    resetWindowQ3: '',
    resetWindowQ4: '',
    resetWindowSpring: '',
    resetWindowSummer: '',
    resetWindowFall: '',
    resetWindowWinter: ''
  });

  // Track the original ticker symbol to detect when a new one is added
  const [originalTickerSymbol, setOriginalTickerSymbol] = useState<string>(account?.tickerSymbol || '');

  // Use the market data hook
  const { marketData, loading, error, fetchMarketData, clearMarketData } = useMarketData();

  // Auto-fetch market data when account is loaded with a ticker symbol
  useEffect(() => {
    if (account?.tickerSymbol && account.tickerSymbol.trim() !== '') {
      console.log('🚀 Auto-fetching market data for ticker:', account.tickerSymbol);
      fetchMarketData(account.tickerSymbol);
    }
  }, [account?.id]); // Only run when account changes (not on every render)

  // Update form fields when market data is received
  useEffect(() => {
    if (marketData) {
      console.log('📊 Updating form with market data:', marketData);
      setFormData(prev => ({
        ...prev,
        currentPrice: marketData.currentPrice.toString(),
        percentChange: marketData.percentChange.toString(),
        marketCap: marketData.marketCap.toString(),
        highPrice: marketData.highPrice.toString(),
        lowPrice: marketData.lowPrice.toString(),
        openPrice: marketData.openPrice.toString(),
        previousClose: marketData.previousClose.toString(),
        annualSales: marketData.annualSales.toString(),
        fiftyTwoWeekLow: marketData.fiftyTwoWeekLow.toString(),
        fiftyTwoWeekHigh: marketData.fiftyTwoWeekHigh.toString(),
      }));
    }
  }, [marketData]);

  // Fix: Handle both string and array types for operatingStates
  const [selectedStates, setSelectedStates] = useState<string[]>(() => {
    if (!formData.operatingStates) return [];
    
    if (Array.isArray(formData.operatingStates)) {
      return formData.operatingStates;
    }
    
    if (typeof formData.operatingStates === 'string') {
      return formData.operatingStates.split(', ').filter(Boolean);
    }
    
    return [];
  });

  const [customerEvents, setCustomerEvents] = useState<CustomerEvent[]>(
    formData.customerEvents || []
  );

  // Filter contacts that could be assigned to this account
  const availableContacts = contacts.filter(contact => 
    !account || contact.accountId === account.id || !contact.accountId
  );

  // Get the currently selected primary contact
  const selectedPrimaryContact = availableContacts.find(contact => 
    contact.id === formData.primaryContactId
  );

  /**
   * Request market data from CSV file
   */
  const handleRefreshMarketData = async () => {
    if (!formData.tickerSymbol || formData.tickerSymbol.trim() === '') {
      alert('Please enter a ticker symbol first');
      return;
    }

    await fetchMarketData(formData.tickerSymbol);
  };

  /**
   * Send ticker symbol data to Power Automate when a new ticker is added
   */
  const sendTickerToPowerAutomate = async (accountData: Account, isNew: boolean) => {
    if (!powerAutomateService.isTickerSymbolWorkflowEnabled()) {
      console.log('Ticker symbol Power Automate workflow not configured');
      return;
    }

    if (!accountData.tickerSymbol || accountData.tickerSymbol.trim() === '') {
      return;
    }

    const action: 'added' | 'updated' = isNew ? 'added' : 'updated';

    const tickerData: TickerSymbolData = {
      accountId: accountData.id,
      accountName: accountData.accountName,
      tickerSymbol: accountData.tickerSymbol,
      publiclyTraded: accountData.publiclyTraded || false,
      parentCompany: accountData.parentCompany,
      industry: accountData.industry,
      accountOwner: accountData.accountOwner,
      currentPrice: accountData.currentPrice,
      percentChange: accountData.percentChange,
      marketCap: accountData.marketCap,
      highPrice: accountData.highPrice,
      lowPrice: accountData.lowPrice,
      openPrice: accountData.openPrice,
      previousClose: accountData.previousClose,
      pegRatio: accountData.pegRatio,
      annualSales: accountData.annualSales,
      dividendYield: accountData.dividendYield,
      fiftyTwoWeekLow: accountData.fiftyTwoWeekLow,
      fiftyTwoWeekHigh: accountData.fiftyTwoWeekHigh,
      timestamp: new Date().toISOString(),
      action: action
    };

    try {
      const success = await powerAutomateService.sendTickerSymbol(tickerData);
      if (success) {
        console.log(`Ticker symbol ${action} sent to Power Automate successfully:`, accountData.tickerSymbol);
      } else {
        console.warn(`Failed to send ticker symbol ${action} to Power Automate`);
      }
    } catch (error) {
      console.error('Error sending ticker symbol to Power Automate:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFormData = {
      ...formData,
      operatingStates: selectedStates,
      customerEvents: customerEvents,
      lastModified: new Date().toISOString(),
      categoryCaptain: formData.categoryCaptain === 'none' ? '' : formData.categoryCaptain,
      categoryAdvisor: formData.categoryAdvisor === 'none' ? '' : formData.categoryAdvisor,
      pricingStrategy: formData.pricingStrategy === 'none' ? '' : formData.pricingStrategy
    };

    const hasNewTickerSymbol = 
      updatedFormData.tickerSymbol && 
      updatedFormData.tickerSymbol.trim() !== '' &&
      originalTickerSymbol.trim() === '' &&
      updatedFormData.tickerSymbol !== originalTickerSymbol;

    if (hasNewTickerSymbol) {
      await sendTickerToPowerAutomate(updatedFormData, true);
    }

    onSave(updatedFormData);
  };

  const updateField = (field: keyof Account, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleState = (state: string) => {
    setSelectedStates(prev => {
      if (prev.includes(state)) {
        return prev.filter(s => s !== state);
      } else {
        return [...prev, state].sort();
      }
    });
  };

  const selectAllStates = () => {
    if (selectedStates.length === US_STATES.length) {
      setSelectedStates([]);
    } else {
      setSelectedStates([...US_STATES]);
    }
  };

  const clearAllStates = () => {
    setSelectedStates([]);
  };

  const addCustomerEvent = () => {
    const newEvent: CustomerEvent = {
      id: Date.now().toString(),
      title: '',
      date: ''
    };
    setCustomerEvents(prev => [...prev, newEvent]);
  };

  const updateCustomerEvent = (id: string, field: 'title' | 'date', value: string) => {
    setCustomerEvents(prev => 
      prev.map(event => 
        event.id === id ? { ...event, [field]: value } : event
      )
    );
  };

  const removeCustomerEvent = (id: string) => {
    setCustomerEvents(prev => prev.filter(event => event.id !== id));
  };

  const openMap = () => {
    if (formData.address) {
      const encodedAddress = encodeURIComponent(formData.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    } else {
      alert('Please enter an address first');
    }
  };

  const openWebsite = () => {
    if (formData.website) {
      let url = formData.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank');
    } else {
      alert('Please enter a website URL first');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const isAllStatesSelected = selectedStates.length === US_STATES.length;
  const isSomeStatesSelected = selectedStates.length > 0 && selectedStates.length < US_STATES.length;

  const willSendToPA = 
    powerAutomateService.isTickerSymbolWorkflowEnabled() && 
    formData.tickerSymbol && 
    formData.tickerSymbol.trim() !== '' &&
    originalTickerSymbol.trim() === '' &&
    formData.tickerSymbol !== originalTickerSymbol;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Timestamp Information */}
      {account && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium text-blue-800">Created</Label>
                <p className="text-blue-700">{formatDate(formData.createdAt)}</p>
              </div>
              <div>
                <Label className="font-medium text-blue-800">Last Modified</Label>
                <p className="text-blue-700">{formatDate(formData.lastModified)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            Customer Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="accountName" className="text-sm font-medium">Account Name *</Label>
            <Input
              id="accountName"
              required
              value={formData.accountName}
              onChange={(e) => updateField('accountName', e.target.value)}
              placeholder="Enter account name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="parentCompany" className="text-sm font-medium">Parent Company</Label>
            <Input
              id="parentCompany"
              value={formData.parentCompany}
              onChange={(e) => updateField('parentCompany', e.target.value)}
              placeholder="Enter parent company"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="tickerSymbol" className="text-sm font-medium">
              Ticker Symbol
              <span className="ml-2 text-xs text-green-600">(Auto-loads from CSV)</span>
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="tickerSymbol"
                value={formData.tickerSymbol}
                onChange={(e) => updateField('tickerSymbol', e.target.value)}
                placeholder="e.g., AAPL"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRefreshMarketData}
                disabled={loading || !formData.tickerSymbol}
                title="Manually refresh market data from CSV file"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {willSendToPA && (
              <p className="text-xs text-green-600 mt-1">
                ✓ New ticker symbol will be sent to Power Automate when saved
              </p>
            )}
            {loading && (
              <p className="text-xs text-blue-600 mt-1">
                🔄 Fetching market data from CSV file...
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ {error}
              </p>
            )}
            {marketData && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Market data auto-loaded: {marketData.name} ({marketData.currency})
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 sm:col-span-2 mt-2">
            <Checkbox
              id="publiclyTraded"
              checked={formData.publiclyTraded}
              onCheckedChange={(checked) => updateField('publiclyTraded', checked as boolean)}
            />
            <Label htmlFor="publiclyTraded" className="text-sm font-medium">Publicly Traded?</Label>
          </div>
          <div>
            <Label htmlFor="channel" className="text-sm font-medium">Channel</Label>
            <Select value={formData.channel} onValueChange={(value) => updateField('channel', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Club">Club</SelectItem>
                <SelectItem value="Convenience">Convenience</SelectItem>
                <SelectItem value="Drug">Drug</SelectItem>
                <SelectItem value="Grocery">Grocery</SelectItem>
                <SelectItem value="Liquor">Liquor</SelectItem>
                <SelectItem value="Mass">Mass</SelectItem>
                <SelectItem value="Military">Military</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="footprint" className="text-sm font-medium">Channel Mapping</Label>
            <Select value={formData.footprint} onValueChange={(value) => updateField('footprint', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select channel mapping" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="State Retailer">State Retailer</SelectItem>
                <SelectItem value="National Retailer">National Retailer</SelectItem>
                <SelectItem value="Multi State Retailer">Multi State Retailer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Primary Contact Selector */}
          <div className="sm:col-span-2">
            <Label htmlFor="primaryContact" className="text-sm font-medium flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              Primary Contact
            </Label>
            <Select 
              value={formData.primaryContactId || 'none'} 
              onValueChange={(value) => updateField('primaryContactId', value === 'none' ? '' : value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select primary contact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No primary contact</SelectItem>
                {availableContacts.map(contact => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName}
                    {contact.title && ` - ${contact.title}`}
                    {contact.contactType === 'Primary' && ' (Currently Primary)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPrimaryContact && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm text-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <strong>Selected Primary Contact:</strong>
                  </div>
                  <p><strong>Name:</strong> {selectedPrimaryContact.firstName} {selectedPrimaryContact.lastName}</p>
                  {selectedPrimaryContact.title && <p><strong>Title:</strong> {selectedPrimaryContact.title}</p>}
                  {selectedPrimaryContact.email && <p><strong>Email:</strong> {selectedPrimaryContact.email}</p>}
                  {selectedPrimaryContact.officePhone && <p><strong>Phone:</strong> {selectedPrimaryContact.officePhone}</p>}
                </div>
              </div>
            )}
            {availableContacts.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                No contacts available. Add contacts after creating the account to select a primary contact.
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Operating States</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllStates}
                  className="flex items-center gap-1 text-xs h-7"
                >
                  {isAllStatesSelected ? (
                    <>
                      <CheckSquare className="w-3 h-3" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="w-3 h-3" />
                      Select All
                    </>
                  )}
                </Button>
                {selectedStates.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllStates}
                    className="flex items-center gap-1 text-xs h-7"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <div className="p-3 border rounded-lg bg-gray-50 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2">
                {US_STATES.map(state => (
                  <div key={state} className="flex items-center space-x-1">
                    <Checkbox
                      id={`state-${state}`}
                      checked={selectedStates.includes(state)}
                      onCheckedChange={() => toggleState(state)}
                    />
                    <Label htmlFor={`state-${state}`} className="text-xs cursor-pointer">
                      {state}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedStates.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700">
                      Selected States ({selectedStates.length}/{US_STATES.length}):
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedStates.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            Market Snapshot
            <span className="ml-auto text-xs text-green-600">Auto-populated from CSV</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Market Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="currentPrice" className="text-sm font-medium">Current Price</Label>
              <Input
                id="currentPrice"
                value={formData.currentPrice}
                onChange={(e) => updateField('currentPrice', e.target.value)}
                placeholder="$0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="percentChange" className="text-sm font-medium">Percent Change (%)</Label>
              <Input
                id="percentChange"
                value={formData.percentChange}
                onChange={(e) => updateField('percentChange', e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="marketCap" className="text-sm font-medium">Market Cap</Label>
              <Input
                id="marketCap"
                value={formData.marketCap}
                onChange={(e) => updateField('marketCap', e.target.value)}
                placeholder="$0.00B"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="highPrice" className="text-sm font-medium">High Price (Day)</Label>
              <Input
                id="highPrice"
                value={formData.highPrice}
                onChange={(e) => updateField('highPrice', e.target.value)}
                placeholder="$0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lowPrice" className="text-sm font-medium">Low Price (Day)</Label>
              <Input
                id="lowPrice"
                value={formData.lowPrice}
                onChange={(e) => updateField('lowPrice', e.target.value)}
                placeholder="$0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="openPrice" className="text-sm font-medium">Open Price</Label>
              <Input
                id="openPrice"
                value={formData.openPrice}
                onChange={(e) => updateField('openPrice', e.target.value)}
                placeholder="$0.00"
                className="mt-1"
              />
            </div>
          </div>

          {/* Financial Data from CSV */}
          <div className="mt-6">
            <Label className="text-sm font-medium mb-3 block text-blue-700">Financial Data from CSV</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="previousClose" className="text-sm font-medium">Previous Close</Label>
                <Input
                  id="previousClose"
                  value={formData.previousClose}
                  onChange={(e) => updateField('previousClose', e.target.value)}
                  placeholder="Auto-populated from CSV"
                  className="mt-1 bg-blue-50"
                />
                <p className="text-xs text-blue-600 mt-1">Fed by CSV</p>
              </div>
              <div>
                <Label htmlFor="annualSales" className="text-sm font-medium">Annual Sales</Label>
                <Input
                  id="annualSales"
                  value={formData.annualSales}
                  onChange={(e) => updateField('annualSales', e.target.value)}
                  placeholder="Auto-populated from CSV"
                  className="mt-1 bg-blue-50"
                />
                <p className="text-xs text-blue-600 mt-1">Fed by CSV</p>
              </div>
              <div>
                <Label htmlFor="fiftyTwoWeekLow" className="text-sm font-medium">52-Week Low</Label>
                <Input
                  id="fiftyTwoWeekLow"
                  value={formData.fiftyTwoWeekLow}
                  onChange={(e) => updateField('fiftyTwoWeekLow', e.target.value)}
                  placeholder="Auto-populated from CSV"
                  className="mt-1 bg-blue-50"
                />
                <p className="text-xs text-blue-600 mt-1">Fed by CSV</p>
              </div>
              <div>
                <Label htmlFor="fiftyTwoWeekHigh" className="text-sm font-medium">52-Week High</Label>
                <Input
                  id="fiftyTwoWeekHigh"
                  value={formData.fiftyTwoWeekHigh}
                  onChange={(e) => updateField('fiftyTwoWeekHigh', e.target.value)}
                  placeholder="Auto-populated from CSV"
                  className="mt-1 bg-blue-50"
                />
                <p className="text-xs text-blue-600 mt-1">Fed by CSV</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Headquarters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            Headquarters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address" className="text-sm font-medium">HQ Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Enter headquarters address"
              rows={3}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website" className="text-sm font-medium">Company Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="Enter company website (e.g., www.company.com)"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="totalBuyingOffices" className="text-sm font-medium">Total Number of Buying Offices</Label>
              <Input
                id="totalBuyingOffices"
                type="number"
                value={formData.totalBuyingOffices}
                onChange={(e) => updateField('totalBuyingOffices', e.target.value)}
                placeholder="Enter number of buying offices"
                className="mt-1"
                min="0"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={openMap}
              className="flex items-center gap-2"
              disabled={!formData.address}
            >
              <MapPin className="w-4 h-4" />
              View on Map
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={openWebsite}
              className="flex items-center gap-2"
              disabled={!formData.website}
            >
              <Globe className="w-4 h-4" />
              Visit Website
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            {formData.address && (
              <p>• Click "View on Map" to open address in Google Maps</p>
            )}
            {formData.website && (
              <p>• Click "Visit Website" to open company website in new tab</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Strategy and Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Target className="w-4 h-4 sm:w-5 sm:h-5" />
            Strategy and Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pricingStrategy" className="text-sm font-medium">Pricing Strategy</Label>
              <Select 
                value={formData.pricingStrategy || 'none'} 
                onValueChange={(value) => updateField('pricingStrategy', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select pricing strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="EDLP">EDLP (Everyday Low Price)</SelectItem>
                  <SelectItem value="Hi-Lo">Hi-Lo</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Competitive">Competitive</SelectItem>
                  <SelectItem value="Value">Value</SelectItem>
                  <SelectItem value="Dynamic">Dynamic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="privateLabel"
                checked={formData.privateLabel}
                onCheckedChange={(checked) => updateField('privateLabel', checked as boolean)}
              />
              <Label htmlFor="privateLabel" className="text-sm font-medium">Private Label</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasEcommerce"
                checked={formData.hasEcommerce}
                onCheckedChange={(checked) => updateField('hasEcommerce', checked as boolean)}
              />
              <Label htmlFor="hasEcommerce" className="text-sm font-medium">Ecommerce Available?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hqInfluence"
                checked={formData.hqInfluence}
                onCheckedChange={(checked) => updateField('hqInfluence', checked as boolean)}
              />
              <Label htmlFor="hqInfluence" className="text-sm font-medium">HQ Influence</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="displayMandates"
                checked={formData.displayMandates}
                onCheckedChange={(checked) => updateField('displayMandates', checked as boolean)}
              />
              <Label htmlFor="displayMandates" className="text-sm font-medium">Display Mandates</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isJBP"
                checked={formData.isJBP}
                onCheckedChange={(checked) => updateField('isJBP', checked as boolean)}
              />
              <Label htmlFor="isJBP" className="text-sm font-medium">JBP Customer?</Label>
            </div>
          </div>

          {formData.isJBP && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <Label htmlFor="lastJBPDate" className="text-sm font-medium">Last JBP</Label>
                <Input
                  id="lastJBPDate"
                  type="date"
                  value={formatDateForInput(formData.lastJBPDate || '')}
                  onChange={(e) => updateField('lastJBPDate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="nextJBPDate" className="text-sm font-medium">Next JBP</Label>
                <Input
                  id="nextJBPDate"
                  type="date"
                  value={formatDateForInput(formData.nextJBPDate || '')}
                  onChange={(e) => updateField('nextJBPDate', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="fulfillmentTypes" className="text-sm font-medium">Available Fulfillment Types</Label>
            <Input
              id="fulfillmentTypes"
              value={formData.fulfillmentTypes}
              onChange={(e) => updateField('fulfillmentTypes', e.target.value)}
              placeholder="e.g., Direct Store Delivery, Warehouse Pickup, Drop Ship"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="allSpiritsOutlets" className="text-sm font-medium"># of All Spirits Outlets</Label>
              <Input
                id="allSpiritsOutlets"
                type="number"
                value={formData.allSpiritsOutlets}
                onChange={(e) => updateField('allSpiritsOutlets', e.target.value)}
                placeholder="Enter number of all spirits outlets"
                className="mt-1"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="fullProofOutlets" className="text-sm font-medium"># of Full Proof Outlets</Label>
              <Input
                id="fullProofOutlets"
                type="number"
                value={formData.fullProofOutlets}
                onChange={(e) => updateField('fullProofOutlets', e.target.value)}
                placeholder="Enter number of full proof outlets"
                className="mt-1"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryCaptain" className="text-sm font-medium">Category Captain</Label>
              <Select 
                value={formData.categoryCaptain || 'none'} 
                onValueChange={(value) => updateField('categoryCaptain', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Category Captain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="categoryAdvisor" className="text-sm font-medium">Category Advisor</Label>
              <Select 
                value={formData.categoryAdvisor || 'none'} 
                onValueChange={(value) => updateField('categoryAdvisor', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Category Advisor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Innovation Appetite: {formData.innovationAppetite}/10</Label>
            <Slider
              value={[formData.innovationAppetite]}
              onValueChange={(value) => updateField('innovationAppetite', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="hasPlanograms"
              checked={formData.hasPlanograms}
              onCheckedChange={(checked) => updateField('hasPlanograms', checked as boolean)}
            />
            <Label htmlFor="hasPlanograms" className="text-sm font-medium">Has Planogram</Label>
          </div>

          <div>
            <Label htmlFor="planogramWrittenBy" className="text-sm font-medium">Written by:</Label>
            <Input
              id="planogramWrittenBy"
              value={formData.planogramWrittenBy || ''}
              onChange={(e) => updateField('planogramWrittenBy', e.target.value)}
              placeholder="Enter author name"
              className="mt-1"
            />
          </div>

          {formData.hasPlanograms && (
            <div className="mt-6">
              <Label className="text-lg font-medium mb-4 block flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Reset Windows
              </Label>
              
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Quarterly Reset Windows</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="resetWindowQ1" className="text-xs font-medium text-gray-600">Q1 Reset</Label>
                    <Input
                      id="resetWindowQ1"
                      type="date"
                      value={formatDateForInput(formData.resetWindowQ1 || '')}
                      onChange={(e) => updateField('resetWindowQ1', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resetWindowQ2" className="text-xs font-medium text-gray-600">Q2 Reset</Label>
                    <Input
                      id="resetWindowQ2"
                      type="date"
                      value={formatDateForInput(formData.resetWindowQ2 || '')}
                      onChange={(e) => updateField('resetWindowQ2', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resetWindowQ3" className="text-xs font-medium text-gray-600">Q3 Reset</Label>
                    <Input
                      id="resetWindowQ3"
                      type="date"
                      value={formatDateForInput(formData.resetWindowQ3 || '')}
                      onChange={(e) => updateField('resetWindowQ3', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resetWindowQ4" className="text-xs font-medium text-gray-600">Q4 Reset</Label>
                    <Input
                      id="resetWindowQ4"
                      type="date"
                      value={formatDateForInput(formData.resetWindowQ4 || '')}
                      onChange={(e) => updateField('resetWindowQ4', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Seasonal Reset Windows</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="resetWindowSpring" className="text-xs font-medium text-gray-600">Spring Reset</Label>
                    <Input
                      id="resetWindowSpring"
                      type="date"
                      value={formatDateForInput(formData.resetWindowSpring || '')}
                      onChange={(e) => updateField('resetWindowSpring', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resetWindowSummer" className="text-xs font-medium text-gray-600">Summer Reset</Label>
                    <Input
                      id="resetWindowSummer"
                      type="date"
                      value={formatDateForInput(formData.resetWindowSummer || '')}
                      onChange={(e) => updateField('resetWindowSummer', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resetWindowFall" className="text-xs font-medium text-gray-600">Fall Reset</Label>
                    <Input
                      id="resetWindowFall"
                      type="date"
                      value={formatDateForInput(formData.resetWindowFall || '')}
                      onChange={(e) => updateField('resetWindowFall', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resetWindowWinter" className="text-xs font-medium text-gray-600">Winter Reset</Label>
                    <Input
                      id="resetWindowWinter"
                      type="date"
                      value={formatDateForInput(formData.resetWindowWinter || '')}
                      onChange={(e) => updateField('resetWindowWinter', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Strategic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="strategicPriorities" className="text-sm font-medium">Customer Strategic Priorities</Label>
            <Textarea
              id="strategicPriorities"
              value={formData.strategicPriorities}
              onChange={(e) => updateField('strategicPriorities', e.target.value)}
              placeholder="Enter strategic priorities"
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="keyCompetitors" className="text-sm font-medium">Key Competitors</Label>
            <Textarea
              id="keyCompetitors"
              value={formData.keyCompetitors}
              onChange={(e) => updateField('keyCompetitors', e.target.value)}
              placeholder="Enter key competitors"
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Key Customer Events
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomerEvent}
                className="flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Event
              </Button>
            </div>
            
            {customerEvents.length === 0 ? (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No customer events added yet</p>
                <p className="text-xs text-gray-400">Click "Add Event" to track important customer milestones</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customerEvents.map((event, index) => (
                  <div key={event.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-medium text-gray-600">Event #{index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomerEvent(event.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`eventTitle-${event.id}`} className="text-xs font-medium text-gray-600">Event Title</Label>
                        <Input
                          id={`eventTitle-${event.id}`}
                          value={event.title}
                          onChange={(e) => updateCustomerEvent(event.id, 'title', e.target.value)}
                          placeholder="e.g., Annual Review Meeting"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`eventDate-${event.id}`} className="text-xs font-medium text-gray-600">Event Date</Label>
                        <Input
                          id={`eventDate-${event.id}`}
                          type="date"
                          value={formatDateForInput(event.date)}
                          onChange={(e) => updateCustomerEvent(event.id, 'date', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
        <Button type="submit" className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <Save className="w-4 h-4" />
          Save Account
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <X className="w-4 h-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}