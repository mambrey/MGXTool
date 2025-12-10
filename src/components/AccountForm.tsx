import React, { useState, useEffect } from 'react';
import { Save, X, Building2, MapPin, Calendar, Target, CheckSquare, Square, Globe, Plus, Trash2, RefreshCw, Users, Mail, Phone, Briefcase, Building, TrendingUp, BarChart3, DollarSign, ChevronDown, ChevronUp, Bell, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import type { Account, Contact } from '@/types/crm';
import { powerAutomateService, type TickerSymbolData } from '@/services/power-automate';
import { useAlphaVantage } from '@/hooks/useAlphaVantage';
import BannerBuyingOfficeCard from '@/components/BannerBuyingOfficeCard';
import { AddressAutocomplete } from './AddressAutocomplete';

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
  alertEnabled?: boolean;
  alertOptions?: ('same_day' | 'day_before' | 'week_before')[];
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
  address: string;
  website: string;
  channel: string;
  footprint: string;
  operatingStates: string[];
  allSpiritsOutlets: string;
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
  pricingStrategy: string;
  privateLabel: string;
  displayMandates: string;
  ecommerceMaturityLevel: string;
  ecommerceSalesPercentage: string;
  fulfillmentTypes: string[];
  ecommercePartners: string[];
  innovationAppetite: string;
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
  // Additional Information fields
  strategicPriorities: string;
  keyCompetitors: string;
  designatedCharities: string;
  customerEvents: CustomerEvent[];
}

// US States for multi-select
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA',
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

// Reset Frequency options - NEW
const RESET_FREQUENCY_OPTIONS = [
  'Annual Reset',
  'Bi-Annual Reset',
  'Quarterly Reset',
  'Monthly / Rolling Reset',
  'As Needed / Opportunistic'
];

// Reset Window Lead Time options - NEW
const RESET_LEAD_TIME_OPTIONS = [
  '3 Months',
  '6 Months',
  '9 Months',
  '12 Months'
];

// Affected Categories options - NEW
const AFFECTED_CATEGORIES = [
  'Cordials',
  'Gin',
  'NAM Whiskey',
  'Rum',
  'RTD',
  'RTS',
  'Scotch',
  'Tequila',
  'Vodka',
  'Whiskey Other',
  'Non-Alc'
];

