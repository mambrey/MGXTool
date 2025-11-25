export interface CustomerEvent {
  id: string;
  title: string;
  date: string;
}

export interface CategoryResetWindow {
  id: string;
  category: string;
  months: string[];
}

export interface BannerBuyingOffice {
  id: string;
  isSaved?: boolean;
  accountName: string;
  address: string;
  website: string;
  channel: string;
  footprint: string;
  operatingStates: string[];
  spiritsOutletsByState?: { state: string; outletCount: string }[];
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

export interface Account {
  id: string;
  accountName: string;
  industry: string;
  accountStatus: 'Active' | 'Inactive' | 'Prospect';
  accountOwner: string;
  vp?: string;
  revenue?: number;
  employees?: number;
  website?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  channel?: string;
  footprint?: string;
  operatingStates?: string[]; // Change to array
  spiritsOutletsByState?: { state: string; outletCount: string }[]; // NEW: State-specific outlet counts
  executionReliabilityScore?: string;
  executionReliabilityRationale?: string;
  publiclyTraded?: boolean;
  tickerSymbol?: string;
  parentCompany?: string;
  primaryContactId?: string; // Add primary contact field
  totalBuyingOffices?: string; // Add total buying offices field
  // Market Snapshot - Basic fields
  currentPrice?: string;
  percentChange?: string;
  highPrice?: string;
  lowPrice?: string;
  openPrice?: string;
  previousClose?: string;
  marketCap?: string;
  // Financial API fields
  pegRatio?: string;
  annualSales?: string;
  dividendYield?: string;
  fiftyTwoWeekLow?: string;
  fiftyTwoWeekHigh?: string;
  // Databricks fields
  percentOfGeneralMarket?: string;
  sales52Weeks?: string;
  sales12Weeks?: string;
  sales4Weeks?: string;
  // Strategy and Capabilities fields
  categoryCaptain?: string;
  categoryAdvisor?: string;
  pricingStrategy?: string; // Changed from boolean to string for dropdown
  privateLabel?: string; // UPDATED: Changed from boolean to string for dropdown (High/Medium/Low)
  innovationAppetite?: string | number; // UPDATED: Support both string (High/Medium/Low) and number for backward compatibility
  ecommerceMaturityLevel?: string; // UPDATED: Changed from hasEcommerce (boolean) to ecommerceMaturityLevel (string) for dropdown
  ecommerceSalesPercentage?: string; // NEW: % of Sales Coming From E-Commerce
  ecommercePartners?: string[]; // NEW: Primary E-Commerce Partners (multi-select)
  isJBP?: boolean;
  lastJBPDate?: string;
  nextJBPDate?: string;
  nextJBPAlert?: boolean;
  nextJBPAlertDays?: number;
  hasPlanograms?: boolean;
  planogramWrittenBy?: string; // NEW: Author of the planogram
  // NEW: Planogram Reset Configuration fields
  resetFrequency?: string; // Annual Reset, Bi-Annual Reset, Quarterly Reset, Monthly / Rolling Reset, As Needed / Opportunistic
  resetWindowLeadTime?: string; // 3 Months, 6 Months, 9 Months, 12 Months
  resetWindowMonths?: string[]; // Selected months for reset window
  affectedCategories?: string[]; // NEW: Affected Categories multi-select
  hasDifferentResetWindows?: string; // NEW: Yes/No for different reset windows per category
  categoryResetWindows?: { id: string; category: string; months: string[] }[]; // NEW: Category-specific reset windows
  displayMandates?: string; // UPDATED: Changed from boolean to string for dropdown (All/Some/None)
  fulfillmentTypes?: string[]; // UPDATED: Changed to array for multi-select dropdown
  allSpiritsOutlets?: string; // UPDATED: Changed from spiritsOutlets to allSpiritsOutlets
  fullProofOutlets?: string; // NEW: Full proof outlets field
  // Reset window fields
  resetWindowQ1?: string;
  resetWindowQ2?: string;
  resetWindowQ3?: string;
  resetWindowQ4?: string;
  resetWindowSpring?: string;
  resetWindowSummer?: string;
  resetWindowFall?: string;
  resetWindowWinter?: string;
  // Strategic information
  strategicPriorities?: string;
  keyCompetitors?: string;
  designatedCharities?: string; // NEW: Designated charities field
  customerEvents?: CustomerEvent[];
  // Level of Influence fields
  influenceAssortmentShelf?: string;
  influencePricePromo?: string;
  influenceDisplayMerchandising?: string;
  influenceDigital?: string;
  influenceEcommerce?: string;
  influenceInStoreEvents?: string;
  influenceShrinkManagement?: string;
  influenceBuyingPOOwnership?: string;
  // Banner/Buying Offices - NEW
  bannerBuyingOffices?: BannerBuyingOffice[];
  createdAt: string;
  lastModified: string;
}

export interface Contact {
  id: string;
  firstName: string;
  preferredFirstName?: string; // NEW: Preferred first name field
  lastName: string;
  headshot?: string; // NEW: Headshot image URL or file path
  email: string;
  officePhone?: string;
  mobilePhone?: string;
  preferredContactMethod?: 'email' | 'mobile phone' | 'office phone' | 'text';
  preferredShippingAddress?: string; // NEW: Preferred shipping address field
  title?: string;
  currentRoleTenure?: string; // NEW: Current role tenure field
  managerId?: string; // ID of the manager contact (for reporting hierarchy)
  accountId?: string;
  isPrimaryContact?: boolean; // UPDATED: Changed from contactType to isPrimaryContact boolean
  contactActiveStatus?: 'Active' | 'Inactive'; // NEW: Contact active status field
  birthday?: string;
  birthdayAlert?: boolean;
  birthdayAlertDays?: number;
  relationshipStatus?: 'Promoter' | 'Supporter' | 'Neutral' | 'Detractor' | 'At Risk'; // UPDATED: Changed to specific dropdown values
  categorySegmentOwnership?: string[]; // NEW: Multi-select for category/segment ownership
  // Responsibility Levels - NEW
  responsibilityLevels?: {
    influenceLevelResponsibility?: string;
    assortmentShelf?: string;
    displayMerchandising?: string;
    pricePromo?: string;
    digital?: string;
    ecommerce?: string;
    instoreEvents?: string;
    shrink?: string;
    buyingPOOwnership?: string;
  };
  lastContactDate?: string;
  nextContactDate?: string;
  nextContactAlert?: boolean;
  nextContactAlertDays?: number;
  socialHandles?: string[];
  knownPreferences?: string;
  entertainment?: string; // NEW: Entertainment dropdown (Yes/No)
  decisionBiasProfile?: string; // NEW: Decision Bias Profile dropdown
  followThrough?: string; // NEW: Follow Through dropdown (High/Medium/Low)
  notes?: string;
  values?: string; // NEW: Values free text
  painPoints?: string; // NEW: Pain Points free text
  uploadedNotes?: Array<{
    id: string;
    content: string;
    timestamp: string;
    type: 'text' | 'file';
  }>; // UPDATED: Changed to array of objects
  contactEvents?: CustomerEvent[]; // NEW: Custom events for contacts
  relationshipOwner?: {
    name: string;
    email: string;
    vicePresident: string;
  };
  // Relationship Owner Hierarchy
  director?: string;
  vicePresident?: string;
  seniorVicePresident?: string;
  // Primary Diageo Relationship Owner(s) - UPDATED STRUCTURE
  // Each role now has its own cadence, plus owner info and SVP
  primaryDiageoRelationshipOwners?: {
    ownerName?: string; // NEW: Owner name field
    ownerEmail?: string; // NEW: Owner email field
    svp?: string; // NEW: SVP dropdown field
    sales?: {
      [role: string]: string; // role name -> cadence (e.g., "CEO" -> "Monthly")
    };
    support?: {
      [role: string]: string; // role name -> cadence (e.g., "VP Customer Development" -> "Quarterly")
    };
  };
  // Per-contact notification overrides
  notificationEmail?: string; // Override email for this contact's alerts
  teamsChannelId?: string; // Override Teams channel for this contact's alerts
  createdAt: string;
  lastModified: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee: string;
  dueDate?: string;
  dueDateAlert?: boolean; // Add alert toggle for Power Automate integration
  accountId?: string;
  contactId?: string;
  createdAt: string;
  lastModified: string;
}

// Relationship Owner Directory
export interface RelationshipOwner {
  id: string;
  name: string;
  email: string;
  teamsChannelId?: string; // Teams channel ID for notifications
  teamsChatId?: string; // Personal Teams chat ID
  vicePresident: string;
  department?: string;
  phone?: string;
  notificationPreference?: 'email' | 'teams' | 'both';
  createdAt: string;
  lastModified: string;
}