import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Building2, MapPin, Calendar, Target, CheckSquare, Square, Globe, Plus, Trash2, RefreshCw, Users, Mail, Phone, Briefcase, Image, Building, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useLoadScript } from '@react-google-maps/api';
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

// Fulfillment types for multi-select - UPDATED
const FULFILLMENT_TYPES = [
  'In-Store Pickup (Click & Collect)',
  'Curbside Pickup',
  'Local Delivery (Self-Operated)',
  'Local Delivery (Third Party Partner)',
  'Ship-to-Home (Where Legal)'
];

// E-Commerce Partners for multi-select - NEW
const ECOMMERCE_PARTNERS = [
  'Uber Eats',
  'DoorDash',
  'Instacart',
  'GoPuff'
];

// Google Maps libraries to load
const libraries: ("places")[] = ["places"];

// Google Maps API Key - Replace with your actual API key or use environment variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

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
    displayMandates: 'none',
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
    privateLabel: 'none',
    innovationAppetite: '',
    ecommerceMaturityLevel: 'none',
    ecommerceSalesPercentage: '',
    ecommercePartners: [],
    fulfillmentTypes: [],
    strategicPriorities: '',
    keyCompetitors: '',
    designatedCharities: '',
    keyEvents: '',
    customerEvents: [],
    // Level of Influence fields - default to 'none'
    influenceAssortmentShelf: 'none',
    influencePricePromo: 'none',
    influenceDisplayMerchandising: 'none',
    influenceDigital: 'none',
    influenceEcommerce: 'none',
    influenceInStoreEvents: 'none',
    influenceShrinkManagement: 'none',
    influenceBuyingPOOwnership: 'none',
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

  // Google Maps Autocomplete
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  // Filter contacts for this account
  const accountContacts = account ? contacts.filter(contact => contact.accountId === account.id) : [];

  // Auto-check "Publicly Traded" when ticker symbol is populated
  useEffect(() => {
    if (formData.tickerSymbol && formData.tickerSymbol.trim() !== '') {
      if (!formData.publiclyTraded) {
        setFormData(prev => ({ ...prev, publiclyTraded: true }));
      }
    }
  }, [formData.tickerSymbol]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isLoaded && addressInputRef.current && GOOGLE_MAPS_API_KEY) {
      try {
        autocompleteRef.current = new google.maps.places.Autocomplete(addressInputRef.current, {
          types: ['address'],
          fields: ['formatted_address', 'address_components', 'geometry'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.formatted_address) {
            setFormData(prev => ({ ...prev, address: place.formatted_address || '' }));
          }
        });
      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error);
      }
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded]);

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

  // Handle fulfillment types multi-select
  const [selectedFulfillmentTypes, setSelectedFulfillmentTypes] = useState<string[]>(() => {
    if (!formData.fulfillmentTypes) return [];
    
    if (Array.isArray(formData.fulfillmentTypes)) {
      return formData.fulfillmentTypes;
    }
    
    if (typeof formData.fulfillmentTypes === 'string') {
      return formData.fulfillmentTypes.split(', ').filter(Boolean);
    }
    
    return [];
  });

  // Handle e-commerce partners multi-select - NEW
  const [selectedEcommercePartners, setSelectedEcommercePartners] = useState<string[]>(() => {
    if (!formData.ecommercePartners) return [];
    
    if (Array.isArray(formData.ecommercePartners)) {
      return formData.ecommercePartners;
    }
    
    return [];
  });

  const [customerEvents, setCustomerEvents] = useState<CustomerEvent[]>(
    formData.customerEvents || []
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
   * Handle Add Banner button click
   */
  const handleAddBanner = () => {
    console.log('Add Banner clicked - Feature to be implemented');
    alert('Add Banner feature will be implemented soon');
  };

  /**
   * Handle Add Buying Office button click
   */
  const handleAddBuyingOffice = () => {
    console.log('Add Buying Office clicked - Feature to be implemented');
    alert('Add Buying Office feature will be implemented soon');
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
      fulfillmentTypes: selectedFulfillmentTypes,
      ecommercePartners: selectedEcommercePartners,
      customerEvents: customerEvents,
      lastModified: new Date().toISOString(),
      categoryCaptain: formData.categoryCaptain === 'none' ? '' : formData.categoryCaptain,
      categoryAdvisor: formData.categoryAdvisor === 'none' ? '' : formData.categoryAdvisor,
      pricingStrategy: formData.pricingStrategy === 'none' ? '' : formData.pricingStrategy,
      privateLabel: formData.privateLabel === 'none' ? '' : formData.privateLabel,
      innovationAppetite: formData.innovationAppetite === 'none' ? '' : formData.innovationAppetite,
      displayMandates: formData.displayMandates === 'none' ? '' : formData.displayMandates,
      ecommerceMaturityLevel: formData.ecommerceMaturityLevel === 'none' ? '' : formData.ecommerceMaturityLevel,
      // Convert 'none' to empty string for level of influence fields
      influenceAssortmentShelf: formData.influenceAssortmentShelf === 'none' ? '' : formData.influenceAssortmentShelf,
      influencePricePromo: formData.influencePricePromo === 'none' ? '' : formData.influencePricePromo,
      influenceDisplayMerchandising: formData.influenceDisplayMerchandising === 'none' ? '' : formData.influenceDisplayMerchandising,
      influenceDigital: formData.influenceDigital === 'none' ? '' : formData.influenceDigital,
      influenceEcommerce: formData.influenceEcommerce === 'none' ? '' : formData.influenceEcommerce,
      influenceInStoreEvents: formData.influenceInStoreEvents === 'none' ? '' : formData.influenceInStoreEvents,
      influenceShrinkManagement: formData.influenceShrinkManagement === 'none' ? '' : formData.influenceShrinkManagement,
      influenceBuyingPOOwnership: formData.influenceBuyingPOOwnership === 'none' ? '' : formData.influenceBuyingPOOwnership
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

  const toggleFulfillmentType = (type: string) => {
    setSelectedFulfillmentTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const selectAllFulfillmentTypes = () => {
    if (selectedFulfillmentTypes.length === FULFILLMENT_TYPES.length) {
      setSelectedFulfillmentTypes([]);
    } else {
      setSelectedFulfillmentTypes([...FULFILLMENT_TYPES]);
    }
  };

  const toggleEcommercePartner = (partner: string) => {
    setSelectedEcommercePartners(prev => {
      if (prev.includes(partner)) {
        return prev.filter(p => p !== partner);
      } else {
        return [...prev, partner];
      }
    });
  };

  const selectAllEcommercePartners = () => {
    if (selectedEcommercePartners.length === ECOMMERCE_PARTNERS.length) {
      setSelectedEcommercePartners([]);
    } else {
      setSelectedEcommercePartners([...ECOMMERCE_PARTNERS]);
    }
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
  const isAllFulfillmentTypesSelected = selectedFulfillmentTypes.length === FULFILLMENT_TYPES.length;
  const isAllEcommercePartnersSelected = selectedEcommercePartners.length === ECOMMERCE_PARTNERS.length;

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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
              Customer Overview
            </CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddBanner}
                className="flex items-center gap-2"
              >
                <Image className="w-4 h-4" />
                Add a Banner
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddBuyingOffice}
                className="flex items-center gap-2"
              >
                <Building className="w-4 h-4" />
                Add a Buying Office
              </Button>
            </div>
          </div>
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
                placeholder="e.g., COST"
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
            <Label htmlFor="publiclyTraded" className="text-sm font-medium">Publicly Traded</Label>
          </div>
          <div>
            <Label htmlFor="channel" className="text-sm font-medium">Channel</Label>
            <Select value={formData.channel} onValueChange={(value) => updateField('channel', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Club">Club</SelectItem>
                <SelectItem value="C-Store">C-Store</SelectItem>
                <SelectItem value="DoorDash">DoorDash</SelectItem>
                <SelectItem value="Drug">Drug</SelectItem>
                <SelectItem value="Ecommerce">Ecommerce</SelectItem>
                <SelectItem value="Grocery">Grocery</SelectItem>
                <SelectItem value="Instacart">Instacart</SelectItem>
                <SelectItem value="Liquor">Liquor</SelectItem>
                <SelectItem value="Mass">Mass</SelectItem>
                <SelectItem value="Military">Military</SelectItem>
                <SelectItem value="Regional Grocery">Regional Grocery</SelectItem>
                <SelectItem value="UberEats">UberEats</SelectItem>
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
                <SelectItem value="National Retailer">National Retailer</SelectItem>
                <SelectItem value="Regional Retailer">Regional Retailer</SelectItem>
                <SelectItem value="Single State Retailer">Single State Retailer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Spirits Operating States</Label>
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

      {/* Contacts Section - Only show when editing existing account */}
      {account && accountContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              Contacts ({accountContacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accountContacts.map((contact) => (
                <div key={contact.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Name</Label>
                      <p className="text-sm font-medium text-gray-900">
                        {contact.firstName} {contact.lastName}
                        {contact.isPrimaryContact && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Primary</span>
                        )}
                      </p>
                    </div>
                    {contact.title && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          Title
                        </Label>
                        <p className="text-sm text-gray-900">{contact.title}</p>
                      </div>
                    )}
                    {contact.email && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Email
                        </Label>
                        <p className="text-sm text-gray-900">{contact.email}</p>
                      </div>
                    )}
                    {contact.mobilePhone && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          Mobile
                        </Label>
                        <p className="text-sm text-gray-900">{contact.mobilePhone}</p>
                      </div>
                    )}
                    {contact.officePhone && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          Office
                        </Label>
                        <p className="text-sm text-gray-900">{contact.officePhone}</p>
                      </div>
                    )}
                    {contact.relationshipStatus && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Relationship Status</Label>
                        <p className="text-sm text-gray-900">{contact.relationshipStatus}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Note: To add, edit, or remove contacts, please use the Contacts section in the main view.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Parent Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            Parent Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address" className="text-sm font-medium">
              Parent Company Address
              {isLoaded && GOOGLE_MAPS_API_KEY && (
                <span className="ml-2 text-xs text-green-600">(Google Autocomplete enabled)</span>
              )}
              {!GOOGLE_MAPS_API_KEY && (
                <span className="ml-2 text-xs text-gray-500">(Set VITE_GOOGLE_MAPS_API_KEY for autocomplete)</span>
              )}
            </Label>
            <Input
              ref={addressInputRef}
              id="address"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Start typing address for suggestions..."
              className="mt-1"
            />
            {loadError && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ Error loading Google Maps. Address can still be entered manually.
              </p>
            )}
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
          {/* Level of Influence - Moved to top of Strategy and Capabilities */}
          <div>
            <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Level of Influence
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="influenceAssortmentShelf" className="text-sm font-medium">Assortment / Shelf</Label>
                <Select 
                  value={formData.influenceAssortmentShelf || 'none'} 
                  onValueChange={(value) => updateField('influenceAssortmentShelf', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="influencePricePromo" className="text-sm font-medium">Price / Promo</Label>
                <Select 
                  value={formData.influencePricePromo || 'none'} 
                  onValueChange={(value) => updateField('influencePricePromo', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="influenceDisplayMerchandising" className="text-sm font-medium">Display / Merchandising</Label>
                <Select 
                  value={formData.influenceDisplayMerchandising || 'none'} 
                  onValueChange={(value) => updateField('influenceDisplayMerchandising', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="influenceDigital" className="text-sm font-medium">Digital</Label>
                <Select 
                  value={formData.influenceDigital || 'none'} 
                  onValueChange={(value) => updateField('influenceDigital', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="influenceEcommerce" className="text-sm font-medium">eCommerce</Label>
                <Select 
                  value={formData.influenceEcommerce || 'none'} 
                  onValueChange={(value) => updateField('influenceEcommerce', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="influenceInStoreEvents" className="text-sm font-medium">In Store Events</Label>
                <Select 
                  value={formData.influenceInStoreEvents || 'none'} 
                  onValueChange={(value) => updateField('influenceInStoreEvents', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="influenceShrinkManagement" className="text-sm font-medium">Shrink Management</Label>
                <Select 
                  value={formData.influenceShrinkManagement || 'none'} 
                  onValueChange={(value) => updateField('influenceShrinkManagement', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="influenceBuyingPOOwnership" className="text-sm font-medium">Buying / PO Ownership</Label>
                <Select 
                  value={formData.influenceBuyingPOOwnership || 'none'} 
                  onValueChange={(value) => updateField('influenceBuyingPOOwnership', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Divider after Level of Influence */}
          <div className="border-t pt-4"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isJBP"
                checked={formData.isJBP}
                onCheckedChange={(checked) => updateField('isJBP', checked as boolean)}
              />
              <Label htmlFor="isJBP" className="text-sm font-medium">JBP Customer</Label>
            </div>
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
                  <SelectItem value="EDLP (Everyday Low Pricing)">EDLP (Everyday Low Pricing)</SelectItem>
                  <SelectItem value="High-Low">High-Low</SelectItem>
                  <SelectItem value="Margin Focused">Margin Focused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="privateLabel" className="text-sm font-medium">Private Label</Label>
              <Select 
                value={formData.privateLabel || 'none'} 
                onValueChange={(value) => updateField('privateLabel', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select private label level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="displayMandates" className="text-sm font-medium">Are all displays mandated</Label>
              <Select 
                value={formData.displayMandates || 'none'} 
                onValueChange={(value) => updateField('displayMandates', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select display mandate level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Some">Some</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                </SelectContent>
              </Select>
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
            <Label htmlFor="ecommerceMaturityLevel" className="text-sm font-medium">E-Commerce Maturity Level</Label>
            <Select 
              value={formData.ecommerceMaturityLevel || 'none'} 
              onValueChange={(value) => updateField('ecommerceMaturityLevel', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select e-commerce maturity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="Basic Online Presence — Offers limited product listings online with inconsistent content and minimal digital merchandising">Basic Online Presence — Offers limited product listings online with inconsistent content and minimal digital merchandising</SelectItem>
                <SelectItem value="Growing Digital Capability — Has a functional online shelf, participates in occasional eCommerce programs, and supports basic pickup or third-party delivery">Growing Digital Capability — Has a functional online shelf, participates in occasional eCommerce programs, and supports basic pickup or third-party delivery</SelectItem>
                <SelectItem value="Strong Omni Execution — Executes reliably across search, content, promotions, and fulfillment with integrated pickup, delivery, and digital features">Strong Omni Execution — Executes reliably across search, content, promotions, and fulfillment with integrated pickup, delivery, and digital features</SelectItem>
                <SelectItem value="Leading Digital Innovator — Delivers a fully optimized digital shelf with personalization, strong data sharing, and seamless multi-method fulfillment across platforms">Leading Digital Innovator — Delivers a fully optimized digital shelf with personalization, strong data sharing, and seamless multi-method fulfillment across platforms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ecommerceSalesPercentage" className="text-sm font-medium">% of Sales Coming From E-Commerce:</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="ecommerceSalesPercentage"
                type="text"
                value={formData.ecommerceSalesPercentage}
                onChange={(e) => updateField('ecommerceSalesPercentage', e.target.value)}
                placeholder="Enter percentage"
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-600">%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Who Are Your Primary E-Commerce Partners?</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAllEcommercePartners}
                className="flex items-center gap-1 text-xs h-7"
              >
                {isAllEcommercePartnersSelected ? (
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
            </div>
            <div className="p-3 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ECOMMERCE_PARTNERS.map(partner => (
                  <div key={partner} className="flex items-center space-x-2">
                    <Checkbox
                      id={`partner-${partner}`}
                      checked={selectedEcommercePartners.includes(partner)}
                      onCheckedChange={() => toggleEcommercePartner(partner)}
                    />
                    <Label htmlFor={`partner-${partner}`} className="text-sm cursor-pointer">
                      {partner}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedEcommercePartners.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium text-gray-700">
                    Selected ({selectedEcommercePartners.length}/{ECOMMERCE_PARTNERS.length}):
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedEcommercePartners.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Available Fulfillment Types</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAllFulfillmentTypes}
                className="flex items-center gap-1 text-xs h-7"
              >
                {isAllFulfillmentTypesSelected ? (
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
            </div>
            <div className="p-3 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FULFILLMENT_TYPES.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`fulfillment-${type}`}
                      checked={selectedFulfillmentTypes.includes(type)}
                      onCheckedChange={() => toggleFulfillmentType(type)}
                    />
                    <Label htmlFor={`fulfillment-${type}`} className="text-sm cursor-pointer">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedFulfillmentTypes.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium text-gray-700">
                    Selected ({selectedFulfillmentTypes.length}/{FULFILLMENT_TYPES.length}):
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedFulfillmentTypes.join(', ')}
                  </p>
                </div>
              )}
            </div>
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
                  <SelectItem value="Diageo">Diageo</SelectItem>
                  <SelectItem value="AB-InBev">AB-InBev</SelectItem>
                  <SelectItem value="Bacardi">Bacardi</SelectItem>
                  <SelectItem value="Breakthru Beverage">Breakthru Beverage</SelectItem>
                  <SelectItem value="Brown-Forman">Brown-Forman</SelectItem>
                  <SelectItem value="Customer-Owned">Customer-Owned</SelectItem>
                  <SelectItem value="E&J Gallo">E&J Gallo</SelectItem>
                  <SelectItem value="Johnson Bros.">Johnson Bros.</SelectItem>
                  <SelectItem value="Pernod Ricard">Pernod Ricard</SelectItem>
                  <SelectItem value="PLM">PLM</SelectItem>
                  <SelectItem value="Suntory">Suntory</SelectItem>
                  <SelectItem value="Sazerac">Sazerac</SelectItem>
                  <SelectItem value="SGWS">SGWS</SelectItem>
                  <SelectItem value="Reyes">Reyes</SelectItem>
                  <SelectItem value="RNDC">RNDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="categoryAdvisor" className="text-sm font-medium">Category Validator</Label>
              <Select 
                value={formData.categoryAdvisor || 'none'} 
                onValueChange={(value) => updateField('categoryAdvisor', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Category Validator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Diageo">Diageo</SelectItem>
                  <SelectItem value="AB-InBev">AB-InBev</SelectItem>
                  <SelectItem value="Bacardi">Bacardi</SelectItem>
                  <SelectItem value="Breakthru Beverage">Breakthru Beverage</SelectItem>
                  <SelectItem value="Brown-Forman">Brown-Forman</SelectItem>
                  <SelectItem value="Customer-Owned">Customer-Owned</SelectItem>
                  <SelectItem value="E&J Gallo">E&J Gallo</SelectItem>
                  <SelectItem value="Johnson Bros.">Johnson Bros.</SelectItem>
                  <SelectItem value="Pernod Ricard">Pernod Ricard</SelectItem>
                  <SelectItem value="PLM">PLM</SelectItem>
                  <SelectItem value="Suntory">Suntory</SelectItem>
                  <SelectItem value="Sazerac">Sazerac</SelectItem>
                  <SelectItem value="SGWS">SGWS</SelectItem>
                  <SelectItem value="Reyes">Reyes</SelectItem>
                  <SelectItem value="RNDC">RNDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="innovationAppetite" className="text-sm font-medium">Innovation Appetite</Label>
            <Select 
              value={formData.innovationAppetite?.toString() || ''} 
              onValueChange={(value) => updateField('innovationAppetite', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select innovation appetite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Innovation Leader - Actively shapes category trends and seeks first-to-market opportunities">Innovation Leader - Actively shapes category trends and seeks first-to-market opportunities</SelectItem>
                <SelectItem value="Early Adopter - Embraces new items and programs ahead of peers to gain a competitive edge">Early Adopter - Embraces new items and programs ahead of peers to gain a competitive edge</SelectItem>
                <SelectItem value="Selective Adopter - Evaluates innovation carefully and participates when aligned to strategy">Selective Adopter - Evaluates innovation carefully and participates when aligned to strategy</SelectItem>
                <SelectItem value="Cautious Adopter - Moves slowly on new items and prefers proven success before committing">Cautious Adopter - Moves slowly on new items and prefers proven success before committing</SelectItem>
                <SelectItem value="Innovation Resistant - Rarely accepts innovation and sticks to a stable-risk assortment">Innovation Resistant - Rarely accepts innovation and sticks to a stable-risk assortment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="hasPlanograms"
              checked={formData.hasPlanograms}
              onCheckedChange={(checked) => updateField('hasPlanograms', checked as boolean)}
            />
            <Label htmlFor="hasPlanograms" className="text-sm font-medium">Has Planogram</Label>
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

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Additional Information</CardTitle>
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
            <Label htmlFor="designatedCharities" className="text-sm font-medium">Designated Charities</Label>
            <Textarea
              id="designatedCharities"
              value={formData.designatedCharities || ''}
              onChange={(e) => updateField('designatedCharities', e.target.value)}
              placeholder="Enter designated charities"
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