// Months for Reset Window multi-select - NEW
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper function to get alert option label
const getAlertOptionLabel = (option: 'same_day' | 'day_before' | 'week_before'): string => {
  switch (option) {
    case 'same_day':
      return 'Same Day (0 days before)';
    case 'day_before':
      return 'Day Before (1 day before)';
    case 'week_before':
      return 'Week Before (7 days before)';
  }
};


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
    resetFrequency: '',
    resetWindowLeadTime: '',
    resetWindowMonths: [],
    affectedCategories: [],
    hasDifferentResetWindows: '',
    categoryResetWindows: [],
    spiritsOutletsByState: [],
    categoryCaptain: 'none',
    categoryAdvisor: 'none',
    isJBP: false,
    lastJBPDate: '',
    nextJBPDate: '',
    nextJBPAlert: false,
    nextJBPAlertOptions: [],
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
    // HQ Level of Influence fields - default to 'none'
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

  // Banner/Buying Offices state - Load from account if editing
  const [bannerBuyingOffices, setBannerBuyingOffices] = useState<BannerBuyingOffice[]>(() => {
    if (account?.bannerBuyingOffices && Array.isArray(account.bannerBuyingOffices)) {
      return account.bannerBuyingOffices;
    }
    return [];
  });
  const [showBannerSection, setShowBannerSection] = useState(() => {
    return account?.bannerBuyingOffices && account.bannerBuyingOffices.length > 0;
  });

  // Track expanded/collapsed state for each Banner/Buying Office
  const [expandedBanners, setExpandedBanners] = useState<Set<string>>(() => {
    // New banners start expanded, existing ones start collapsed
    return new Set();
  });

  // Track the original ticker symbol to detect when a new one is added
  const [originalTickerSymbol, setOriginalTickerSymbol] = useState<string>(account?.tickerSymbol || '');

  // Use the market data hook
  const { marketData, loading, error, fetchMarketData, clearMarketData } = useAlphaVantage();

  // Filter contacts for this account
  const accountContacts = account ? contacts.filter(contact => contact.accountId === account.id) : [];

  // JBP validation error state
  const [jbpValidationError, setJbpValidationError] = useState<string>('');

  // Validate JBP Customer and Next JBP date - UPDATED TO CHECK FOR FUTURE DATE
  useEffect(() => {
    if (formData.isJBP) {
      if (!formData.nextJBPDate || formData.nextJBPDate.trim() === '') {
        setJbpValidationError('Please input the Next JBP date when JBP Customer is selected');
      } else {
        // Check if the date is in the future
        const selectedDate = new Date(formData.nextJBPDate);
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
  }, [formData.isJBP, formData.nextJBPDate]);

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

  // State outlets by state - UPDATED to track outlets for ALL selected states
  const [stateOutlets, setStateOutlets] = useState<StateOutlet[]>(() => {
    if (formData.spiritsOutletsByState && Array.isArray(formData.spiritsOutletsByState)) {
      return formData.spiritsOutletsByState;
    }
    return [];
  });

  // Update stateOutlets when selectedStates changes - UPDATED to work for ANY number of states
  useEffect(() => {
    if (selectedStates.length > 0) {
      // Create state outlets for all selected states
      const newStateOutlets = selectedStates.map(state => {
        const existing = stateOutlets.find(so => so.state === state);
        return existing || { state, outletCount: '' };
      });
      setStateOutlets(newStateOutlets);
    } else {
      setStateOutlets([]);
    }
  }, [selectedStates]);

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

  // Handle reset window months multi-select - NEW
  const [selectedResetMonths, setSelectedResetMonths] = useState<string[]>(() => {
    if (!formData.resetWindowMonths) return [];
    
    if (Array.isArray(formData.resetWindowMonths)) {
      return formData.resetWindowMonths;
    }
    
    return [];
  });

  // Handle affected categories multi-select - NEW
  const [selectedAffectedCategories, setSelectedAffectedCategories] = useState<string[]>(() => {
    if (!formData.affectedCategories) return [];
    
    if (Array.isArray(formData.affectedCategories)) {
      return formData.affectedCategories;
    }
    
    return [];
  });

  // Handle category reset windows - NEW
  const [categoryResetWindows, setCategoryResetWindows] = useState<CategoryResetWindow[]>(() => {
    if (formData.categoryResetWindows && Array.isArray(formData.categoryResetWindows)) {
      return formData.categoryResetWindows;
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
   * Handle Add Banner/Buying Office button click
   */
  const handleAddBannerBuyingOffice = () => {
    const newBanner: BannerBuyingOffice = {
      id: Date.now().toString(),
      accountName: '',
      address: '',
      website: '',
      channel: '',
      footprint: '',
      operatingStates: [],
      allSpiritsOutlets: '',
      // Strategy and Capabilities defaults
      influenceAssortmentShelf: 'none',
      influencePricePromo: 'none',
      influenceDisplayMerchandising: 'none',
      influenceDigital: 'none',
      influenceEcommerce: 'none',
      influenceInStoreEvents: 'none',
      influenceShrinkManagement: 'none',
      influenceBuyingPOOwnership: 'none',
      isJBP: false,
      lastJBPDate: '',
      nextJBPDate: '',
      pricingStrategy: 'none',
      privateLabel: 'none',
      displayMandates: 'none',
      ecommerceMaturityLevel: 'none',
      ecommerceSalesPercentage: '',
      fulfillmentTypes: [],
      ecommercePartners: [],
      innovationAppetite: '',
      fullProofOutlets: '',
      categoryCaptain: 'none',
      categoryAdvisor: 'none',
      hasPlanograms: false,
      planogramWrittenBy: '',
      resetFrequency: '',
      resetWindowLeadTime: '',
      resetWindowMonths: [],
      affectedCategories: [],
      hasDifferentResetWindows: '',
      categoryResetWindows: [],
      // Additional Information defaults
      strategicPriorities: '',
      keyCompetitors: '',
      designatedCharities: '',
      customerEvents: []
    };
    setBannerBuyingOffices(prev => [...prev, newBanner]);
    setShowBannerSection(true);
    // New banners start expanded
    setExpandedBanners(prev => new Set(prev).add(newBanner.id));
  };

  /**
   * Toggle expand/collapse for a Banner/Buying Office
   */
  const toggleBannerExpanded = (bannerId: string) => {
    setExpandedBanners(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bannerId)) {
        newSet.delete(bannerId);
      } else {
        newSet.add(bannerId);
      }
      return newSet;
    });
  };

  /**
   * Update Banner/Buying Office field
   */
  const updateBannerField = (id: string, field: keyof BannerBuyingOffice, value: unknown) => {
    setBannerBuyingOffices(prev =>
      prev.map(banner => banner.id === id ? { ...banner, [field]: value } : banner)
    );
  };

  /**
   * Remove Banner/Buying Office
   */
  const removeBannerBuyingOffice = (id: string) => {
    setBannerBuyingOffices(prev => prev.filter(banner => banner.id !== id));
    // Remove from expanded set
    setExpandedBanners(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  /**
   * Toggle state for Banner/Buying Office
   */
  const toggleBannerState = (bannerId: string, state: string) => {
    setBannerBuyingOffices(prev =>
      prev.map(banner => {
        if (banner.id === bannerId) {
          const states = banner.operatingStates.includes(state)
            ? banner.operatingStates.filter(s => s !== state)
            : [...banner.operatingStates, state].sort();
          return { ...banner, operatingStates: states };
        }
        return banner;
      })
    );
  };

  /**
   * Toggle fulfillment type for Banner/Buying Office
   */
  const toggleBannerFulfillmentType = (bannerId: string, type: string) => {
    setBannerBuyingOffices(prev =>
      prev.map(banner => {
        if (banner.id === bannerId) {
          const types = banner.fulfillmentTypes.includes(type)
            ? banner.fulfillmentTypes.filter(t => t !== type)
            : [...banner.fulfillmentTypes, type];
          return { ...banner, fulfillmentTypes: types };
        }
        return banner;
      })
    );
  };

  /**
   * Toggle e-commerce partner for Banner/Buying Office
   */
  const toggleBannerEcommercePartner = (bannerId: string, partner: string) => {
    setBannerBuyingOffices(prev =>
      prev.map(banner => {
        if (banner.id === bannerId) {
          const partners = banner.ecommercePartners.includes(partner)
            ? banner.ecommercePartners.filter(p => p !== partner)
            : [...banner.ecommercePartners, partner];
          return { ...banner, ecommercePartners: partners };
        }
        return banner;
      })
    );
  };

  /**
   * Toggle reset month for Banner/Buying Office
   */
  const toggleBannerResetMonth = (bannerId: string, month: string) => {
    setBannerBuyingOffices(prev =>
      prev.map(banner => {
        if (banner.id === bannerId) {
          const months = banner.resetWindowMonths.includes(month)
            ? banner.resetWindowMonths.filter(m => m !== month)
            : [...banner.resetWindowMonths, month];
          return { ...banner, resetWindowMonths: months };
        }
        return banner;
      })
    );
  };

  /**
   * Toggle affected category for Banner/Buying Office
   */
  const toggleBannerAffectedCategory = (bannerId: string, category: string) => {
    setBannerBuyingOffices(prev =>
      prev.map(banner => {
        if (banner.id === bannerId) {
          const categories = banner.affectedCategories.includes(category)
            ? banner.affectedCategories.filter(c => c !== category)
            : [...banner.affectedCategories, category];
          return { ...banner, affectedCategories: categories };
        }
        return banner;
      })
    );
  };

  /**
   * Add category reset window for Banner/Buying Office
   */
  const addBannerCategoryResetWindow = (bannerId: string) => {
    setBannerBuyingOffices(prev =>
      prev.map(banner => {
        if (banner.id === bannerId) {
          const newCategoryWindow: CategoryResetWindow = {
            id: Date.now().toString(),
            category: '',
            months: []
          };
          return { ...banner, categoryResetWindows: [...banner.categoryResetWindows, newCategoryWindow] };
        }
        return banner;
      })
    );
  };

  /**
   * Update category reset window for Banner/Buying Office
   */
  const updateBannerCategoryResetWindow = (bannerId: string, categoryId: string, field: 'category', value: string) => {
    setBannerBuyingOffices(prev =>
      prev.map(banner => {
        if (banner.id === bannerId) {
          return {
            ...banner,
            categoryResetWindows: banner.categoryResetWindows.map(crw =>
              crw.id === categoryId ? { ...crw, [field]: value } : crw
            )
          };
        }
        return banner;
      })
    );
  };

  /**
   * Toggle category month for Banner/Buying Office
   */
  const toggleBannerCategoryMonth = (bannerId: string, categoryId: string, month: string) => {
    setBannerBuyingOffices(prev =>
      prev.map(banner => {
        if (banner.id === bannerId) {
          return {
            ...banner,
            categoryResetWindows: banner.categoryResetWindows.map(crw => {
              if (crw.id === categoryId) {
                const months = crw.months.includes(month)
                  ? crw.months.filter(m => m !== month)
                  : [...crw.months, month];
                return { ...crw, months };
              }
              return crw;
            })
          };
        }
        return banner;
      })
    );
  };

  /**
   * Remove category reset window for Banner/Buying Office
   */
  const removeBannerCategoryResetWindow = (bannerId: string, categoryId: string) => {
    setBannerBuyingOffices(prev =>
      prev.map(banner => {
        if (banner.id === bannerId) {
          return {
            ...banner,
            categoryResetWindows: banner.categoryResetWindows.filter(crw => crw.id !== categoryId)
          };
        }
        return banner;
      })
    );
  };

  /**
   * Add customer event for Banner/Buying Office
   */
  const addBannerCustomerEvent = (bannerId: string) => {
    setBannerBuyingOffices(prev =>
      prev.map(banner => {
        if (banner.id === bannerId) {
          const newEvent: CustomerEvent = {
            id: Date.now().toString(),
            title: '',
            date: '',
            alertEnabled: false,
            alertOptions: []
          };
          return { ...banner, customerEvents: [...banner.customerEvents, newEvent] };
        }
        return banner;
      })
    );
  };

  /**
   * Update customer event for Banner/Buying Office
   */
  const updateBannerCustomerEvent = (bannerId: string, eventId: string, field: 'title' | 'date', value: string) => {
    setBannerBuyingOffices(prev =>
      prev.map(banner => {
        if (banner.id === bannerId) {
          return {
            ...banner,
            customerEvents: banner.customerEvents.map(event =>
              event.id === eventId ? { ...event, [field]: value } : event
            )
          };
        }
        return banner;
      })
    );
  };

  /**
   * Remove customer event for Banner/Buying Office
   */
  const removeBannerCustomerEvent = (bannerId: string, eventId: string) => {
    setBannerBuyingOffices(prev =>
      prev.map(banner => {
        if (banner.id === bannerId) {
          return {
            ...banner,
            customerEvents: banner.customerEvents.filter(event => event.id !== eventId)
          };
        }
        return banner;
      })
    );
  };

  /**
   * Save individual Banner/Buying Office
   */
  const saveBannerBuyingOffice = (bannerId: string) => {
    const banner = bannerBuyingOffices.find(b => b.id === bannerId);
    if (!banner) return;

    // Validate required fields
    if (!banner.accountName || banner.accountName.trim() === '') {
      alert('Please enter a Banner/Buying Office Name');
      return;
    }

    // Validate JBP if selected
    if (banner.isJBP) {
      if (!banner.nextJBPDate || banner.nextJBPDate.trim() === '') {
        alert('Please input the Next JBP date when JBP Customer is selected for this Banner/Buying Office');
        return;
      }
      
      const selectedDate = new Date(banner.nextJBPDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        alert('Next JBP date must be a future date for this Banner/Buying Office');
        return;
      }
    }

    // Collapse the banner after saving
    setExpandedBanners(prev => {
      const newSet = new Set(prev);
      newSet.delete(bannerId);
      return newSet;
    });

    alert(`Banner/Buying Office "${banner.accountName}" saved successfully!`);
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
    
    // Validate JBP Customer and Next JBP date - UPDATED TO CHECK FOR FUTURE DATE
    if (formData.isJBP) {
      if (!formData.nextJBPDate || formData.nextJBPDate.trim() === '') {
        alert('Please input the Next JBP date when JBP Customer is selected');
        return;
      }
      
      // Check if the date is in the future
      const selectedDate = new Date(formData.nextJBPDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      
      if (selectedDate < today) {
        alert('Next JBP date must be a future date');
        return;
      }
    }
    
    const updatedFormData = {
      ...formData,
      operatingStates: selectedStates,
      bannerBuyingOffices: bannerBuyingOffices, // Include Banner/Buying Offices
      totalBuyingOffices: bannerBuyingOffices.length.toString(), // Auto-calculate based on number of buying offices
      spiritsOutletsByState: stateOutlets,
      fulfillmentTypes: selectedFulfillmentTypes,
      ecommercePartners: selectedEcommercePartners,
      resetWindowMonths: selectedResetMonths,
      affectedCategories: selectedAffectedCategories,
      categoryResetWindows: categoryResetWindows,
      customerEvents: customerEvents,
      nextJBPAlert: formData.nextJBPAlert,
      nextJBPAlertOptions: formData.nextJBPAlertOptions,
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

  const updateStateOutletCount = (state: string, count: string) => {
    setStateOutlets(prev => 
      prev.map(so => so.state === state ? { ...so, outletCount: count } : so)
    );
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

  const toggleResetMonth = (month: string) => {
    setSelectedResetMonths(prev => {
      if (prev.includes(month)) {
        return prev.filter(m => m !== month);
      } else {
        return [...prev, month];
      }
    });
  };

  const selectAllResetMonths = () => {
    if (selectedResetMonths.length === MONTHS.length) {
      setSelectedResetMonths([]);
    } else {
      setSelectedResetMonths([...MONTHS]);
    }
  };

  const toggleAffectedCategory = (category: string) => {
    setSelectedAffectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const selectAllAffectedCategories = () => {
    if (selectedAffectedCategories.length === AFFECTED_CATEGORIES.length) {
      setSelectedAffectedCategories([]);
    } else {
      setSelectedAffectedCategories([...AFFECTED_CATEGORIES]);
    }
  };

  const addCategoryResetWindow = () => {
    const newCategoryWindow: CategoryResetWindow = {
      id: Date.now().toString(),
      category: '',
      months: []
    };
    setCategoryResetWindows(prev => [...prev, newCategoryWindow]);
  };

  const updateCategoryResetWindow = (id: string, field: 'category', value: string) => {
    setCategoryResetWindows(prev => 
      prev.map(crw => 
        crw.id === id ? { ...crw, [field]: value } : crw
      )
    );
  };

  const toggleCategoryMonth = (categoryId: string, month: string) => {
    setCategoryResetWindows(prev => 
      prev.map(crw => {
        if (crw.id === categoryId) {
          const months = crw.months.includes(month)
            ? crw.months.filter(m => m !== month)
            : [...crw.months, month];
          return { ...crw, months };
        }
        return crw;
      })
    );
  };

  const selectAllCategoryMonths = (categoryId: string) => {
    setCategoryResetWindows(prev => 
      prev.map(crw => {
        if (crw.id === categoryId) {
          const allSelected = crw.months.length === MONTHS.length;
          return { ...crw, months: allSelected ? [] : [...MONTHS] };
        }
        return crw;
      })
    );
  };

  const removeCategoryResetWindow = (id: string) => {
    setCategoryResetWindows(prev => prev.filter(crw => crw.id !== id));
  };

  const addCustomerEvent = () => {
    const newEvent: CustomerEvent = {
      id: Date.now().toString(),
      title: '',
      date: '',
      alertEnabled: false,
      alertOptions: []
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

  const toggleEventAlert = (id: string) => {
    setCustomerEvents(prev =>
      prev.map(event =>
        event.id === id ? { ...event, alertEnabled: !event.alertEnabled } : event
      )
    );
  };




  const handleToggleJBPAlertOption = (option: 'same_day' | 'day_before' | 'week_before') => {
    const currentOptions = formData.nextJBPAlertOptions || [];
    const newOptions = currentOptions.includes(option)
      ? currentOptions.filter(o => o !== option)
      : [...currentOptions, option];
    updateField('nextJBPAlertOptions', newOptions);
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
  const isAllResetMonthsSelected = selectedResetMonths.length === MONTHS.length;
  const isAllAffectedCategoriesSelected = selectedAffectedCategories.length === AFFECTED_CATEGORIES.length;

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
                title="Fetch market data from Alpha Vantage API"
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
                🔄 Fetching market data from Alpha Vantage API...
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
          <div>
            <Label htmlFor="channel" className="text-sm font-medium">Channel</Label>
            <Select value={formData.channel || ''} onValueChange={(value) => updateField('channel', value === 'clear' ? '' : value)}>
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
            <Label htmlFor="footprint" className="text-sm font-medium">Channel Mapping</Label>
            <Select value={formData.footprint || ''} onValueChange={(value) => updateField('footprint', value === 'clear' ? '' : value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select channel mapping" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                <SelectItem value="National Retailer">National Retailer</SelectItem>
                <SelectItem value="Regional Retailer">Regional Retailer</SelectItem>
                <SelectItem value="Single State Retailer">Single State Retailer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Spirits Operating States (enter number of spirits outlets in state upon selecting state)</Label>
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
            <div className="p-3 border rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-5 gap-3">
                {US_STATES.map(state => {
                  const isSelected = selectedStates.includes(state);
                  const stateOutlet = stateOutlets.find(so => so.state === state);
                  
                  return (
                    <div key={state} className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`state-${state}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleState(state)}
                        />
                        <Label htmlFor={`state-${state}`} className="text-sm cursor-pointer font-medium whitespace-nowrap">
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
          {/* Market Snapshot Section - NEW */}
          {marketData && formData.tickerSymbol && (
            <div className="sm:col-span-2 mt-4 pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Market Snapshot - {marketData.name} ({marketData.symbol})
                </Label>
                <span className="text-xs text-gray-500">
                  Last updated: {new Date(marketData.lastUpdated).toLocaleString()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                {/* Current Price */}
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Current Price
                  </Label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ${parseFloat(marketData.currentPrice).toFixed(2)}
                  </p>
                  <p className={`text-xs font-medium mt-1 ${parseFloat(marketData.percentChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(marketData.percentChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(marketData.percentChange)).toFixed(2)}%
                  </p>
                </div>

                {/* Market Cap */}
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Label className="text-xs font-medium text-gray-600">Market Cap</Label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ${(parseFloat(marketData.marketCap) / 1000000000).toFixed(2)}B
                  </p>
                </div>

                {/* Day High */}
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Label className="text-xs font-medium text-gray-600">Day High</Label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ${parseFloat(marketData.highPrice).toFixed(2)}
                  </p>
                </div>

                {/* Day Low */}
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Label className="text-xs font-medium text-gray-600">Day Low</Label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ${parseFloat(marketData.lowPrice).toFixed(2)}
                  </p>
                </div>

                {/* Open Price */}
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Label className="text-xs font-medium text-gray-600">Open</Label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ${parseFloat(marketData.openPrice).toFixed(2)}
                  </p>
                </div>

                {/* Previous Close */}
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Label className="text-xs font-medium text-gray-600">Prev Close</Label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ${parseFloat(marketData.previousClose).toFixed(2)}
                  </p>
                </div>

                {/* 52 Week High */}
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Label className="text-xs font-medium text-gray-600">52W High</Label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ${parseFloat(marketData.fiftyTwoWeekHigh).toFixed(2)}
                  </p>
                </div>

                {/* 52 Week Low */}
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Label className="text-xs font-medium text-gray-600">52W Low</Label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ${parseFloat(marketData.fiftyTwoWeekLow).toFixed(2)}
                  </p>
                </div>

                {/* PEG Ratio */}
                {marketData.pegRatio && parseFloat(marketData.pegRatio) > 0 && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <Label className="text-xs font-medium text-gray-600">PEG Ratio</Label>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {parseFloat(marketData.pegRatio).toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Annual Sales */}
                {marketData.annualSales && parseFloat(marketData.annualSales) > 0 && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <Label className="text-xs font-medium text-gray-600">Annual Revenue</Label>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      ${(parseFloat(marketData.annualSales) / 1000000000).toFixed(2)}B
                    </p>
                  </div>
                )}

                {/* Dividend Yield */}
                {marketData.dividendYield && parseFloat(marketData.dividendYield) > 0 && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <Label className="text-xs font-medium text-gray-600">Div Yield</Label>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {(parseFloat(marketData.dividendYield) * 100).toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Data provided by Alpha Vantage API in {marketData.currency}
              </p>
            </div>
          )}
        </CardContent>

        <div className="space-y-4 pt-4 border-t px-6 pb-6">
          <div>
            <Label htmlFor="executionReliabilityScore" className="text-sm font-medium">Execution Reliability Score</Label>
            <Select 
              value={formData.executionReliabilityScore || ''} 
              onValueChange={(value) => updateField('executionReliabilityScore', value === 'clear' ? '' : value)}
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
            <Label htmlFor="executionReliabilityRationale" className="text-sm font-medium">Rationale/Notes (Optional)</Label>
            <Textarea
              id="executionReliabilityRationale"
              value={formData.executionReliabilityRationale || ''}
              onChange={(e) => updateField('executionReliabilityRationale', e.target.value)}
              placeholder="Add any additional context or notes about execution reliability..."
              className="mt-1 min-h-[80px]"
            />
          </div>
        </div>
      </Card>

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
            </Label>
            <AddressAutocomplete
              value={formData.address}
              onChange={(address) => updateField('address', address)}
              placeholder="Start typing address..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Start typing to see address suggestions. Your selection will be saved automatically.
            </p>
          </div>
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

        </CardContent>
      </Card>

      {/* Strategy and Capabilities Section - keeping rest of form unchanged */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Target className="w-4 h-4 sm:w-5 sm:h-5" />
            Strategy and Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* HQ Level of Influence */}
          <div>
            <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              HQ Level of Influence
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium">Assortment / Shelf</Label>
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
                <Label className="text-xs font-medium">Price / Promo</Label>
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
                <Label className="text-xs font-medium">Display / Merchandising</Label>
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
                <Label className="text-xs font-medium">Digital</Label>
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
                <Label className="text-xs font-medium">eCommerce</Label>
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
                <Label className="text-xs font-medium">In Store Events</Label>
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
                <Label className="text-xs font-medium">Shrink Management</Label>
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
                <Label className="text-xs font-medium">Buying / PO Ownership</Label>
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

          <div className="border-t pt-4"></div>

          {/* Other Strategy Fields */}
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
              <Label className="text-xs font-medium">Pricing Strategy</Label>
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
              <Label className="text-xs font-medium">Private Label</Label>
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
              <Label className="text-xs font-medium">Are Displays Mandated</Label>
              <Select 
                value={formData.displayMandates || 'none'} 
                onValueChange={(value) => updateField('displayMandates', value)}
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
          </div>

          {formData.isJBP && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium">Last JBP</Label>
                  <Input
                    type="date"
                    value={formatDateForInput(formData.lastJBPDate || '')}
                    onChange={(e) => updateField('lastJBPDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Next JBP *</Label>
                  <Input
                    type="date"
                    value={formatDateForInput(formData.nextJBPDate || '')}
                    onChange={(e) => updateField('nextJBPDate', e.target.value)}
                    className="mt-1"
                  />
                  {jbpValidationError && (
                    <p className="text-xs text-red-600 mt-1">{jbpValidationError}</p>
                  )}
                </div>
              </div>
              
              {/* Alert Section */}
              <div className="space-y-3 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orange-600" />
                    <Label htmlFor="nextjbp-alert" className="text-sm font-medium cursor-pointer">
                      Enable Alert
                    </Label>
                  </div>
                  <Switch
                    id="nextjbp-alert"
                    checked={formData.nextJBPAlert || false}
                    onCheckedChange={(checked) => updateField('nextJBPAlert', checked)}
                  />
                </div>
                
                {formData.nextJBPAlert && (
                  <div className="space-y-2 pl-6">
                    <Label className="text-sm text-gray-600">
                      Alert me:
                    </Label>
                    <div className="space-y-2">
                      {(['same_day', 'day_before', 'week_before'] as const).map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`jbp-${option}`}
                            checked={(formData.nextJBPAlertOptions || []).includes(option)}
                            onCheckedChange={() => handleToggleJBPAlertOption(option)}
                          />
                          <Label
                            htmlFor={`jbp-${option}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {getAlertOptionLabel(option)}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {(formData.nextJBPAlertOptions || []).length > 0 && (
                      <p className="text-xs text-gray-500">
                        You'll receive {(formData.nextJBPAlertOptions || []).length} alert{(formData.nextJBPAlertOptions || []).length !== 1 ? 's' : ''} for this date
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
            <Label className="text-xs font-medium">% of Sales Coming From E-Commerce:</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.ecommerceSalesPercentage}
                onChange={(e) => updateField('ecommerceSalesPercentage', e.target.value)}
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
                {FULFILLMENT_TYPES.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`fulfillment-${type}`}
                      checked={selectedFulfillmentTypes.includes(type)}
                      onCheckedChange={() => toggleFulfillmentType(type)}
                    />
                    <Label htmlFor={`fulfillment-${type}`} className="text-xs cursor-pointer">
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
                {ECOMMERCE_PARTNERS.map(partner => (
                  <div key={partner} className="flex items-center space-x-2">
                    <Checkbox
                      id={`partner-${partner}`}
                      checked={selectedEcommercePartners.includes(partner)}
                      onCheckedChange={() => toggleEcommercePartner(partner)}
                    />
                    <Label htmlFor={`partner-${partner}`} className="text-xs cursor-pointer">
                      {partner}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Innovation Appetite</Label>
            <Select 
              value={formData.innovationAppetite?.toString() || ''} 
              onValueChange={(value) => updateField('innovationAppetite', value === 'clear' ? '' : value)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Category Captain</Label>
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
              <Label className="text-xs font-medium">Category Validator</Label>
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

          {/* Planogram Section */}
          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="hasPlanograms"
              checked={formData.hasPlanograms}
              onCheckedChange={(checked) => updateField('hasPlanograms', checked as boolean)}
            />
            <Label htmlFor="hasPlanograms" className="text-sm font-medium">Has Planogram</Label>
          </div>

          {formData.hasPlanograms && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
              <Label className="text-sm font-medium block flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Planogram Information
              </Label>
              
              {/* Affected Categories */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Affected Categories</Label>
                <div className="p-3 border rounded-lg bg-white">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AFFECTED_CATEGORIES.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedAffectedCategories.includes(category)}
                          onCheckedChange={() => toggleAffectedCategory(category)}
                        />
                        <Label htmlFor={`category-${category}`} className="text-xs cursor-pointer">
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
                  value={formData.resetFrequency || ''} 
                  onValueChange={(value) => updateField('resetFrequency', value === 'clear' ? '' : value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select reset frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                    {RESET_FREQUENCY_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-medium">Reset Window Lead Time Requirement</Label>
                <Select 
                  value={formData.resetWindowLeadTime || ''} 
                  onValueChange={(value) => updateField('resetWindowLeadTime', value === 'clear' ? '' : value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select lead time requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                    {RESET_LEAD_TIME_OPTIONS.map(option => (
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
                  value={formData.hasDifferentResetWindows || ""} 
                  onValueChange={(value) => updateField("hasDifferentResetWindows", value === "clear" ? "" : value)}
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
              {formData.hasDifferentResetWindows !== 'Yes' && (
                <div>
                  <Label className="text-xs font-medium mb-2 block">Reset Window</Label>
                  <div className="p-3 border rounded-lg bg-white">
                    <div className="grid grid-cols-6 gap-2">
                      {MONTHS.map(month => (
                        <div key={month} className="flex items-center space-x-1">
                          <Checkbox
                            id={`month-${month}`}
                            checked={selectedResetMonths.includes(month)}
                            onCheckedChange={() => toggleResetMonth(month)}
                          />
                          <Label htmlFor={`month-${month}`} className="text-xs cursor-pointer">
                            {month}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {formData.hasDifferentResetWindows === 'Yes' && (
                <div className="space-y-3 p-3 bg-white border border-gray-300 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Category-Specific Reset Windows</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCategoryResetWindow}
                      className="flex items-center gap-1 h-7"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </Button>
                  </div>

                  {categoryResetWindows.map((crw, idx) => (
                    <div key={crw.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-medium text-gray-600">Window #{idx + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategoryResetWindow(crw.id)}
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
                            onValueChange={(value) => updateCategoryResetWindow(crw.id, 'category', value === 'clear' ? '' : value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="clear" className="text-gray-500 italic">Clear selection</SelectItem>
                              {selectedAffectedCategories.length > 0 ? (
                                selectedAffectedCategories.map(category => (
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
                              {MONTHS.map(month => (
                                <div key={month} className="flex items-center space-x-1">
                                  <Checkbox
                                    id={`crw-${crw.id}-${month}`}
                                    checked={crw.months.includes(month)}
                                    onCheckedChange={() => toggleCategoryMonth(crw.id, month)}
                                  />
                                  <Label htmlFor={`crw-${crw.id}-${month}`} className="text-xs cursor-pointer">
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
        </CardContent>
      </Card>

      {/* Additional Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-medium">Customer Strategic Priorities</Label>
            <Textarea
              value={formData.strategicPriorities}
              onChange={(e) => updateField('strategicPriorities', e.target.value)}
              placeholder="Enter strategic priorities"
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Key Competitors</Label>
            <Textarea
              value={formData.keyCompetitors}
              onChange={(e) => updateField('keyCompetitors', e.target.value)}
              placeholder="Enter key competitors"
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Designated Charities</Label>
            <Textarea
              value={formData.designatedCharities || ''}
              onChange={(e) => updateField('designatedCharities', e.target.value)}
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
                onClick={addCustomerEvent}
                className="flex items-center gap-1 h-7"
              >
                <Plus className="w-3 h-3" />
                Add Event
              </Button>
            </div>
            
            {customerEvents.length === 0 ? (
              <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                <Calendar className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                <p className="text-xs">No customer events added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {customerEvents.map((event, eventIdx) => (
                  <div key={event.id} className="p-2 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-medium text-gray-600">Event #{eventIdx + 1}</Label>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Event Title</Label>
                        <Input
                          value={event.title}
                          onChange={(e) => updateCustomerEvent(event.id, 'title', e.target.value)}
                          placeholder="e.g., Annual Review Meeting"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Event Date</Label>
                        <Input
                          type="date"
                          value={formatDateForInput(event.date)}
                          onChange={(e) => updateCustomerEvent(event.id, 'date', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    {/* Alert Section for Customer Events */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-orange-600" />
                            <Label htmlFor={`event-alert-${event.id}`} className="text-sm font-medium cursor-pointer">
                              Enable Alert
                            </Label>
                          </div>
                          <Switch
                            id={`event-alert-${event.id}`}
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
                              {(['same_day', 'day_before', 'week_before'] as const).map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`event-${event.id}-${option}`}
                                    checked={(event.alertOptions || []).includes(option)}
                                    onCheckedChange={() => handleToggleEventAlertOption(event.id, option)}
                                  />
                                  <Label
                                    htmlFor={`event-${event.id}-${option}`}
                                    className="text-sm font-normal cursor-pointer"
                                  >
                                    {getAlertOptionLabel(option)}
                                  </Label>
                                </div>
                              ))}
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
        </CardContent>
      </Card>

      {/* Banner/Buying Offices Section - UPDATED WITH COLLAPSED VIEW */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              Banner/Buying Offices ({bannerBuyingOffices.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddBannerBuyingOffice}
                className="flex items-center gap-2"
              >
                <Building className="w-4 h-4" />
                Add a Banner/Buying Office
              </Button>
              {bannerBuyingOffices.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBannerSection(!showBannerSection)}
                  className="flex items-center gap-1"
                >
                  {showBannerSection ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Collapse All
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Expand All
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {showBannerSection && bannerBuyingOffices.length > 0 && (
          <CardContent className="space-y-4">
            {bannerBuyingOffices.map((banner, index) => {
              const isExpanded = expandedBanners.has(banner.id);
              
              return (
                <div key={banner.id}>
                  {isExpanded ? (
                    // Expanded view - show full form
                    <BannerBuyingOfficeCard
                      banner={banner}
                      index={index}
                      parentAccountName={formData.accountName}
                      usStates={US_STATES}
                      fulfillmentTypes={FULFILLMENT_TYPES}
                      ecommercePartners={ECOMMERCE_PARTNERS}
                      affectedCategories={AFFECTED_CATEGORIES}
                      resetFrequencyOptions={RESET_FREQUENCY_OPTIONS}
                      resetLeadTimeOptions={RESET_LEAD_TIME_OPTIONS}
                      months={MONTHS}
                      onUpdateField={updateBannerField}
                      onToggleState={toggleBannerState}
                      onToggleFulfillmentType={toggleBannerFulfillmentType}
                      onToggleEcommercePartner={toggleBannerEcommercePartner}
                      onToggleResetMonth={toggleBannerResetMonth}
                      onToggleAffectedCategory={toggleBannerAffectedCategory}
                      onAddCategoryResetWindow={addBannerCategoryResetWindow}
                      onUpdateCategoryResetWindow={updateBannerCategoryResetWindow}
                      onToggleCategoryMonth={toggleBannerCategoryMonth}
                      onRemoveCategoryResetWindow={removeBannerCategoryResetWindow}
                      onAddCustomerEvent={addBannerCustomerEvent}
                      onUpdateCustomerEvent={updateBannerCustomerEvent}
                      onRemoveCustomerEvent={removeBannerCustomerEvent}
                      onSave={saveBannerBuyingOffice}
                      onRemove={removeBannerBuyingOffice}
                      formatDateForInput={formatDateForInput}
                    />
                  ) : (
                    // Collapsed view - show only name with expand/edit button
                    <Card className="bg-white border-purple-200 hover:border-purple-300 transition-colors">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <Building className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {banner.accountName || `Banner/Buying Office #${index + 1}`}
                              </p>
                              {banner.channel && (
                                <p className="text-sm text-gray-600">{banner.channel}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => toggleBannerExpanded(banner.id)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBannerBuyingOffice(banner.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBannerExpanded(banner.id)}
                              className="flex items-center gap-1"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}
          </CardContent>
        )}
      </Card>

      {/* Contacts Section - keeping existing code */}
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