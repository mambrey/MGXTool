import React, { useState, useEffect } from 'react';
import { Save, Trash2, Calendar, Target, TrendingUp, Plus, Bell, Building2, CheckSquare, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { AddressAutocomplete } from './AddressAutocomplete';

interface CustomerEvent {
  id: string;
  title: string;
  date: string;
  alertEnabled?: boolean;
  alertOptions?: string[];
}

interface CategoryResetWindow {
  id: string;
  category: string;
  months: string[];
}

interface StateOutlet {
  state: string;
  outletCount: string;
}

interface BannerBuyingOffice {
  id: string;
  accountName: string;
  parentCompany?: string;
  address: string;
  website: string;
  channel: string;
  footprint: string;
  operatingStates: string[];
  allSpiritsOutlets: string;
  spiritsOutletsByState?: StateOutlet[];
  executionReliabilityScore?: string;
  executionReliabilityRationale?: string;
  // Strategy and Capabilities fields
  influenceAssortmentShelf: string;
  influencePricePromo: string;
  influenceDisplayMerchandising: string;
  influenceDigital: string;
  influenceEcommerce: string;
  influenceInStoreEvents: string;
  influenceShrinkManagement: string;
  influenceBuyingPOOwnership: string;
  isJBP: boolean;
  lastJBPDate: string;
  nextJBPDate: string;
  nextJBPAlert?: boolean;
  nextJBPAlertOptions?: string[];
  pricingStrategy: string;
  privateLabel: string;
  displayMandates: string;
  ecommerceMaturityLevel: string;
  ecommerceSalesPercentage: string;
  fulfillmentTypes: string[];
  ecommercePartners: string[];
  innovationAppetite: string;
  allowsWetSampling?: string;
  innovationLeadTime?: string;
  fullProofOutlets: string;
  categoryCaptain: string;
  categoryAdvisor: string;
  hasPlanograms: boolean;
  planogramWrittenBy: string;
  resetFrequency: string;
  resetWindowLeadTime: string;
  resetWindowMonths: string[];
  affectedCategories: string[];
  hasDifferentResetWindows: string;
  categoryResetWindows: CategoryResetWindow[];
  strategicPriorities: string;
  keyCompetitors: string[];
  designatedCharities: string;
  customerEvents: CustomerEvent[];
}

interface BannerBuyingOfficeCardProps {
  banner: BannerBuyingOffice;
  index: number;
  parentAccountName: string;
  usStates: string[];
  fulfillmentTypes: string[];
  ecommercePartners: string[];
  affectedCategories: string[];
  resetFrequencyOptions: string[];
  resetLeadTimeOptions: string[];
  months: string[];
  onUpdateField: (id: string, field: keyof BannerBuyingOffice, value: unknown) => void;
  onToggleState: (bannerId: string, state: string) => void;
  onToggleFulfillmentType: (bannerId: string, type: string) => void;
  onToggleEcommercePartner: (bannerId: string, partner: string) => void;
  onToggleResetMonth: (bannerId: string, month: string) => void;
  onToggleAffectedCategory: (bannerId: string, category: string) => void;
  onAddCategoryResetWindow: (bannerId: string) => void;
  onUpdateCategoryResetWindow: (bannerId: string, categoryId: string, field: 'category', value: string) => void;
  onToggleCategoryMonth: (bannerId: string, categoryId: string, month: string) => void;
  onRemoveCategoryResetWindow: (bannerId: string, categoryId: string) => void;
  onAddCustomerEvent: (bannerId: string) => void;
  onUpdateCustomerEvent: (bannerId: string, eventId: string, field: 'title' | 'date', value: string) => void;
  onRemoveCustomerEvent: (bannerId: string, eventId: string) => void;
  onSave: (bannerId: string) => void;
  onRemove: (bannerId: string) => void;
  formatDateForInput: (dateString: string) => string;
}

// Key Competitors list - UPDATED to match the exact names from the provided HTML
const KEY_COMPETITORS = [
  '7-eleven', 'Aafes', 'Abc', 'ALBSCO', 'Bevmo/Go-Puff', 'Bjs', 'Caseys', 'Circle k',
  'Coast guard', 'Coborns', 'Costco', 'Cub', 'CVS', 'Doordash', 'El super',
  'Festival foods', 'Food maxx', 'Giant eagle', 'Goody goody', 'Gopuff', 'Hyvee',
  'Instacart', 'Kroger', 'Kum & go', "Lee's discount liquor", 'Lucky', "Marine's",
  'Meijer', 'Nexcom', "Raley's", 'Rouses', 'Sams club', 'Save mart', "Schnuck's",
  'Smart & final', "Spec's", 'Stater bros', 'Target', 'Total wine & more',
  'Twin liquors', 'Ubereats', 'Walgreens', 'Walmart', 'Wegmans', 'Wfm', 'Winn dixie (seg)'
];

// Helper function to get alert option label
const getAlertOptionLabel = (option: string): string => {
  if (option === '30_days_before') return '30 Days Before';
  if (option === '7_days_before') return '7 Days Before';
  if (option === '1_day_before') return '1 Day Before';
  if (option.startsWith('custom_')) {
    const days = option.replace('custom_', '');
    return `${days} Days Before`;
  }
  return option;
};

export default function BannerBuyingOfficeCard({
  banner,
  index,
  parentAccountName,
  usStates,
  fulfillmentTypes,
  ecommercePartners,
  affectedCategories,
  resetFrequencyOptions,
  resetLeadTimeOptions,
  months,
  onUpdateField,
  onToggleState,
  onToggleFulfillmentType,
  onToggleEcommercePartner,
  onToggleResetMonth,
  onToggleAffectedCategory,
  onAddCategoryResetWindow,
  onUpdateCategoryResetWindow,
  onToggleCategoryMonth,
  onRemoveCategoryResetWindow,
  onAddCustomerEvent,
  onUpdateCustomerEvent,
  onRemoveCustomerEvent,
  onSave,
  onRemove,
  formatDateForInput
}: BannerBuyingOfficeCardProps) {
  // JBP validation error state
  const [jbpValidationError, setJbpValidationError] = useState<string>('');

  // State for custom alert days
  const [jbpCustomDays, setJbpCustomDays] = useState<string>('');
  const [eventCustomDays, setEventCustomDays] = useState<{[key: string]: string}>({});

  // State outlets by state for multiple states
  const [stateOutlets, setStateOutlets] = useState<StateOutlet[]>(() => {
    if (banner.spiritsOutletsByState && Array.isArray(banner.spiritsOutletsByState)) {
      return banner.spiritsOutletsByState;
    }
    return [];
  });

  // State for selected key competitors (multi-select)
  const [selectedKeyCompetitors, setSelectedKeyCompetitors] = useState<string[]>(() => {
    if (!banner.keyCompetitors) return [];
    if (Array.isArray(banner.keyCompetitors)) return banner.keyCompetitors;
    // Handle legacy string format - convert to array
    if (typeof banner.keyCompetitors === 'string' && banner.keyCompetitors) {
      return [banner.keyCompetitors];
    }
    return [];
  });

  // Sync selectedKeyCompetitors with banner.keyCompetitors
  useEffect(() => {
    onUpdateField(banner.id, 'keyCompetitors', selectedKeyCompetitors);
  }, [selectedKeyCompetitors]);

  // Validate JBP Customer and Next JBP date
  useEffect(() => {
    if (banner.isJBP) {
      if (!banner.nextJBPDate || banner.nextJBPDate.trim() === '') {
        setJbpValidationError('Please input the Next JBP date when JBP Customer is selected');
      } else {
        // Check if the date is in the future
        const selectedDate = new Date(banner.nextJBPDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
        
        if (selectedDate < today) {
          setJbpValidationError('Next JBP date must be a future date');
        } else {
          setJbpValidationError('');
        }
      }
    } else {
      setJbpValidationError('');
    }
  }, [banner.isJBP, banner.nextJBPDate]);

  // Update stateOutlets when operatingStates changes
  useEffect(() => {
    if (banner.operatingStates.length > 0) {
      // Create state outlets for newly selected states
      const newStateOutlets = banner.operatingStates.map(state => {
        const existing = stateOutlets.find(so => so.state === state);
        return existing || { state, outletCount: '' };
      });
      setStateOutlets(newStateOutlets);
      // Update parent with new state outlets
      onUpdateField(banner.id, 'spiritsOutletsByState', newStateOutlets);
    }
  }, [banner.operatingStates]);

  const updateStateOutletCount = (state: string, count: string) => {
    const updatedStateOutlets = stateOutlets.map(so => 
      so.state === state ? { ...so, outletCount: count } : so
    );
    setStateOutlets(updatedStateOutlets);
    onUpdateField(banner.id, 'spiritsOutletsByState', updatedStateOutlets);
  };

  const toggleEventAlert = (eventId: string) => {
    const updatedEvents = banner.customerEvents.map(event =>
      event.id === eventId ? { ...event, alertEnabled: !event.alertEnabled } : event
    );
    onUpdateField(banner.id, 'customerEvents', updatedEvents);
  };

  const handleToggleEventAlertOption = (eventId: string, option: string) => {
    const updatedEvents = banner.customerEvents.map(event => {
      if (event.id === eventId) {
        const currentOptions = event.alertOptions || [];
        const newOptions = currentOptions.includes(option)
          ? currentOptions.filter(o => o !== option)
          : [...currentOptions, option];
        return { ...event, alertOptions: newOptions };
      }
      return event;
    });
    onUpdateField(banner.id, 'customerEvents', updatedEvents);
  };

  const handleToggleJBPAlertOption = (option: string) => {
    const currentOptions = banner.nextJBPAlertOptions || [];
    const newOptions = currentOptions.includes(option)
      ? currentOptions.filter(o => o !== option)
      : [...currentOptions, option];
    onUpdateField(banner.id, 'nextJBPAlertOptions', newOptions);
  };

  const handleJBPCustomDaysChange = (value: string) => {
    setJbpCustomDays(value);
    const currentOptions = banner.nextJBPAlertOptions || [];
    // Remove any existing custom options
    const filteredOptions = currentOptions.filter(opt => !opt.startsWith('custom_'));
    
    if (value && parseInt(value) > 0) {
      const customOption = `custom_${value}`;
      onUpdateField(banner.id, 'nextJBPAlertOptions', [...filteredOptions, customOption]);
    } else {
      onUpdateField(banner.id, 'nextJBPAlertOptions', filteredOptions);
    }
  };

  const handleEventCustomDaysChange = (eventId: string, value: string) => {
    setEventCustomDays(prev => ({ ...prev, [eventId]: value }));
    
    const updatedEvents = banner.customerEvents.map(event => {
      if (event.id === eventId) {
        const currentOptions = event.alertOptions || [];
        // Remove any existing custom options
        const filteredOptions = currentOptions.filter(opt => !opt.startsWith('custom_'));
        
        if (value && parseInt(value) > 0) {
          const customOption = `custom_${value}`;
          return { ...event, alertOptions: [...filteredOptions, customOption] };
        }
        return { ...event, alertOptions: filteredOptions };
      }
      return event;
    });
    onUpdateField(banner.id, 'customerEvents', updatedEvents);
  };

  const isJBPCustomChecked = (banner.nextJBPAlertOptions || []).some(opt => opt.startsWith('custom_'));
  
  const getEventCustomChecked = (event: CustomerEvent) => {
    return (event.alertOptions || []).some(opt => opt.startsWith('custom_'));
  };

  // Key Competitors multi-select functions
  const toggleKeyCompetitor = (competitor: string) => {
    setSelectedKeyCompetitors(prev => {
      if (prev.includes(competitor)) {
        return prev.filter(c => c !== competitor);
      } else {
        return [...prev, competitor].sort();
      }
    });
  };

  const selectAllKeyCompetitors = () => {
    if (selectedKeyCompetitors.length === KEY_COMPETITORS.length) {
      setSelectedKeyCompetitors([]);
    } else {
      setSelectedKeyCompetitors([...KEY_COMPETITORS]);
    }
  };

  const clearAllKeyCompetitors = () => {
    setSelectedKeyCompetitors([]);
  };

  const isAllKeyCompetitorsSelected = selectedKeyCompetitors.length === KEY_COMPETITORS.length;

  return (
    <Card className="bg-white border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-purple-700">
            Banner/Buying Office #{index + 1}
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(banner.id)}
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Overview Section */}
        <div>
          <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Customer Overview
          </Label>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Banner/Buying Office Name *</Label>
              <Input
                value={banner.accountName}
                onChange={(e) => onUpdateField(banner.id, 'accountName', e.target.value)}
                placeholder="Enter banner/buying office name"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Parent Account</Label>
              <Input
                value={parentAccountName || 'Current Account'}
                disabled
                className="mt-1 bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Automatically set to the current account being created/edited
              </p>
            </div>

            <div>
              <Label htmlFor={`banner-${banner.id}-address`} className="text-sm font-medium">
                Banner/Buying Office Address
              </Label>
              <AddressAutocomplete
                value={banner.address}
                onChange={(address) => onUpdateField(banner.id, 'address', address)}
                placeholder="Start typing address..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Start typing to see address suggestions. Your selection will be saved automatically.
              </p>
            </div>

            <div>
              <Label htmlFor={`banner-${banner.id}-website`} className="text-sm font-medium">
                Website
              </Label>
              <Input
                id={`banner-${banner.id}-website`}
                value={banner.website}
                onChange={(e) => onUpdateField(banner.id, 'website', e.target.value)}
                placeholder="Enter website URL"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Channel</Label>
              <Select 
                value={banner.channel || ''} 
                onValueChange={(value) => onUpdateField(banner.id, 'channel', value === 'clear' ? '' : value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
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
              <Label className="text-sm font-medium">Geographic Scope</Label>
              <Select 
                value={banner.footprint || ''} 
                onValueChange={(value) => onUpdateField(banner.id, 'footprint', value === 'clear' ? '' : value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select geographic scope" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                <SelectItem value="Banner/Buying Office">Banner/Buying Office</SelectItem>
                <SelectItem value="National">National Retailer</SelectItem>
                <SelectItem value="Regional">Regional Retailer</SelectItem>
                <SelectItem value="Single State">Single State Retailer</SelectItem>
              </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Spirits Operating States (enter number of spirits outlets in state upon selecting state)</Label>
              <div className="p-3 border rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-5 gap-3">
                  {usStates.map(state => {
                    const isSelected = banner.operatingStates.includes(state);
                    const stateOutlet = stateOutlets.find(so => so.state === state);
                    
                    return (
                      <div key={state} className="flex items-center gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`banner-${banner.id}-state-${state}`}
                            checked={isSelected}
                            onCheckedChange={() => onToggleState(banner.id, state)}
                          />
                          <Label htmlFor={`banner-${banner.id}-state-${state}`} className="text-sm cursor-pointer font-medium whitespace-nowrap">
                            {state}
                          </Label>
                        </div>
                        {isSelected && (
                          <Input
                            type="number"
                            placeholder="#"
                            value={stateOutlet?.outletCount || ''}
                            onChange={(e) => updateStateOutletCount(state, e.target.value)}
                            className="h-7 w-16 text-xs"
                            min="0"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor={`banner-${banner.id}-executionReliabilityScore`} className="text-sm font-medium">Execution Reliability Score</Label>
              <Select 
                value={banner.executionReliabilityScore || ''} 
                onValueChange={(value) => onUpdateField(banner.id, 'executionReliabilityScore', value === 'clear' ? '' : value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select reliability score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                  <SelectItem value="5">5 – Highly Reliable: Nearly all agreed programs, displays, and resets are executed on time and in full</SelectItem>
                  <SelectItem value="4">4 – Generally Reliable: Most programs land well with occasional gaps that are usually fixed quickly</SelectItem>
                  <SelectItem value="3">3 – Mixed Reliability: Some things execute and some do not; performance often varies by store</SelectItem>
                  <SelectItem value="2">2 – Low Reliability: Many commitments do not materialize or are partial with limited follow through</SelectItem>
                  <SelectItem value="1">1 – Very Low Reliability: Execution rarely matches agreements; plans often stall or disappear</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor={`banner-${banner.id}-executionReliabilityRationale`} className="text-sm font-medium">Rationale/Notes (Optional)</Label>
              <Textarea
                id={`banner-${banner.id}-executionReliabilityRationale`}
                value={banner.executionReliabilityRationale || ''}
                onChange={(e) => onUpdateField(banner.id, 'executionReliabilityRationale', e.target.value)}
                placeholder="Add any additional context or notes about execution reliability..."
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>
        </div>

        {/* Strategy and Capabilities Section */}
        <div className="border-t pt-6">
          <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
            <Target className="w-4 h-4" />
            Strategy and Capabilities
          </Label>
          
          <div className="space-y-4">
            {/* Level of Influence - UPDATED TO MATCH HQ PAIRED LAYOUT */}
            <div>
              <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Level of Influence
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Row 1: Assortment/Shelf + Private Label Emphasis */}
                <div>
                  <Label className="text-xs font-medium">Assortment / Shelf</Label>
                  <Select 
                    value={banner.influenceAssortmentShelf || 'none'} 
                    onValueChange={(value) => onUpdateField(banner.id, 'influenceAssortmentShelf', value)}
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
                  <Label className="text-xs font-medium">Private Label Emphasis</Label>
                  <Select 
                    value={banner.privateLabel || 'none'} 
                    onValueChange={(value) => onUpdateField(banner.id, 'privateLabel', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select private label emphasis level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 2: Display/Merchandising + Are Displays Mandated */}
                <div>
                  <Label className="text-xs font-medium">Display / Merchandising</Label>
                  <Select 
                    value={banner.influenceDisplayMerchandising || 'none'} 
                    onValueChange={(value) => onUpdateField(banner.id, 'influenceDisplayMerchandising', value)}
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
                  <Label className="text-xs font-medium">Are Displays Mandated</Label>
                  <Select 
                    value={banner.displayMandates || 'none'} 
                    onValueChange={(value) => onUpdateField(banner.id, 'displayMandates', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select display mandate level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fully Mandated">
                        <div className="flex flex-col">
                          <span className="font-medium">Fully Mandated</span>
                          <span className="text-xs text-gray-500">Chainwide requirement with strict enforcement and formal compliance</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Partially Mandated">
                        <div className="flex flex-col">
                          <span className="font-medium">Partially Mandated</span>
                          <span className="text-xs text-gray-500">Required only in certain areas or periods with light enforcement</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Encouraged but Optional">
                        <div className="flex flex-col">
                          <span className="font-medium">Encouraged but Optional</span>
                          <span className="text-xs text-gray-500">Corporate supports displays, but execution depends on local teams</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Store-Level Discretion">
                        <div className="flex flex-col">
                          <span className="font-medium">Store-Level Discretion</span>
                          <span className="text-xs text-gray-500">No corporate direction- individual stores decide if displays happen</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Not Mandated">
                        <div className="flex flex-col">
                          <span className="font-medium">Not Mandated</span>
                          <span className="text-xs text-gray-500">No expectation for displays- execution is purely opportunistic</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 3: Price/Promo + Pricing Strategy */}
                <div>
                  <Label className="text-xs font-medium">Price / Promo</Label>
                  <Select 
                    value={banner.influencePricePromo || 'none'} 
                    onValueChange={(value) => onUpdateField(banner.id, 'influencePricePromo', value)}
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
                  <Label className="text-xs font-medium">Pricing Strategy</Label>
                  <Select 
                    value={banner.pricingStrategy || 'none'} 
                    onValueChange={(value) => onUpdateField(banner.id, 'pricingStrategy', value)}
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

                {/* Row 4: Ecommerce + Digital/Social */}
                <div>
                  <Label className="text-xs font-medium">Ecommerce</Label>
                  <Select 
                    value={banner.influenceEcommerce || 'none'} 
                    onValueChange={(value) => onUpdateField(banner.id, 'influenceEcommerce', value)}
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
                  <Label className="text-xs font-medium">Digital / Social</Label>
                  <Select 
                    value={banner.influenceDigital || 'none'} 
                    onValueChange={(value) => onUpdateField(banner.id, 'influenceDigital', value)}
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

                {/* Row 5: Buying/PO Ownership + Shrink Management - UPDATED OPTIONS */}
                <div>
                  <Label className="text-xs font-medium">Buying / PO Ownership</Label>
                  <Select 
                    value={banner.influenceBuyingPOOwnership || 'none'} 
                    onValueChange={(value) => onUpdateField(banner.id, 'influenceBuyingPOOwnership', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium">Shrink Management</Label>
                  <Select 
                    value={banner.influenceShrinkManagement || 'none'} 
                    onValueChange={(value) => onUpdateField(banner.id, 'influenceShrinkManagement', value)}
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

                {/* Row 6: In Store Events + Allows Wet Sampling */}
                <div>
                  <Label className="text-xs font-medium">In Store Events</Label>
                  <Select 
                    value={banner.influenceInStoreEvents || 'none'} 
                    onValueChange={(value) => onUpdateField(banner.id, 'influenceInStoreEvents', value)}
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
                  <Label className="text-xs font-medium">Allows Wet Sampling</Label>
                  <Select 
                    value={banner.allowsWetSampling || ''} 
                    onValueChange={(value) => onUpdateField(banner.id, 'allowsWetSampling', value === 'clear' ? '' : value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select wet sampling policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes Everywhere">Yes Everywhere</SelectItem>
                      <SelectItem value="Yes State Dependent">Yes State Dependent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 7: Innovation Appetite + Innovation Information Lead Time */}
                <div>
                  <Label className="text-xs font-medium">Innovation Appetite</Label>
                  <Select 
                    value={banner.innovationAppetite?.toString() || ''} 
                    onValueChange={(value) => onUpdateField(banner.id, 'innovationAppetite', value === 'clear' ? '' : value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select innovation appetite" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                      <SelectItem value="Innovation Leader - Actively shapes category trends and seeks first-to-market opportunities">Innovation Leader - Actively shapes category trends and seeks first-to-market opportunities</SelectItem>
                      <SelectItem value="Early Adopter - Embraces new items and programs ahead of peers to gain a competitive edge">Early Adopter - Embraces new items and programs ahead of peers to gain a competitive edge</SelectItem>
                      <SelectItem value="Selective Adopter - Evaluates innovation carefully and participates when aligned to strategy">Selective Adopter - Evaluates innovation carefully and participates when aligned to strategy</SelectItem>
                      <SelectItem value="Cautious Adopter - Moves slowly on new items and prefers proven success before committing">Cautious Adopter - Moves slowly on new items and prefers proven success before committing</SelectItem>
                      <SelectItem value="Innovation Resistant - Rarely accepts innovation and sticks to a stable-risk assortment">Innovation Resistant - Rarely accepts innovation and sticks to a stable-risk assortment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium">Innovation Information Lead Time</Label>
                  <Select 
                    value={banner.innovationLeadTime || ''} 
                    onValueChange={(value) => onUpdateField(banner.id, 'innovationLeadTime', value === 'clear' ? '' : value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select innovation information lead time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                      <SelectItem value="1 month">1 month</SelectItem>
                      <SelectItem value="3 months">3 months</SelectItem>
                      <SelectItem value="6 months">6 months</SelectItem>
                      <SelectItem value="9 months">9 months</SelectItem>
                      <SelectItem value="12 months">12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Has Planogram */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`banner-${banner.id}-hasPlanograms`}
                    checked={banner.hasPlanograms}
                    onCheckedChange={(checked) => onUpdateField(banner.id, 'hasPlanograms', checked as boolean)}
                  />
                  <Label htmlFor={`banner-${banner.id}-hasPlanograms`} className="text-sm font-medium">Has Planogram</Label>
                </div>

                {/* JBP Customer */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`banner-${banner.id}-isJBP`}
                    checked={banner.isJBP}
                    onCheckedChange={(checked) => onUpdateField(banner.id, 'isJBP', checked as boolean)}
                  />
                  <Label htmlFor={`banner-${banner.id}-isJBP`} className="text-sm font-medium">JBP Customer</Label>
                </div>
              </div>
            </div>

            <div className="border-t pt-4"></div>

            {banner.isJBP && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium">Last JBP</Label>
                    <Input
                      type="date"
                      value={formatDateForInput(banner.lastJBPDate || '')}
                      onChange={(e) => onUpdateField(banner.id, 'lastJBPDate', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Next JBP *</Label>
                    <Input
                      type="date"
                      value={formatDateForInput(banner.nextJBPDate || '')}
                      onChange={(e) => onUpdateField(banner.id, 'nextJBPDate', e.target.value)}
                      className="mt-1"
                    />
                    {jbpValidationError && (
                      <p className="text-xs text-red-600 mt-1">{jbpValidationError}</p>
                    )}
                  </div>
                </div>
                
                {/* Alert Section - UPDATED WITH NEW OPTIONS */}
                <div className="space-y-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-600" />
                      <Label htmlFor={`banner-${banner.id}-nextjbp-alert`} className="text-sm font-medium cursor-pointer">
                        Enable Alert
                      </Label>
                    </div>
                    <Switch
                      id={`banner-${banner.id}-nextjbp-alert`}
                      checked={banner.nextJBPAlert || false}
                      onCheckedChange={(checked) => onUpdateField(banner.id, 'nextJBPAlert', checked)}
                    />
                  </div>
                  
                  {banner.nextJBPAlert && (
                    <div className="space-y-2 pl-6">
                      <Label className="text-sm text-gray-600">
                        Alert me:
                      </Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`banner-${banner.id}-jbp-30-days`}
                            checked={(banner.nextJBPAlertOptions || []).includes('30_days_before')}
                            onCheckedChange={() => handleToggleJBPAlertOption('30_days_before')}
                          />
                          <Label htmlFor={`banner-${banner.id}-jbp-30-days`} className="text-sm font-normal cursor-pointer">
                            30 Days Before
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`banner-${banner.id}-jbp-7-days`}
                            checked={(banner.nextJBPAlertOptions || []).includes('7_days_before')}
                            onCheckedChange={() => handleToggleJBPAlertOption('7_days_before')}
                          />
                          <Label htmlFor={`banner-${banner.id}-jbp-7-days`} className="text-sm font-normal cursor-pointer">
                            7 Days Before
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`banner-${banner.id}-jbp-1-day`}
                            checked={(banner.nextJBPAlertOptions || []).includes('1_day_before')}
                            onCheckedChange={() => handleToggleJBPAlertOption('1_day_before')}
                          />
                          <Label htmlFor={`banner-${banner.id}-jbp-1-day`} className="text-sm font-normal cursor-pointer">
                            1 Day Before
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`banner-${banner.id}-jbp-custom`}
                            checked={isJBPCustomChecked}
                            onCheckedChange={(checked) => {
                              if (!checked) {
                                setJbpCustomDays('');
                                const filteredOptions = (banner.nextJBPAlertOptions || []).filter(opt => !opt.startsWith('custom_'));
                                onUpdateField(banner.id, 'nextJBPAlertOptions', filteredOptions);
                              }
                            }}
                          />
                          <Label htmlFor={`banner-${banner.id}-jbp-custom`} className="text-sm font-normal cursor-pointer">
                            Custom:
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="days"
                            value={jbpCustomDays}
                            onChange={(e) => handleJBPCustomDaysChange(e.target.value)}
                            className="w-20 h-7 text-xs"
                            disabled={!isJBPCustomChecked}
                          />
                          <span className="text-sm text-gray-600">days before</span>
                        </div>
                      </div>
                      {(banner.nextJBPAlertOptions || []).length > 0 && (
                        <p className="text-xs text-gray-500">
                          You'll receive {(banner.nextJBPAlertOptions || []).length} alert{(banner.nextJBPAlertOptions || []).length !== 1 ? 's' : ''} for this date
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs font-medium">E-Commerce Maturity Level</Label>
              <Select 
                value={banner.ecommerceMaturityLevel || 'none'} 
                onValueChange={(value) => onUpdateField(banner.id, 'ecommerceMaturityLevel', value)}
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
              <Label className="text-xs font-medium">% of Sales Coming From E-Commerce:</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={banner.ecommerceSalesPercentage}
                  onChange={(e) => onUpdateField(banner.id, 'ecommerceSalesPercentage', e.target.value)}
                  placeholder="Enter percentage"
                  className="w-32"
                />
                <span className="text-sm font-medium text-gray-600">%</span>
              </div>
            </div>

            {/* Fulfillment Types */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Available Fulfillment Types</Label>
              <div className="p-3 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fulfillmentTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`banner-${banner.id}-fulfillment-${type}`}
                        checked={banner.fulfillmentTypes.includes(type)}
                        onCheckedChange={() => onToggleFulfillmentType(banner.id, type)}
                      />
                      <Label htmlFor={`banner-${banner.id}-fulfillment-${type}`} className="text-xs cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* E-Commerce Partners */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Primary E-Commerce Partners</Label>
              <div className="p-3 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ecommercePartners.map(partner => (
                    <div key={partner} className="flex items-center space-x-2">
                      <Checkbox
                        id={`banner-${banner.id}-partner-${partner}`}
                        checked={banner.ecommercePartners.includes(partner)}
                        onCheckedChange={() => onToggleEcommercePartner(banner.id, partner)}
                      />
                      <Label htmlFor={`banner-${banner.id}-partner-${partner}`} className="text-xs cursor-pointer">
                        {partner}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium">Category Captain</Label>
                <Select 
                  value={banner.categoryCaptain || 'none'} 
                  onValueChange={(value) => onUpdateField(banner.id, 'categoryCaptain', value)}
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
                <Label className="text-xs font-medium">Category Validator</Label>
                <Select 
                  value={banner.categoryAdvisor || 'none'} 
                  onValueChange={(value) => onUpdateField(banner.id, 'categoryAdvisor', value)}
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

            {/* Planogram Section */}
            {banner.hasPlanograms && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                <Label className="text-sm font-medium block flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Planogram Information
                </Label>
                
                {/* Affected Segments */}
                <div>
                  <Label className="text-xs font-medium mb-2 block">Affected Segments</Label>
                  <div className="p-3 border rounded-lg bg-white">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {affectedCategories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`banner-${banner.id}-category-${category}`}
                            checked={banner.affectedCategories.includes(category)}
                            onCheckedChange={() => onToggleAffectedCategory(banner.id, category)}
                          />
                          <Label htmlFor={`banner-${banner.id}-category-${category}`} className="text-xs cursor-pointer">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium">Reset Frequency</Label>
                  <Select 
                    value={banner.resetFrequency || ''} 
                    onValueChange={(value) => onUpdateField(banner.id, 'resetFrequency', value === 'clear' ? '' : value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select reset frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                      {resetFrequencyOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium">Reset Window Lead Time Requirement</Label>
                  <Select 
                    value={banner.resetWindowLeadTime || ''} 
                    onValueChange={(value) => onUpdateField(banner.id, 'resetWindowLeadTime', value === 'clear' ? '' : value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select lead time requirement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                      {resetLeadTimeOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium">
                    Are there different reset windows for different categories?
                  </Label>
                  <Select 
                    value={banner.hasDifferentResetWindows || ''} 
                    onValueChange={(value) => onUpdateField(banner.id, 'hasDifferentResetWindows', value === 'clear' ? '' : value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select yes or no" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Window Months - Only show when NOT using different reset windows per category */}
                {banner.hasDifferentResetWindows !== 'Yes' && (
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Reset Window</Label>
                    <div className="p-3 border rounded-lg bg-white">
                      <div className="grid grid-cols-6 gap-2">
                        {months.map(month => (
                          <div key={month} className="flex items-center space-x-1">
                            <Checkbox
                              id={`banner-${banner.id}-month-${month}`}
                              checked={banner.resetWindowMonths.includes(month)}
                              onCheckedChange={() => onToggleResetMonth(banner.id, month)}
                            />
                            <Label htmlFor={`banner-${banner.id}-month-${month}`} className="text-xs cursor-pointer">
                              {month}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {banner.hasDifferentResetWindows === 'Yes' && (
                  <div className="space-y-3 p-3 bg-white border border-gray-300 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Category-Specific Reset Windows</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onAddCategoryResetWindow(banner.id)}
                        className="flex items-center gap-1 h-7"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </Button>
                    </div>

                    {banner.categoryResetWindows.map((crw, idx) => (
                      <div key={crw.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs font-medium text-gray-600">Window #{idx + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveCategoryResetWindow(banner.id, crw.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Category</Label>
                            <Select 
                              value={crw.category} 
                              onValueChange={(value) => onUpdateCategoryResetWindow(banner.id, crw.id, 'category', value === 'clear' ? '' : value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                                {banner.affectedCategories.length > 0 ? (
                                  banner.affectedCategories.map(category => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="" disabled>No categories selected</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs font-medium text-gray-600 mb-1 block">Reset Window Months</Label>
                            <div className="p-2 border rounded-lg bg-white">
                              <div className="grid grid-cols-6 gap-1">
                                {months.map(month => (
                                  <div key={month} className="flex items-center space-x-1">
                                    <Checkbox
                                      id={`banner-${banner.id}-crw-${crw.id}-${month}`}
                                      checked={crw.months.includes(month)}
                                      onCheckedChange={() => onToggleCategoryMonth(banner.id, crw.id, month)}
                                    />
                                    <Label htmlFor={`banner-${banner.id}-crw-${crw.id}-${month}`} className="text-xs cursor-pointer">
                                      {month}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="border-t pt-6">
          <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Additional Information
          </Label>
          
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium">Customer Strategic Priorities</Label>
              <Textarea
                value={banner.strategicPriorities}
                onChange={(e) => onUpdateField(banner.id, 'strategicPriorities', e.target.value)}
                placeholder="Enter strategic priorities"
                rows={3}
                className="mt-1"
              />
            </div>
            
            {/* UPDATED: Key Competitors - Now with consistent grid layout */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium">Key Competitors</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllKeyCompetitors}
                    className="flex items-center gap-1 text-xs h-7"
                  >
                    {isAllKeyCompetitorsSelected ? (
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
                  {selectedKeyCompetitors.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearAllKeyCompetitors}
                      className="flex items-center gap-1 text-xs h-7"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              {selectedKeyCompetitors.length > 0 && (
                <p className="text-xs text-gray-600 mb-2">
                  Selected: {selectedKeyCompetitors.length} competitor{selectedKeyCompetitors.length !== 1 ? 's' : ''}
                </p>
              )}
              <div className="p-3 border rounded-lg bg-gray-50 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {KEY_COMPETITORS.map(competitor => (
                    <div key={competitor} className="flex items-center space-x-2">
                      <Checkbox
                        id={`banner-${banner.id}-competitor-${competitor}`}
                        checked={selectedKeyCompetitors.includes(competitor)}
                        onCheckedChange={() => toggleKeyCompetitor(competitor)}
                      />
                      <Label htmlFor={`banner-${banner.id}-competitor-${competitor}`} className="text-xs cursor-pointer">
                        {competitor}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium">Designated Charities</Label>
              <Textarea
                value={banner.designatedCharities || ''}
                onChange={(e) => onUpdateField(banner.id, 'designatedCharities', e.target.value)}
                placeholder="Enter designated charities"
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Key Customer Events
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAddCustomerEvent(banner.id)}
                  className="flex items-center gap-1 h-7"
                >
                  <Plus className="w-3 h-3" />
                  Add Event
                </Button>
              </div>
              
              {banner.customerEvents.length === 0 ? (
                <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                  <Calendar className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                  <p className="text-xs">No customer events added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {banner.customerEvents.map((event, eventIdx) => (
                    <div key={event.id} className="p-2 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-medium text-gray-600">Event #{eventIdx + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveCustomerEvent(banner.id, event.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs font-medium text-gray-600">Event Title</Label>
                          <Input
                            value={event.title}
                            onChange={(e) => onUpdateCustomerEvent(banner.id, event.id, 'title', e.target.value)}
                            placeholder="e.g., Annual Review Meeting"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-600">Event Date</Label>
                          <Input
                            type="date"
                            value={formatDateForInput(event.date)}
                            onChange={(e) => onUpdateCustomerEvent(banner.id, event.id, 'date', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      {/* Alert Section for Customer Events - UPDATED WITH NEW OPTIONS */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-orange-600" />
                              <Label htmlFor={`banner-${banner.id}-event-alert-${event.id}`} className="text-sm font-medium cursor-pointer">
                                Enable Alert
                              </Label>
                            </div>
                            <Switch
                              id={`banner-${banner.id}-event-alert-${event.id}`}
                              checked={event.alertEnabled || false}
                              onCheckedChange={() => toggleEventAlert(event.id)}
                            />
                          </div>
                          
                          {event.alertEnabled && (
                            <div className="space-y-2 pl-6">
                              <Label className="text-sm text-gray-600">
                                Alert me:
                              </Label>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`banner-${banner.id}-event-${event.id}-30-days`}
                                    checked={(event.alertOptions || []).includes('30_days_before')}
                                    onCheckedChange={() => handleToggleEventAlertOption(event.id, '30_days_before')}
                                  />
                                  <Label htmlFor={`banner-${banner.id}-event-${event.id}-30-days`} className="text-sm font-normal cursor-pointer">
                                    30 Days Before
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`banner-${banner.id}-event-${event.id}-7-days`}
                                    checked={(event.alertOptions || []).includes('7_days_before')}
                                    onCheckedChange={() => handleToggleEventAlertOption(event.id, '7_days_before')}
                                  />
                                  <Label htmlFor={`banner-${banner.id}-event-${event.id}-7-days`} className="text-sm font-normal cursor-pointer">
                                    7 Days Before
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`banner-${banner.id}-event-${event.id}-1-day`}
                                    checked={(event.alertOptions || []).includes('1_day_before')}
                                    onCheckedChange={() => handleToggleEventAlertOption(event.id, '1_day_before')}
                                  />
                                  <Label htmlFor={`banner-${banner.id}-event-${event.id}-1-day`} className="text-sm font-normal cursor-pointer">
                                    1 Day Before
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`banner-${banner.id}-event-${event.id}-custom`}
                                    checked={getEventCustomChecked(event)}
                                    onCheckedChange={(checked) => {
                                      if (!checked) {
                                        setEventCustomDays(prev => {
                                          const newState = { ...prev };
                                          delete newState[event.id];
                                          return newState;
                                        });
                                        const filteredOptions = (event.alertOptions || []).filter(opt => !opt.startsWith('custom_'));
                                        const updatedEvents = banner.customerEvents.map(e => 
                                          e.id === event.id ? { ...e, alertOptions: filteredOptions } : e
                                        );
                                        onUpdateField(banner.id, 'customerEvents', updatedEvents);
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`banner-${banner.id}-event-${event.id}-custom`} className="text-sm font-normal cursor-pointer">
                                    Custom:
                                  </Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="days"
                                    value={eventCustomDays[event.id] || ''}
                                    onChange={(e) => handleEventCustomDaysChange(event.id, e.target.value)}
                                    className="w-20 h-7 text-xs"
                                    disabled={!getEventCustomChecked(event)}
                                  />
                                  <span className="text-sm text-gray-600">days before</span>
                                </div>
                              </div>
                              {(event.alertOptions || []).length > 0 && (
                                <p className="text-xs text-gray-500">
                                  You'll receive {(event.alertOptions || []).length} alert{(event.alertOptions || []).length !== 1 ? 's' : ''} for this event
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Banner/Buying Office Button */}
        <div className="border-t pt-4">
          <Button
            type="button"
            onClick={() => onSave(banner.id)}
            className="w-full flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Banner/Buying Office
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}