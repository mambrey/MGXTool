import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Building2, MapPin, Calendar, Target, CheckSquare, Square, Globe, Plus, Trash2, RefreshCw, Users, Mail, Phone, Briefcase, Building, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLoadScript } from '@react-google-maps/api';
import type { Account, Contact, BannerBuyingOffice } from '@/types/crm';
import { powerAutomateService, type TickerSymbolData } from '@/services/power-automate';
import { useMarketData } from '@/hooks/useMarketData';
import BannerBuyingOfficeCard from '@/components/BannerBuyingOfficeCard';

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

interface CategoryResetWindow {
  id: string;
  category: string;
  months: string[];
}

interface StateOutlet {
  state: string;
  outletCount: string;
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

  // JBP validation error state
  const [jbpValidationError, setJbpValidationError] = useState<string>('');

  // Auto-check "Publicly Traded" when ticker symbol is populated
  useEffect(() => {
    if (formData.tickerSymbol && formData.tickerSymbol.trim() !== '') {
      if (!formData.publiclyTraded) {
        setFormData(prev => ({ ...prev, publiclyTraded: true }));
      }
    }
  }, [formData.tickerSymbol]);

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

  // State outlets by state - NEW
  const [stateOutlets, setStateOutlets] = useState<StateOutlet[]>(() => {
    if (formData.spiritsOutletsByState && Array.isArray(formData.spiritsOutletsByState)) {
      return formData.spiritsOutletsByState;
    }
    return [];
  });

  // Update stateOutlets when selectedStates changes
  useEffect(() => {
    if (selectedStates.length > 1) {
      // Create state outlets for newly selected states
      const newStateOutlets = selectedStates.map(state => {
        const existing = stateOutlets.find(so => so.state === state);
        return existing || { state, outletCount: '' };
      });
      setStateOutlets(newStateOutlets);
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
  };

  /**
   * Update Banner/Buying Office field
   */
  const updateBannerField = (id: string, field: keyof BannerBuyingOffice, value: any) => {
    setBannerBuyingOffices(prev =>
      prev.map(banner => banner.id === id ? { ...banner, [field]: value } : banner)
    );
  };

  /**
   * Remove Banner/Buying Office
   */
  const removeBannerBuyingOffice = (id: string) => {
    setBannerBuyingOffices(prev => prev.filter(banner => banner.id !== id));
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
            date: ''
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
      spiritsOutletsByState: selectedStates.length > 1 ? stateOutlets : [],
      fulfillmentTypes: selectedFulfillmentTypes,
      ecommercePartners: selectedEcommercePartners,
      resetWindowMonths: selectedResetMonths,
      affectedCategories: selectedAffectedCategories,
      categoryResetWindows: categoryResetWindows,
      customerEvents: customerEvents,
      bannerBuyingOffices: bannerBuyingOffices, // Include Banner/Buying Offices
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

      {/* Rest of the form remains the same - Customer Overview, Parent Information, Strategy and Capabilities, Additional Information sections */}
      {/* ... (keeping all existing form sections from line 1137 to 2296) ... */}
      
      {/* I'll continue with the rest of the component in the next part due to length */}