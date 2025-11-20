export interface CustomerEvent {
  id: string;
  title: string;
  date: string;
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
  privateLabel?: boolean;
  innovationAppetite?: number;
  hasEcommerce?: boolean;
  isJBP?: boolean;
  lastJBPDate?: string;
  nextJBPDate?: string;
  hasPlanograms?: boolean;
  planogramWrittenBy?: string; // NEW: Author of the planogram
  hqInfluence?: boolean;
  displayMandates?: boolean;
  fulfillmentTypes?: string;
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
  customerEvents?: CustomerEvent[];
  createdAt: string;
  lastModified: string;
}

export interface Contact {
  id: string;
  firstName: string;
  preferredFirstName?: string; // NEW: Preferred first name field
  lastName: string;
  email: string;
  officePhone?: string;
  mobilePhone?: string;
  preferredContactMethod?: 'email' | 'mobile phone' | 'office phone' | 'text';
  preferredShippingAddress?: string; // NEW: Preferred shipping address field
  title?: string;
  managerId?: string; // ID of the manager contact (for reporting hierarchy)
  accountId?: string;
  isPrimaryContact?: boolean; // UPDATED: Changed from contactType to isPrimaryContact boolean
  birthday?: string;
  birthdayAlert?: boolean;
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
  socialHandles?: string[];
  knownPreferences?: string;
  notes?: string;
  uploadedNotes?: string[];
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