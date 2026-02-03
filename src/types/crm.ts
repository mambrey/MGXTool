// CRM Types for Account and Contact Management

// Banner/Buying Office type
export interface BannerBuyingOffice {
  id: string;
  accountName: string; // Banner/Buying Office name
  parentAccountId: string; // Reference to parent account
  channel?: string;
  region?: string;
  territory?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  website?: string;
  accountOwner?: string;
  accountOwnerEmail?: string;
  accountStatus?: string;
  annualRevenue?: number;
  numberOfEmployees?: number;
  fiscalYearEnd?: string;
  notes?: string;
  createdAt: string;
  lastModified: string;
  // Banner-specific fields
  affectedSegments?: string[]; // Affected Segments (renamed from affectedCategories)
  topPriorities?: string;
  whatsWorking?: string;
  areasOfOpportunity?: string;
  accountPrioritization?: string;
  buyingPOOwnership?: string;
}

export interface Account {
  id: string;
  accountName: string;
  parentAccountId?: string; // For hierarchy
  industry?: string;
  channel?: string;
  region?: string;
  territory?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  website?: string;
  accountOwner?: string;
  accountOwnerEmail?: string;
  accountStatus?: string;
  annualRevenue?: number;
  numberOfEmployees?: number;
  fiscalYearEnd?: string;
  notes?: string;
  createdAt: string;
  lastModified: string;
  // New fields for enhanced functionality
  affectedSegments?: string[]; // Affected Segments (renamed from affectedCategories)
  topPriorities?: string;
  whatsWorking?: string;
  areasOfOpportunity?: string;
  accountPrioritization?: string;
  buyingPOOwnership?: string;
  // Banner/Buying Offices as children
  bannerBuyingOffices?: BannerBuyingOffice[];
}

// Customer Event type for important dates
export interface CustomerEvent {
  id: string;
  title: string;
  date: string;
  alertEnabled?: boolean;
  alertOptions?: string[];
}

// Uploaded Note type
export interface UploadedNote {
  id: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file';
  fileName?: string;
  fileData?: string;
  fileType?: string;
}

// Primary Diageo Relationship Owner structure
export interface PrimaryDiageoRelationshipOwners {
  ownerTitle?: string;
  ownerName?: string;
  ownerEmail?: string;
  svp?: string;
  sales?: { [role: string]: string }; // role -> cadence
  support?: { [role: string]: string }; // role -> cadence
  salesLastCheckIn?: { [role: string]: string }; // role -> last check-in date
  supportLastCheckIn?: { [role: string]: string }; // role -> last check-in date
}

export interface Contact {
  id: string;
  firstName: string;
  preferredFirstName?: string; // NEW: Preferred first name/nickname
  lastName: string;
  headshot?: string; // Base64 encoded image or URL
  email: string;
  officePhone?: string;
  mobilePhone?: string;
  preferredContactMethod?: string;
  preferredShippingAddress?: string; // NEW: Preferred shipping address
  title?: string;
  currentRoleTenure?: string; // NEW: Current role tenure dropdown
  managerId?: string; // NEW: Reference to manager contact
  accountId?: string;
  bannerBuyingOfficeId?: string; // NEW: Reference to specific banner/buying office
  isPrimaryContact?: boolean;
  contactActiveStatus?: string;
  relationshipStatus?: string;
  categorySegmentOwnership?: string[]; // NEW: Multi-select for categories/segments
  responsibilityLevels?: { [key: string]: string }; // NEW: Responsibility levels for each area
  birthday?: string; // Format: MM-DD
  birthdayAlert?: boolean;
  birthdayAlertOptions?: string[]; // NEW: Multiple alert timing options
  nextContactDate?: string;
  nextContactAlert?: boolean;
  nextContactAlertOptions?: string[]; // NEW: Multiple alert timing options
  lastContactDate?: string;
  linkedinProfile?: string;
  knownPreferences?: string;
  entertainment?: string; // NEW: Allowed to Entertain dropdown
  decisionBiasProfile?: string | string[]; // UPDATED: Decision Bias Profile - now supports multi-select (array) or legacy single-select (string)
  followThrough?: string; // NEW: Follow Through dropdown
  notes?: string;
  values?: string; // NEW: What do they value
  painPoints?: string; // NEW: What are their pain points
  uploadedNotes?: UploadedNote[];
  contactEvents?: CustomerEvent[];
  primaryDiageoRelationshipOwners?: PrimaryDiageoRelationshipOwners;
  createdAt: string;
  lastModified: string;
}

// Market Data Types
export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  dayLow: number;
  dayHigh: number;
  yearLow: number;
  yearHigh: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
}

export interface CompanyProfile {
  symbol: string;
  companyName: string;
  industry: string;
  sector: string;
  description: string;
  ceo: string;
  website: string;
  image: string;
  country: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  fullTimeEmployees: number;
  ipoDate: string;
  exchange: string;
  currency: string;
}

export interface MarketNews {
  symbol: string;
  publishedDate: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
}

export interface SectorPerformance {
  sector: string;
  changesPercentage: string;
}

export interface EarningsCalendar {
  date: string;
  symbol: string;
  eps: number | null;
  epsEstimated: number | null;
  time: string;
  revenue: number | null;
  revenueEstimated: number | null;
  fiscalDateEnding: string;
  updatedFromDate: string;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
  unadjustedVolume: number;
  change: number;
  changePercent: number;
  vwap: number;
  label: string;
  changeOverTime: number;
}

export interface MarketMover {
  symbol: string;
  name: string;
  change: number;
  price: number;
  changesPercentage: number;
}

// Financial Modeling Prep specific types
export interface FMPQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
}

export interface FMPCompanyProfile {
  symbol: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
}