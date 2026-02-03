import React, { useState, useEffect } from 'react';
import { Filter, Download, Settings, Eye, EyeOff, Search, X, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import type { Account, Contact } from '@/types/crm';
import type { ExtendedAccount } from '@/types/crm-extended';
import { saveToStorage, loadFromStorage } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface CombinedAccountContact {
  id: string;
  accountName: string;
  bannerBuyingOffice?: string;
  industry?: string;
  accountStatus?: string;
  accountOwner?: string;
  contactType?: string;
  vp?: string;
  director?: string;
  seniorVicePresident?: string;
  revenue?: number;
  employees?: number;
  website?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  channel?: string;
  footprint?: string;
  operatingStates?: string;
  publiclyTraded?: boolean;
  tickerSymbol?: string;
  parentCompany?: string;
  totalBuyingOffices?: string;
  currentPrice?: string;
  percentChange?: string;
  highPrice?: string;
  lowPrice?: string;
  openPrice?: string;
  previousClose?: string;
  marketCap?: string;
  pegRatio?: string;
  annualSales?: string;
  dividendYield?: string;
  fiftyTwoWeekLow?: string;
  fiftyTwoWeekHigh?: string;
  percentOfGeneralMarket?: string;
  sales52Weeks?: string;
  sales12Weeks?: string;
  sales4Weeks?: string;
  categoryCaptain?: string;
  categoryAdvisor?: string;
  pricingStrategy?: boolean;
  privateLabel?: boolean;
  innovationAppetite?: number;
  hasEcommerce?: boolean;
  isJBP?: boolean;
  lastJBPDate?: string;
  nextJBPDate?: string;
  hasPlanograms?: boolean;
  hqInfluence?: boolean;
  displayMandates?: boolean;
  fulfillmentTypes?: string;
  spiritsOutlets?: string;
  ecommerceSalesPercentage?: string;
  ecommercePartners?: string;
  planogramWrittenBy?: string;
  resetFrequency?: string;
  resetWindowLeadTime?: string;
  resetWindowMonths?: string;
  affectedCategories?: string;
  hasDifferentResetWindows?: string;
  fullProofOutlets?: string;
  designatedCharities?: string;
  nextJBPAlert?: boolean;
  nextJBPAlertDays?: number;
  executionReliabilityScore?: string;
  executionReliabilityRationale?: string;
  allSpiritsOutlets?: string;
  spiritsOutletsByState?: string;
  influenceAssortmentShelf?: string;
  influencePricePromo?: string;
  influenceDisplayMerchandising?: string;
  influenceDigital?: string;
  influenceEcommerce?: string;
  influenceInStoreEvents?: string;
  influenceShrinkManagement?: string;
  influenceBuyingPOOwnership?: string;
  ecommerceMaturityLevel?: string;
  resetWindowQ1?: string;
  resetWindowQ2?: string;
  resetWindowQ3?: string;
  resetWindowQ4?: string;
  resetWindowSpring?: string;
  resetWindowSummer?: string;
  resetWindowFall?: string;
  resetWindowWinter?: string;
  strategicPriorities?: string;
  keyCompetitors?: string;
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactMobile?: string;
  contactOffice?: string;
  contactOwner?: string;
  contactOwnerEmail?: string;
  contactRelationship?: string;
  contactInfluence?: string;
  contactPreferredMethod?: string;
  contactBirthday?: string;
  contactLastContact?: string;
  contactNextContact?: string;
  contactSocial?: string;
  contactPreferences?: string;
  contactNotes?: string;
  linkedinProfile?: string;
  preferredFirstName?: string;
  currentRoleTenure?: string;
  contactActiveStatus?: string;
  categorySegmentOwnership?: string;
  entertainment?: string;
  decisionBiasProfile?: string;
  followThrough?: string;
  values?: string;
  painPoints?: string;
  headshot?: string;
  managerId?: string;
  isPrimaryContact?: boolean;
  birthdayAlertDays?: number;
  nextContactAlertDays?: number;
  secondaryContactCount: number;
  secondaryContactNames?: string;
  totalContacts: number;
  createdAt?: string;
  lastModified?: string;
}

interface ColumnConfig {
  key: keyof CombinedAccountContact;
  label: string;
  visible: boolean;
  type: 'text' | 'badge' | 'number' | 'currency' | 'datetime' | 'boolean' | 'array' | 'percentage' | 'slider';
  filterType?: 'text' | 'select' | 'number';
  width?: string;
}

interface DataViewProps {
  accounts: Account[];
  contacts: Contact[];
  onBack: () => void;
}

const defaultColumns: ColumnConfig[] = [
  { key: 'accountName', label: 'Account Name', visible: true, type: 'text', filterType: 'text' },
  { key: 'bannerBuyingOffice', label: 'Banner/Buying Office', visible: true, type: 'text', filterType: 'text' },
  { key: 'contactName', label: 'Contact', visible: true, type: 'text', filterType: 'text' },
  { key: 'contactType', label: 'Contact Type', visible: true, type: 'badge', filterType: 'select' },
  { key: 'contactTitle', label: 'Contact Title', visible: true, type: 'text', filterType: 'text' },
  { key: 'contactEmail', label: 'Contact Email', visible: true, type: 'text', filterType: 'text' },
  { key: 'contactOwner', label: 'Relationship Owner', visible: true, type: 'text', filterType: 'select' },
  { key: 'contactInfluence', label: 'Influence Level', visible: true, type: 'badge', filterType: 'select' },
  { key: 'totalContacts', label: 'Total Contacts', visible: true, type: 'number', filterType: 'number' },
  { key: 'director', label: 'Director', visible: true, type: 'text', filterType: 'select' },
  { key: 'vp', label: 'Vice President', visible: true, type: 'text', filterType: 'select' },
  { key: 'seniorVicePresident', label: 'Senior Vice President', visible: true, type: 'text', filterType: 'select' },
  { key: 'industry', label: 'Industry', visible: false, type: 'text', filterType: 'text' },
  { key: 'accountStatus', label: 'Account Status', visible: false, type: 'badge', filterType: 'select' },
  { key: 'accountOwner', label: 'Account Owner', visible: false, type: 'text', filterType: 'select' },
  { key: 'revenue', label: 'Revenue', visible: false, type: 'currency', filterType: 'number' },
  { key: 'employees', label: 'Employees', visible: false, type: 'number', filterType: 'number' },
  { key: 'website', label: 'Company Website', visible: false, type: 'text', filterType: 'text' },
  { key: 'address', label: 'HQ Address', visible: false, type: 'text', filterType: 'text' },
  { key: 'phone', label: 'Phone', visible: false, type: 'text', filterType: 'text' },
  { key: 'email', label: 'Email', visible: false, type: 'text', filterType: 'text' },
  { key: 'description', label: 'Description', visible: false, type: 'text', filterType: 'text' },
  { key: 'channel', label: 'Channel', visible: false, type: 'badge', filterType: 'select' },
  { key: 'footprint', label: 'Footprint', visible: false, type: 'text', filterType: 'text' },
  { key: 'operatingStates', label: 'Operating States', visible: false, type: 'array', filterType: 'text' },
  { key: 'publiclyTraded', label: 'Publicly Traded', visible: false, type: 'boolean', filterType: 'select' },
  { key: 'tickerSymbol', label: 'Ticker Symbol', visible: false, type: 'text', filterType: 'text' },
  { key: 'parentCompany', label: 'Parent Company', visible: false, type: 'text', filterType: 'text' },
  { key: 'totalBuyingOffices', label: 'Total Buying Offices', visible: false, type: 'text', filterType: 'text' },
  { key: 'currentPrice', label: 'Current Price', visible: false, type: 'currency', filterType: 'text' },
  { key: 'percentChange', label: 'Percent Change', visible: false, type: 'percentage', filterType: 'text' },
  { key: 'highPrice', label: 'High Price (Day)', visible: false, type: 'currency', filterType: 'text' },
  { key: 'lowPrice', label: 'Low Price (Day)', visible: false, type: 'currency', filterType: 'text' },
  { key: 'openPrice', label: 'Open Price', visible: false, type: 'currency', filterType: 'text' },
  { key: 'previousClose', label: 'Previous Close', visible: false, type: 'currency', filterType: 'text' },
  { key: 'marketCap', label: 'Market Cap', visible: false, type: 'text', filterType: 'text' },
  { key: 'pegRatio', label: 'PEG Ratio', visible: false, type: 'text', filterType: 'text' },
  { key: 'annualSales', label: 'Annual Sales', visible: false, type: 'currency', filterType: 'text' },
  { key: 'dividendYield', label: 'Dividend Yield', visible: false, type: 'percentage', filterType: 'text' },
  { key: 'fiftyTwoWeekLow', label: '52-Week Low', visible: false, type: 'currency', filterType: 'text' },
  { key: 'fiftyTwoWeekHigh', label: '52-Week High', visible: false, type: 'currency', filterType: 'text' },
  { key: 'percentOfGeneralMarket', label: '% of General Market', visible: false, type: 'percentage', filterType: 'text' },
  { key: 'sales52Weeks', label: 'Sales (52 Weeks)', visible: false, type: 'currency', filterType: 'text' },
  { key: 'sales12Weeks', label: 'Sales (12 Weeks)', visible: false, type: 'currency', filterType: 'text' },
  { key: 'sales4Weeks', label: 'Sales (4 Weeks)', visible: false, type: 'currency', filterType: 'text' },
  { key: 'categoryCaptain', label: 'Category Captain', visible: false, type: 'text', filterType: 'text' },
  { key: 'categoryAdvisor', label: 'Category Validator', visible: false, type: 'text', filterType: 'text' },
  { key: 'pricingStrategy', label: 'Pricing Strategy', visible: false, type: 'boolean', filterType: 'select' },
  { key: 'privateLabel', label: 'Private Label', visible: false, type: 'boolean', filterType: 'select' },
  { key: 'innovationAppetite', label: 'Innovation Appetite', visible: false, type: 'slider', filterType: 'number' },
  { key: 'hasEcommerce', label: 'E-Commerce Available', visible: false, type: 'boolean', filterType: 'select' },
  { key: 'ecommerceMaturityLevel', label: 'E-Commerce Maturity Level', visible: false, type: 'text', filterType: 'text' },
  { key: 'ecommerceSalesPercentage', label: '% of Sales From E-Commerce', visible: false, type: 'text', filterType: 'text' },
  { key: 'ecommercePartners', label: 'E-Commerce Partners', visible: false, type: 'array', filterType: 'text' },
  { key: 'isJBP', label: 'Is JBP', visible: false, type: 'boolean', filterType: 'select' },
  { key: 'lastJBPDate', label: 'Last JBP Date', visible: false, type: 'datetime', filterType: 'text' },
  { key: 'nextJBPDate', label: 'Next JBP Date', visible: false, type: 'datetime', filterType: 'text' },
  { key: 'nextJBPAlert', label: 'Next JBP Alert', visible: false, type: 'boolean', filterType: 'select' },
  { key: 'nextJBPAlertDays', label: 'Next JBP Alert Days', visible: false, type: 'number', filterType: 'number' },
  { key: 'hasPlanograms', label: 'Has Planograms', visible: false, type: 'boolean', filterType: 'select' },
  { key: 'planogramWrittenBy', label: 'Planogram Written By', visible: false, type: 'text', filterType: 'text' },
  { key: 'resetFrequency', label: 'Reset Frequency', visible: false, type: 'text', filterType: 'text' },
  { key: 'resetWindowLeadTime', label: 'Reset Window Lead Time', visible: false, type: 'text', filterType: 'text' },
  { key: 'resetWindowMonths', label: 'Reset Window Months', visible: false, type: 'array', filterType: 'text' },
  { key: 'affectedCategories', label: 'Affected Segments', visible: false, type: 'array', filterType: 'text' },
  { key: 'hasDifferentResetWindows', label: 'Different Reset Windows Per Category', visible: false, type: 'text', filterType: 'text' },
  { key: 'hqInfluence', label: 'HQ Influence', visible: false, type: 'boolean', filterType: 'select' },
  { key: 'displayMandates', label: 'Display Mandates', visible: false, type: 'boolean', filterType: 'select' },
  { key: 'fulfillmentTypes', label: 'Fulfillment Types', visible: false, type: 'text', filterType: 'text' },
  { key: 'spiritsOutlets', label: 'Spirits Outlets', visible: false, type: 'text', filterType: 'text' },
  { key: 'allSpiritsOutlets', label: 'All Spirits Outlets', visible: false, type: 'text', filterType: 'text' },
  { key: 'spiritsOutletsByState', label: 'Spirits Outlets By State', visible: false, type: 'array', filterType: 'text' },
  { key: 'fullProofOutlets', label: 'Full Proof Outlets', visible: false, type: 'text', filterType: 'text' },
  { key: 'designatedCharities', label: 'Designated Charities', visible: false, type: 'text', filterType: 'text' },
  { key: 'executionReliabilityScore', label: 'Execution Reliability Score', visible: false, type: 'text', filterType: 'text' },
  { key: 'executionReliabilityRationale', label: 'Execution Reliability Rationale', visible: false, type: 'text', filterType: 'text' },
  { key: 'strategicPriorities', label: 'Strategic Priorities', visible: false, type: 'text', filterType: 'text' },
  { key: 'keyCompetitors', label: 'Key Competitors', visible: false, type: 'text', filterType: 'text' },
  { key: 'influenceAssortmentShelf', label: 'Influence: Assortment/Shelf', visible: false, type: 'text', filterType: 'text' },
  { key: 'influencePricePromo', label: 'Influence: Price/Promo', visible: false, type: 'text', filterType: 'text' },
  { key: 'influenceDisplayMerchandising', label: 'Influence: Display/Merchandising', visible: false, type: 'text', filterType: 'text' },
  { key: 'influenceDigital', label: 'Influence: Digital', visible: false, type: 'text', filterType: 'text' },
  { key: 'influenceEcommerce', label: 'Influence: E-commerce', visible: false, type: 'text', filterType: 'text' },
  { key: 'influenceInStoreEvents', label: 'Influence: In-Store Events', visible: false, type: 'text', filterType: 'text' },
  { key: 'influenceShrinkManagement', label: 'Influence: Shrink Management', visible: false, type: 'text', filterType: 'text' },
  { key: 'influenceBuyingPOOwnership', label: 'Influence: Buying/PO Ownership', visible: false, type: 'text', filterType: 'text' },
  { key: 'resetWindowQ1', label: 'Reset Window Q1', visible: false, type: 'text', filterType: 'text' },
  { key: 'resetWindowQ2', label: 'Reset Window Q2', visible: false, type: 'text', filterType: 'text' },
  { key: 'resetWindowQ3', label: 'Reset Window Q3', visible: false, type: 'text', filterType: 'text' },
  { key: 'resetWindowQ4', label: 'Reset Window Q4', visible: false, type: 'text', filterType: 'text' },
  { key: 'resetWindowSpring', label: 'Reset Window Spring', visible: false, type: 'text', filterType: 'text' },
  { key: 'resetWindowSummer', label: 'Reset Window Summer', visible: false, type: 'text', filterType: 'text' },
  { key: 'resetWindowFall', label: 'Reset Window Fall', visible: false, type: 'text', filterType: 'text' },
  { key: 'resetWindowWinter', label: 'Reset Window Winter', visible: false, type: 'text', filterType: 'text' },
  { key: 'linkedinProfile', label: 'LinkedIn Profile', visible: false, type: 'text', filterType: 'text' },
  { key: 'preferredFirstName', label: 'Preferred First Name', visible: false, type: 'text', filterType: 'text' },
  { key: 'currentRoleTenure', label: 'Current Role Tenure', visible: false, type: 'text', filterType: 'text' },
  { key: 'contactActiveStatus', label: 'Contact Active Status', visible: false, type: 'badge', filterType: 'select' },
  { key: 'categorySegmentOwnership', label: 'Category/Segment Ownership', visible: false, type: 'array', filterType: 'text' },
  { key: 'entertainment', label: 'Allowed to Entertain', visible: false, type: 'text', filterType: 'text' },
  { key: 'decisionBiasProfile', label: 'Decision Bias Profile', visible: false, type: 'text', filterType: 'text' },
  { key: 'followThrough', label: 'Follow Through', visible: false, type: 'text', filterType: 'text' },
  { key: 'values', label: 'What They Value', visible: false, type: 'text', filterType: 'text' },
  { key: 'painPoints', label: 'Pain Points', visible: false, type: 'text', filterType: 'text' },
  { key: 'headshot', label: 'Headshot URL', visible: false, type: 'text', filterType: 'text' },
  { key: 'managerId', label: 'Manager ID', visible: false, type: 'text', filterType: 'text' },
  { key: 'isPrimaryContact', label: 'Is Primary Contact', visible: false, type: 'boolean', filterType: 'select' },
  { key: 'birthdayAlertDays', label: 'Birthday Alert Days', visible: false, type: 'number', filterType: 'number' },
  { key: 'nextContactAlertDays', label: 'Next Contact Alert Days', visible: false, type: 'number', filterType: 'number' },
  { key: 'contactMobile', label: 'Mobile Phone', visible: false, type: 'text', filterType: 'text' },
  { key: 'contactOffice', label: 'Office Phone', visible: false, type: 'text', filterType: 'text' },
  { key: 'contactPreferredMethod', label: 'Preferred Contact Method', visible: false, type: 'text', filterType: 'select' },
  { key: 'contactRelationship', label: 'Relationship Status', visible: false, type: 'badge', filterType: 'select' },
  { key: 'contactBirthday', label: 'Birthday', visible: false, type: 'datetime', filterType: 'text' },
  { key: 'contactLastContact', label: 'Last Contact Date', visible: false, type: 'datetime', filterType: 'text' },
  { key: 'contactNextContact', label: 'Next Contact Date', visible: false, type: 'datetime', filterType: 'text' },
  { key: 'contactSocial', label: 'Social Handles', visible: false, type: 'array', filterType: 'text' },
  { key: 'contactPreferences', label: 'Known Preferences', visible: false, type: 'text', filterType: 'text' },
  { key: 'contactNotes', label: 'Notes', visible: false, type: 'text', filterType: 'text' },
  { key: 'contactOwnerEmail', label: 'Relationship Owner Email', visible: false, type: 'text', filterType: 'text' },
  { key: 'secondaryContactCount', label: 'Secondary Contacts', visible: false, type: 'number', filterType: 'number' },
  { key: 'secondaryContactNames', label: 'Secondary Contact Names', visible: false, type: 'text', filterType: 'text' },
  { key: 'createdAt', label: 'Created Date', visible: false, type: 'datetime', filterType: 'text' },
  { key: 'lastModified', label: 'Last Modified', visible: false, type: 'datetime', filterType: 'text' }
];

export default function DataView({ accounts, contacts, onBack }: DataViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState<keyof CombinedAccountContact | 'all'>('all');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [combinedData, setCombinedData] = useState<CombinedAccountContact[]>([]);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  
  const [openColumnSelect, setOpenColumnSelect] = useState(false);
  const [openChannelSelect, setOpenChannelSelect] = useState(false);
  const [openParentCompanySelect, setOpenParentCompanySelect] = useState(false);
  const [openBannerSelect, setOpenBannerSelect] = useState(false);
  const [openAccountNameSelect, setOpenAccountNameSelect] = useState(false);
  const [openRelationshipOwnerSelect, setOpenRelationshipOwnerSelect] = useState(false);
  const [openContactSelect, setOpenContactSelect] = useState(false);
  const [openInfluenceSelect, setOpenInfluenceSelect] = useState(false);

  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    const savedColumns = loadFromStorage<ColumnConfig[]>('crm-dataview-columns', null);
    if (savedColumns && savedColumns.length === defaultColumns.length) {
      return defaultColumns.map((defaultCol, index) => ({
        ...defaultCol,
        visible: savedColumns[index]?.visible ?? defaultCol.visible
      }));
    }
    return defaultColumns;
  });

  useEffect(() => {
    saveToStorage('crm-dataview-columns', columns);
  }, [columns]);

  useEffect(() => {
    const combined: CombinedAccountContact[] = [];

    accounts.forEach(account => {
      const accountContacts = contacts.filter(c => c.accountId === account.id);
      const extendedAccount = account as ExtendedAccount;
      
      // Get banner/buying offices from account
      const banners = account.bannerBuyingOffices || [];
      
      if (accountContacts.length === 0) {
        // Account with no contacts
        if (banners.length === 0) {
          // No banners either
          combined.push({
            id: account.id,
            accountName: account.accountName,
            bannerBuyingOffice: undefined,
            industry: account.industry,
            accountStatus: account.accountStatus,
            accountOwner: account.accountOwner,
            contactType: undefined,
            vp: account.vp,
            director: undefined,
            seniorVicePresident: undefined,
            revenue: account.revenue,
            employees: account.employees,
            website: account.website,
            address: account.address,
            phone: account.phone,
            email: account.email,
            description: account.description,
            channel: account.channel,
            footprint: account.footprint,
            operatingStates: Array.isArray(account.operatingStates) ? account.operatingStates.join(', ') : account.operatingStates,
            publiclyTraded: account.publiclyTraded,
            tickerSymbol: account.tickerSymbol,
            parentCompany: account.parentCompany,
            totalBuyingOffices: account.totalBuyingOffices,
            currentPrice: extendedAccount.currentPrice,
            percentChange: extendedAccount.percentChange,
            highPrice: extendedAccount.highPrice,
            lowPrice: extendedAccount.lowPrice,
            openPrice: extendedAccount.openPrice,
            previousClose: extendedAccount.previousClose,
            marketCap: extendedAccount.marketCap,
            pegRatio: extendedAccount.pegRatio,
            annualSales: extendedAccount.annualSales,
            dividendYield: extendedAccount.dividendYield,
            fiftyTwoWeekLow: extendedAccount.fiftyTwoWeekLow,
            fiftyTwoWeekHigh: extendedAccount.fiftyTwoWeekHigh,
            percentOfGeneralMarket: extendedAccount.percentOfGeneralMarket,
            sales52Weeks: extendedAccount.sales52Weeks,
            sales12Weeks: extendedAccount.sales12Weeks,
            sales4Weeks: account.sales4Weeks,
            categoryCaptain: account.categoryCaptain,
            categoryAdvisor: account.categoryAdvisor,
            pricingStrategy: extendedAccount.pricingStrategy,
            privateLabel: extendedAccount.privateLabel,
            innovationAppetite: extendedAccount.innovationAppetite,
            hasEcommerce: extendedAccount.hasEcommerce,
            ecommerceMaturityLevel: account.ecommerceMaturityLevel,
            ecommerceSalesPercentage: account.ecommerceSalesPercentage,
            ecommercePartners: Array.isArray(account.ecommercePartners) ? account.ecommercePartners.join(', ') : undefined,
            isJBP: account.isJBP,
            lastJBPDate: account.lastJBPDate,
            nextJBPDate: account.nextJBPDate,
            nextJBPAlert: account.nextJBPAlert,
            nextJBPAlertDays: account.nextJBPAlertDays,
            hasPlanograms: account.hasPlanograms,
            planogramWrittenBy: account.planogramWrittenBy,
            resetFrequency: account.resetFrequency,
            resetWindowLeadTime: account.resetWindowLeadTime,
            resetWindowMonths: Array.isArray(account.resetWindowMonths) ? account.resetWindowMonths.join(', ') : undefined,
            affectedCategories: Array.isArray(account.affectedCategories) ? account.affectedCategories.join(', ') : undefined,
            hasDifferentResetWindows: account.hasDifferentResetWindows,
            hqInfluence: account.hqInfluence,
            displayMandates: account.displayMandates,
            fulfillmentTypes: account.fulfillmentTypes,
            spiritsOutlets: account.spiritsOutlets,
            allSpiritsOutlets: account.allSpiritsOutlets,
            spiritsOutletsByState: Array.isArray(account.spiritsOutletsByState) ? account.spiritsOutletsByState.map(s => `${s.state}: ${s.outletCount}`).join(', ') : undefined,
            fullProofOutlets: account.fullProofOutlets,
            designatedCharities: account.designatedCharities,
            executionReliabilityScore: account.executionReliabilityScore,
            executionReliabilityRationale: account.executionReliabilityRationale,
            influenceAssortmentShelf: account.influenceAssortmentShelf,
            influencePricePromo: account.influencePricePromo,
            influenceDisplayMerchandising: account.influenceDisplayMerchandising,
            influenceDigital: account.influenceDigital,
            influenceEcommerce: account.influenceEcommerce,
            influenceInStoreEvents: account.influenceInStoreEvents,
            influenceShrinkManagement: account.influenceShrinkManagement,
            influenceBuyingPOOwnership: account.influenceBuyingPOOwnership,
            resetWindowQ1: account.resetWindowQ1,
            resetWindowQ2: account.resetWindowQ2,
            resetWindowQ3: account.resetWindowQ3,
            resetWindowQ4: account.resetWindowQ4,
            resetWindowSpring: account.resetWindowSpring,
            resetWindowSummer: account.resetWindowSummer,
            resetWindowFall: account.resetWindowFall,
            resetWindowWinter: account.resetWindowWinter,
            strategicPriorities: extendedAccount.strategicPriorities,
            keyCompetitors: extendedAccount.keyCompetitors,
            contactName: undefined,
            contactTitle: undefined,
            contactEmail: undefined,
            contactMobile: undefined,
            contactOffice: undefined,
            contactOwner: undefined,
            contactOwnerEmail: undefined,
            contactRelationship: undefined,
            contactInfluence: undefined,
            contactPreferredMethod: undefined,
            contactBirthday: undefined,
            contactLastContact: undefined,
            contactNextContact: undefined,
            contactSocial: undefined,
            contactPreferences: undefined,
            contactNotes: undefined,
            linkedinProfile: undefined,
            preferredFirstName: undefined,
            currentRoleTenure: undefined,
            contactActiveStatus: undefined,
            categorySegmentOwnership: undefined,
            entertainment: undefined,
            decisionBiasProfile: undefined,
            followThrough: undefined,
            values: undefined,
            painPoints: undefined,
            headshot: undefined,
            managerId: undefined,
            isPrimaryContact: undefined,
            birthdayAlertDays: undefined,
            nextContactAlertDays: undefined,
            secondaryContactCount: 0,
            secondaryContactNames: undefined,
            totalContacts: 0,
            createdAt: account.createdAt,
            lastModified: account.lastModified
          });
        } else {
          // Has banners but no contacts
          banners.forEach(banner => {
            combined.push({
              id: `${account.id}-banner-${banner.id}`,
              accountName: account.accountName,
              bannerBuyingOffice: banner.accountName,
              industry: account.industry,
              accountStatus: account.accountStatus,
              accountOwner: account.accountOwner,
              contactType: undefined,
              vp: account.vp,
              director: undefined,
              seniorVicePresident: undefined,
              revenue: account.revenue,
              employees: account.employees,
              website: account.website,
              address: account.address,
              phone: account.phone,
              email: account.email,
              description: account.description,
              channel: banner.channel || account.channel,
              footprint: banner.footprint || account.footprint,
              operatingStates: Array.isArray(banner.operatingStates) ? banner.operatingStates.join(', ') : (Array.isArray(account.operatingStates) ? account.operatingStates.join(', ') : account.operatingStates),
              publiclyTraded: account.publiclyTraded,
              tickerSymbol: account.tickerSymbol,
              parentCompany: account.parentCompany,
              totalBuyingOffices: account.totalBuyingOffices,
              currentPrice: extendedAccount.currentPrice,
              percentChange: extendedAccount.percentChange,
              highPrice: extendedAccount.highPrice,
              lowPrice: extendedAccount.lowPrice,
              openPrice: extendedAccount.openPrice,
              previousClose: extendedAccount.previousClose,
              marketCap: extendedAccount.marketCap,
              pegRatio: extendedAccount.pegRatio,
              annualSales: extendedAccount.annualSales,
              dividendYield: extendedAccount.dividendYield,
              fiftyTwoWeekLow: extendedAccount.fiftyTwoWeekLow,
              fiftyTwoWeekHigh: extendedAccount.fiftyTwoWeekHigh,
              percentOfGeneralMarket: extendedAccount.percentOfGeneralMarket,
              sales52Weeks: extendedAccount.sales52Weeks,
              sales12Weeks: extendedAccount.sales12Weeks,
              sales4Weeks: account.sales4Weeks,
              categoryCaptain: banner.categoryCaptain || account.categoryCaptain,
              categoryAdvisor: banner.categoryAdvisor || account.categoryAdvisor,
              pricingStrategy: extendedAccount.pricingStrategy,
              privateLabel: extendedAccount.privateLabel,
              innovationAppetite: extendedAccount.innovationAppetite,
              hasEcommerce: extendedAccount.hasEcommerce,
              ecommerceMaturityLevel: banner.ecommerceMaturityLevel || account.ecommerceMaturityLevel,
              ecommerceSalesPercentage: banner.ecommerceSalesPercentage || account.ecommerceSalesPercentage,
              ecommercePartners: Array.isArray(banner.ecommercePartners) ? banner.ecommercePartners.join(', ') : (Array.isArray(account.ecommercePartners) ? account.ecommercePartners.join(', ') : undefined),
              isJBP: banner.isJBP ?? account.isJBP,
              lastJBPDate: banner.lastJBPDate || account.lastJBPDate,
              nextJBPDate: banner.nextJBPDate || account.nextJBPDate,
              nextJBPAlert: banner.nextJBPAlert ?? account.nextJBPAlert,
              nextJBPAlertDays: account.nextJBPAlertDays,
              hasPlanograms: banner.hasPlanograms ?? account.hasPlanograms,
              planogramWrittenBy: banner.planogramWrittenBy || account.planogramWrittenBy,
              resetFrequency: banner.resetFrequency || account.resetFrequency,
              resetWindowLeadTime: banner.resetWindowLeadTime || account.resetWindowLeadTime,
              resetWindowMonths: Array.isArray(banner.resetWindowMonths) ? banner.resetWindowMonths.join(', ') : (Array.isArray(account.resetWindowMonths) ? account.resetWindowMonths.join(', ') : undefined),
              affectedCategories: Array.isArray(banner.affectedCategories) ? banner.affectedCategories.join(', ') : (Array.isArray(account.affectedCategories) ? account.affectedCategories.join(', ') : undefined),
              hasDifferentResetWindows: banner.hasDifferentResetWindows || account.hasDifferentResetWindows,
              hqInfluence: account.hqInfluence,
              displayMandates: account.displayMandates,
              fulfillmentTypes: Array.isArray(banner.fulfillmentTypes) ? banner.fulfillmentTypes.join(', ') : account.fulfillmentTypes,
              spiritsOutlets: account.spiritsOutlets,
              allSpiritsOutlets: banner.allSpiritsOutlets || account.allSpiritsOutlets,
              spiritsOutletsByState: Array.isArray(banner.spiritsOutletsByState) ? banner.spiritsOutletsByState.map(s => `${s.state}: ${s.outletCount}`).join(', ') : (Array.isArray(account.spiritsOutletsByState) ? account.spiritsOutletsByState.map(s => `${s.state}: ${s.outletCount}`).join(', ') : undefined),
              fullProofOutlets: banner.fullProofOutlets || account.fullProofOutlets,
              designatedCharities: banner.designatedCharities || account.designatedCharities,
              executionReliabilityScore: banner.executionReliabilityScore || account.executionReliabilityScore,
              executionReliabilityRationale: banner.executionReliabilityRationale || account.executionReliabilityRationale,
              influenceAssortmentShelf: banner.influenceAssortmentShelf || account.influenceAssortmentShelf,
              influencePricePromo: banner.influencePricePromo || account.influencePricePromo,
              influenceDisplayMerchandising: banner.influenceDisplayMerchandising || account.influenceDisplayMerchandising,
              influenceDigital: banner.influenceDigital || account.influenceDigital,
              influenceEcommerce: banner.influenceEcommerce || account.influenceEcommerce,
              influenceInStoreEvents: banner.influenceInStoreEvents || account.influenceInStoreEvents,
              influenceShrinkManagement: banner.influenceShrinkManagement || account.influenceShrinkManagement,
              influenceBuyingPOOwnership: banner.influenceBuyingPOOwnership || account.influenceBuyingPOOwnership,
              resetWindowQ1: account.resetWindowQ1,
              resetWindowQ2: account.resetWindowQ2,
              resetWindowQ3: account.resetWindowQ3,
              resetWindowQ4: account.resetWindowQ4,
              resetWindowSpring: account.resetWindowSpring,
              resetWindowSummer: account.resetWindowSummer,
              resetWindowFall: account.resetWindowFall,
              resetWindowWinter: account.resetWindowWinter,
              strategicPriorities: banner.strategicPriorities || extendedAccount.strategicPriorities,
              keyCompetitors: banner.keyCompetitors || extendedAccount.keyCompetitors,
              contactName: undefined,
              contactTitle: undefined,
              contactEmail: undefined,
              contactMobile: undefined,
              contactOffice: undefined,
              contactOwner: undefined,
              contactOwnerEmail: undefined,
              contactRelationship: undefined,
              contactInfluence: undefined,
              contactPreferredMethod: undefined,
              contactBirthday: undefined,
              contactLastContact: undefined,
              contactNextContact: undefined,
              contactSocial: undefined,
              contactPreferences: undefined,
              contactNotes: undefined,
              linkedinProfile: undefined,
              preferredFirstName: undefined,
              currentRoleTenure: undefined,
              contactActiveStatus: undefined,
              categorySegmentOwnership: undefined,
              entertainment: undefined,
              decisionBiasProfile: undefined,
              followThrough: undefined,
              values: undefined,
              painPoints: undefined,
              headshot: undefined,
              managerId: undefined,
              isPrimaryContact: undefined,
              birthdayAlertDays: undefined,
              nextContactAlertDays: undefined,
              secondaryContactCount: 0,
              secondaryContactNames: undefined,
              totalContacts: 0,
              createdAt: account.createdAt,
              lastModified: account.lastModified
            });
          });
        }
      } else {
        // Has contacts
        accountContacts.forEach(contact => {
          const vpFromContact = contact.relationshipOwner?.vicePresident;
          const directorFromContact = contact.relationshipOwner?.director;
          const svpFromContact = contact.relationshipOwner?.seniorVicePresident;
          const vp = vpFromContact || account.vp;

          const secondaryContacts = accountContacts.filter(c => !c.isPrimaryContact);
          const secondaryContactNames = secondaryContacts.map(c => `${c.firstName} ${c.lastName}`).join(', ');

          let operatingStatesString: string | undefined;
          if (account.operatingStates) {
            if (Array.isArray(account.operatingStates)) {
              operatingStatesString = account.operatingStates.join(', ');
            } else if (typeof account.operatingStates === 'string') {
              operatingStatesString = account.operatingStates;
            }
          }

          let socialHandlesString: string | undefined;
          if (contact.socialHandles) {
            if (Array.isArray(contact.socialHandles)) {
              socialHandlesString = contact.socialHandles.join(', ');
            } else if (typeof contact.socialHandles === 'string') {
              socialHandlesString = contact.socialHandles;
            }
          }

          // Get banner for this contact if exists
          const contactBanner = contact.bannerBuyingOfficeId ? banners.find(b => b.id === contact.bannerBuyingOfficeId) : undefined;

          combined.push({
            id: `${account.id}-${contact.id}`,
            accountName: account.accountName,
            bannerBuyingOffice: contactBanner?.accountName,
            industry: account.industry,
            accountStatus: account.accountStatus,
            accountOwner: account.accountOwner,
            contactType: contact.isPrimaryContact ? 'Primary' : 'Secondary',
            vp: vp,
            director: directorFromContact,
            seniorVicePresident: svpFromContact,
            revenue: account.revenue,
            employees: account.employees,
            website: account.website,
            address: account.address,
            phone: account.phone,
            email: account.email,
            description: account.description,
            channel: contactBanner?.channel || account.channel,
            footprint: contactBanner?.footprint || account.footprint,
            operatingStates: operatingStatesString,
            publiclyTraded: account.publiclyTraded,
            tickerSymbol: account.tickerSymbol,
            parentCompany: account.parentCompany,
            totalBuyingOffices: account.totalBuyingOffices,
            currentPrice: extendedAccount.currentPrice,
            percentChange: extendedAccount.percentChange,
            highPrice: extendedAccount.highPrice,
            lowPrice: extendedAccount.lowPrice,
            openPrice: extendedAccount.openPrice,
            previousClose: extendedAccount.previousClose,
            marketCap: extendedAccount.marketCap,
            pegRatio: extendedAccount.pegRatio,
            annualSales: extendedAccount.annualSales,
            dividendYield: extendedAccount.dividendYield,
            fiftyTwoWeekLow: extendedAccount.fiftyTwoWeekLow,
            fiftyTwoWeekHigh: extendedAccount.fiftyTwoWeekHigh,
            percentOfGeneralMarket: extendedAccount.percentOfGeneralMarket,
            sales52Weeks: extendedAccount.sales52Weeks,
            sales12Weeks: extendedAccount.sales12Weeks,
            sales4Weeks: account.sales4Weeks,
            categoryCaptain: contactBanner?.categoryCaptain || account.categoryCaptain,
            categoryAdvisor: contactBanner?.categoryAdvisor || account.categoryAdvisor,
            pricingStrategy: extendedAccount.pricingStrategy,
            privateLabel: extendedAccount.privateLabel,
            innovationAppetite: extendedAccount.innovationAppetite,
            hasEcommerce: extendedAccount.hasEcommerce,
            ecommerceMaturityLevel: contactBanner?.ecommerceMaturityLevel || account.ecommerceMaturityLevel,
            ecommerceSalesPercentage: contactBanner?.ecommerceSalesPercentage || account.ecommerceSalesPercentage,
            ecommercePartners: contactBanner && Array.isArray(contactBanner.ecommercePartners) ? contactBanner.ecommercePartners.join(', ') : (Array.isArray(account.ecommercePartners) ? account.ecommercePartners.join(', ') : undefined),
            isJBP: contactBanner?.isJBP ?? account.isJBP,
            lastJBPDate: contactBanner?.lastJBPDate || account.lastJBPDate,
            nextJBPDate: contactBanner?.nextJBPDate || account.nextJBPDate,
            nextJBPAlert: contactBanner?.nextJBPAlert ?? account.nextJBPAlert,
            nextJBPAlertDays: account.nextJBPAlertDays,
            hasPlanograms: contactBanner?.hasPlanograms ?? account.hasPlanograms,
            planogramWrittenBy: contactBanner?.planogramWrittenBy || account.planogramWrittenBy,
            resetFrequency: contactBanner?.resetFrequency || account.resetFrequency,
            resetWindowLeadTime: contactBanner?.resetWindowLeadTime || account.resetWindowLeadTime,
            resetWindowMonths: contactBanner && Array.isArray(contactBanner.resetWindowMonths) ? contactBanner.resetWindowMonths.join(', ') : (Array.isArray(account.resetWindowMonths) ? account.resetWindowMonths.join(', ') : undefined),
            affectedCategories: contactBanner && Array.isArray(contactBanner.affectedCategories) ? contactBanner.affectedCategories.join(', ') : (Array.isArray(account.affectedCategories) ? account.affectedCategories.join(', ') : undefined),
            hasDifferentResetWindows: contactBanner?.hasDifferentResetWindows || account.hasDifferentResetWindows,
            hqInfluence: account.hqInfluence,
            displayMandates: account.displayMandates,
            fulfillmentTypes: contactBanner && Array.isArray(contactBanner.fulfillmentTypes) ? contactBanner.fulfillmentTypes.join(', ') : account.fulfillmentTypes,
            spiritsOutlets: account.spiritsOutlets,
            allSpiritsOutlets: contactBanner?.allSpiritsOutlets || account.allSpiritsOutlets,
            spiritsOutletsByState: contactBanner && Array.isArray(contactBanner.spiritsOutletsByState) ? contactBanner.spiritsOutletsByState.map(s => `${s.state}: ${s.outletCount}`).join(', ') : (Array.isArray(account.spiritsOutletsByState) ? account.spiritsOutletsByState.map(s => `${s.state}: ${s.outletCount}`).join(', ') : undefined),
            fullProofOutlets: contactBanner?.fullProofOutlets || account.fullProofOutlets,
            designatedCharities: contactBanner?.designatedCharities || account.designatedCharities,
            executionReliabilityScore: contactBanner?.executionReliabilityScore || account.executionReliabilityScore,
            executionReliabilityRationale: contactBanner?.executionReliabilityRationale || account.executionReliabilityRationale,
            influenceAssortmentShelf: contactBanner?.influenceAssortmentShelf || account.influenceAssortmentShelf,
            influencePricePromo: contactBanner?.influencePricePromo || account.influencePricePromo,
            influenceDisplayMerchandising: contactBanner?.influenceDisplayMerchandising || account.influenceDisplayMerchandising,
            influenceDigital: contactBanner?.influenceDigital || account.influenceDigital,
            influenceEcommerce: contactBanner?.influenceEcommerce || account.influenceEcommerce,
            influenceInStoreEvents: contactBanner?.influenceInStoreEvents || account.influenceInStoreEvents,
            influenceShrinkManagement: contactBanner?.influenceShrinkManagement || account.influenceShrinkManagement,
            influenceBuyingPOOwnership: contactBanner?.influenceBuyingPOOwnership || account.influenceBuyingPOOwnership,
            resetWindowQ1: account.resetWindowQ1,
            resetWindowQ2: account.resetWindowQ2,
            resetWindowQ3: account.resetWindowQ3,
            resetWindowQ4: account.resetWindowQ4,
            resetWindowSpring: account.resetWindowSpring,
            resetWindowSummer: account.resetWindowSummer,
            resetWindowFall: account.resetWindowFall,
            resetWindowWinter: account.resetWindowWinter,
            strategicPriorities: contactBanner?.strategicPriorities || extendedAccount.strategicPriorities,
            keyCompetitors: contactBanner?.keyCompetitors || extendedAccount.keyCompetitors,
            contactName: `${contact.firstName} ${contact.lastName}`,
            contactTitle: contact.title,
            contactEmail: contact.email,
            contactMobile: contact.mobilePhone,
            contactOffice: contact.officePhone,
            contactOwner: contact.relationshipOwner?.name || undefined,
            contactOwnerEmail: contact.relationshipOwner?.email,
            contactRelationship: contact.relationshipStatus,
            contactInfluence: contact.responsibilityLevels?.influenceLevelResponsibility,
            contactPreferredMethod: contact.preferredContactMethod,
            contactBirthday: contact.birthday,
            contactLastContact: contact.lastContactDate,
            contactNextContact: contact.nextContactDate,
            contactSocial: socialHandlesString,
            contactPreferences: contact.knownPreferences,
            contactNotes: contact.notes,
            linkedinProfile: contact.linkedinProfile,
            preferredFirstName: contact.preferredFirstName,
            currentRoleTenure: contact.currentRoleTenure,
            contactActiveStatus: contact.contactActiveStatus,
            categorySegmentOwnership: Array.isArray(contact.categorySegmentOwnership) ? contact.categorySegmentOwnership.join(', ') : undefined,
            entertainment: contact.entertainment,
            decisionBiasProfile: contact.decisionBiasProfile,
            followThrough: contact.followThrough,
            values: contact.values,
            painPoints: contact.painPoints,
            headshot: contact.headshot,
            managerId: contact.managerId,
            isPrimaryContact: contact.isPrimaryContact,
            birthdayAlertDays: contact.birthdayAlertDays,
            nextContactAlertDays: contact.nextContactAlertDays,
            secondaryContactCount: secondaryContacts.length,
            secondaryContactNames: secondaryContactNames || undefined,
            totalContacts: accountContacts.length,
            createdAt: account.createdAt,
            lastModified: account.lastModified
          });
        });
      }
    });

    setCombinedData(combined);
  }, [accounts, contacts]);

  const visibleColumns = columns.filter(col => col.visible);

  const getUniqueValues = (key: keyof CombinedAccountContact) => {
    const values = combinedData.map(item => item[key]).filter(Boolean);
    return Array.from(new Set(values as string[])).sort();
  };

  const getUniqueAccountNames = () => getUniqueValues('accountName');
  const getUniqueParentCompanies = () => getUniqueValues('parentCompany');
  const getUniqueBanners = () => getUniqueValues('bannerBuyingOffice');
  const getUniqueContactNames = () => {
    const contactNames = contacts.map(contact => `${contact.firstName} ${contact.lastName}`);
    return Array.from(new Set(contactNames)).sort();
  };
  const getUniqueRelationshipOwners = () => getUniqueValues('contactOwner');
  const getUniqueInfluenceLevels = () => {
    const influences = contacts.map(contact => contact.responsibilityLevels?.influenceLevelResponsibility).filter(Boolean);
    return Array.from(new Set(influences as string[])).sort();
  };

  const filteredData = combinedData.filter(item => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      
      if (searchColumn === 'all') {
        const searchableFields = [
          item.accountName, item.bannerBuyingOffice, item.contactName, item.contactTitle,
          item.contactEmail, item.contactOwner, item.vp, item.director, item.seniorVicePresident,
          item.channel, item.parentCompany, item.contactInfluence
        ];
        if (!searchableFields.some(field => field?.toLowerCase().includes(searchLower))) {
          return false;
        }
      } else {
        const columnValue = item[searchColumn];
        if (!columnValue) return false;
        
        const valueStr = String(columnValue).toLowerCase();
        if (!valueStr.includes(searchLower)) {
          return false;
        }
      }
    }

    for (const [key, value] of Object.entries(activeFilters)) {
      if (value && item[key as keyof CombinedAccountContact] !== value) {
        return false;
      }
    }

    return true;
  });

  const toggleColumn = (columnKey: keyof CombinedAccountContact) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const exportData = () => {
    const csvContent = [
      visibleColumns.map(col => col.label).join(','),
      ...filteredData.map(item => 
        visibleColumns.map(col => {
          const value = item[col.key];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crm-combined-data-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderCellValue = (item: CombinedAccountContact, column: ColumnConfig) => {
    const value = item[column.key];
    
    if (!value && value !== 0 && value !== false) return '-';

    switch (column.type) {
      case 'badge':
        if (column.key === 'contactType') {
          return (
            <Badge variant={value === 'Primary' ? 'default' : 'secondary'}>
              {value}
            </Badge>
          );
        }
        if (column.key === 'accountStatus') {
          return (
            <Badge variant={
              value === 'Active' ? 'default' :
              value === 'Inactive' ? 'destructive' :
              'outline'
            }>
              {value}
            </Badge>
          );
        }
        if (column.key === 'channel') {
          return (
            <Badge variant="secondary" className="text-xs">
              {value}
            </Badge>
          );
        }
        if (column.key === 'contactInfluence') {
          return (
            <Badge variant={
              value === 'Decision Maker' ? 'default' :
              value === 'Influencer' ? 'secondary' :
              'outline'
            }>
              {value}
            </Badge>
          );
        }
        return <Badge variant="outline">{value}</Badge>;
      
      case 'boolean':
        if (column.key === 'publiclyTraded') {
          return (
            <Badge variant={value ? 'default' : 'outline'}>
              {value ? 'Public' : 'Private'}
            </Badge>
          );
        }
        return (
          <Badge variant={value ? 'default' : 'outline'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        );
      
      case 'currency':
        if (typeof value === 'string' && value.startsWith('$')) {
          return value;
        }
        return typeof value === 'number' ? `$${value.toLocaleString()}` : value;
      
      case 'percentage':
        if (typeof value === 'string' && value.includes('%')) {
          return value;
        }
        return typeof value === 'number' ? `${value}%` : `${value}%`;
      
      case 'slider':
        return typeof value === 'number' ? `${value}/10` : value;
      
      case 'datetime':
        if (typeof value === 'string') {
          try {
            return new Date(value).toLocaleDateString();
          } catch {
            return value;
          }
        }
        return value;
      
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      
      case 'array':
        return value || '-';
      
      default:
        return value;
    }
  };

  const searchableColumns = columns.filter(col => 
    col.type === 'text' || col.type === 'array'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold">Combined Data View</h2>
          <p className="text-gray-600">Complete account information with contact details and comprehensive data fields</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={exportData}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Sheet open={isColumnSettingsOpen} onOpenChange={setIsColumnSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Columns ({visibleColumns.length}/{columns.length})
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Column Settings</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-4">Show or hide columns in the data table</p>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-2">
                    {columns.map(column => (
                      <div key={column.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={column.key}
                          checked={column.visible}
                          onCheckedChange={() => toggleColumn(column.key)}
                        />
                        <Label htmlFor={column.key} className="text-sm font-medium flex-1">
                          {column.label}
                        </Label>
                        {column.visible ? (
                          <Eye className="w-4 h-4 text-green-500" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2">Search</Label>
              <div className="flex gap-2">
                <Popover open={openColumnSelect} onOpenChange={setOpenColumnSelect}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openColumnSelect}
                      className="w-[200px] justify-between cursor-pointer hover:bg-accent"
                      type="button"
                    >
                      {searchColumn === 'all' ? 'All Columns' : columns.find(c => c.key === searchColumn)?.label}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search columns..." />
                      <CommandList>
                        <CommandEmpty>No column found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              setSearchColumn('all');
                              setOpenColumnSelect(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                searchColumn === 'all' ? "opacity-100" : "opacity-0"
                              )}
                            />
                            All Columns
                          </CommandItem>
                          {searchableColumns.map(col => (
                            <CommandItem
                              key={col.key}
                              value={col.key}
                              onSelect={() => {
                                setSearchColumn(col.key);
                                setOpenColumnSelect(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  searchColumn === col.key ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {col.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={searchColumn === 'all' ? "Search all fields..." : `Search in ${columns.find(c => c.key === searchColumn)?.label}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Channel Filter */}
              <div>
                <Label className="text-sm font-medium mb-2">Channel</Label>
                <Popover open={openChannelSelect} onOpenChange={setOpenChannelSelect}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openChannelSelect}
                      className="w-full justify-between cursor-pointer hover:bg-accent"
                      type="button"
                    >
                      {activeFilters.channel || 'All Channels'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search channel..." />
                      <CommandList>
                        <CommandEmpty>No channel found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all_channels"
                            onSelect={() => {
                              setActiveFilters(prev => ({ ...prev, channel: '' }));
                              setOpenChannelSelect(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !activeFilters.channel ? "opacity-100" : "opacity-0"
                              )}
                            />
                            All Channels
                          </CommandItem>
                          {getUniqueValues('channel').map(channel => (
                            <CommandItem
                              key={channel}
                              value={channel}
                              onSelect={() => {
                                setActiveFilters(prev => ({ ...prev, channel }));
                                setOpenChannelSelect(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  activeFilters.channel === channel ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {channel}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Parent Company Filter */}
              <div>
                <Label className="text-sm font-medium mb-2">Parent Company</Label>
                <Popover open={openParentCompanySelect} onOpenChange={setOpenParentCompanySelect}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openParentCompanySelect}
                      className="w-full justify-between cursor-pointer hover:bg-accent"
                      type="button"
                    >
                      {activeFilters.parentCompany || 'All Parent Companies'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search parent companies..." />
                      <CommandList>
                        <CommandEmpty>No parent company found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all_parent_companies"
                            onSelect={() => {
                              setActiveFilters(prev => ({ ...prev, parentCompany: '' }));
                              setOpenParentCompanySelect(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !activeFilters.parentCompany ? "opacity-100" : "opacity-0"
                              )}
                            />
                            All Parent Companies
                          </CommandItem>
                          {getUniqueParentCompanies().map(parentCompany => (
                            <CommandItem
                              key={parentCompany}
                              value={parentCompany}
                              onSelect={() => {
                                setActiveFilters(prev => ({ ...prev, parentCompany }));
                                setOpenParentCompanySelect(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  activeFilters.parentCompany === parentCompany ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {parentCompany}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Banner/Buying Office Filter */}
              <div>
                <Label className="text-sm font-medium mb-2">Banner/Buying Office</Label>
                <Popover open={openBannerSelect} onOpenChange={setOpenBannerSelect}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openBannerSelect}
                      className="w-full justify-between cursor-pointer hover:bg-accent"
                      type="button"
                    >
                      {activeFilters.bannerBuyingOffice || 'All Banners'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search banners..." />
                      <CommandList>
                        <CommandEmpty>No banner found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all_banners"
                            onSelect={() => {
                              setActiveFilters(prev => ({ ...prev, bannerBuyingOffice: '' }));
                              setOpenBannerSelect(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !activeFilters.bannerBuyingOffice ? "opacity-100" : "opacity-0"
                              )}
                            />
                            All Banners
                          </CommandItem>
                          {getUniqueBanners().map(banner => (
                            <CommandItem
                              key={banner}
                              value={banner}
                              onSelect={() => {
                                setActiveFilters(prev => ({ ...prev, bannerBuyingOffice: banner }));
                                setOpenBannerSelect(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  activeFilters.bannerBuyingOffice === banner ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {banner}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Account Name Filter */}
              <div>
                <Label className="text-sm font-medium mb-2">Account Name</Label>
                <Popover open={openAccountNameSelect} onOpenChange={setOpenAccountNameSelect}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openAccountNameSelect}
                      className="w-full justify-between cursor-pointer hover:bg-accent"
                      type="button"
                    >
                      {activeFilters.accountName || 'All Accounts'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search accounts..." />
                      <CommandList>
                        <CommandEmpty>No account found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all_accounts"
                            onSelect={() => {
                              setActiveFilters(prev => ({ ...prev, accountName: '' }));
                              setOpenAccountNameSelect(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !activeFilters.accountName ? "opacity-100" : "opacity-0"
                              )}
                            />
                            All Accounts
                          </CommandItem>
                          {getUniqueAccountNames().map(accountName => (
                            <CommandItem
                              key={accountName}
                              value={accountName}
                              onSelect={() => {
                                setActiveFilters(prev => ({ ...prev, accountName }));
                                setOpenAccountNameSelect(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  activeFilters.accountName === accountName ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {accountName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Relationship Owner Filter */}
              <div>
                <Label className="text-sm font-medium mb-2">Relationship Owner</Label>
                <Popover open={openRelationshipOwnerSelect} onOpenChange={setOpenRelationshipOwnerSelect}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openRelationshipOwnerSelect}
                      className="w-full justify-between cursor-pointer hover:bg-accent"
                      type="button"
                    >
                      {activeFilters.contactOwner || 'All Owners'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search owners..." />
                      <CommandList>
                        <CommandEmpty>No owner found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all_owners"
                            onSelect={() => {
                              setActiveFilters(prev => ({ ...prev, contactOwner: '' }));
                              setOpenRelationshipOwnerSelect(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !activeFilters.contactOwner ? "opacity-100" : "opacity-0"
                              )}
                            />
                            All Owners
                          </CommandItem>
                          {getUniqueRelationshipOwners().map(owner => (
                            <CommandItem
                              key={owner}
                              value={owner}
                              onSelect={() => {
                                setActiveFilters(prev => ({ ...prev, contactOwner: owner }));
                                setOpenRelationshipOwnerSelect(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  activeFilters.contactOwner === owner ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {owner}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Contact Filter */}
              <div>
                <Label className="text-sm font-medium mb-2">Contact</Label>
                <Popover open={openContactSelect} onOpenChange={setOpenContactSelect}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openContactSelect}
                      className="w-full justify-between cursor-pointer hover:bg-accent"
                      type="button"
                    >
                      {activeFilters.contactName || 'All Contacts'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search contacts..." />
                      <CommandList>
                        <CommandEmpty>No contact found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all_contacts"
                            onSelect={() => {
                              setActiveFilters(prev => ({ ...prev, contactName: '' }));
                              setOpenContactSelect(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !activeFilters.contactName ? "opacity-100" : "opacity-0"
                              )}
                            />
                            All Contacts
                          </CommandItem>
                          {getUniqueContactNames().map(contactName => (
                            <CommandItem
                              key={contactName}
                              value={contactName}
                              onSelect={() => {
                                setActiveFilters(prev => ({ ...prev, contactName }));
                                setOpenContactSelect(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  activeFilters.contactName === contactName ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {contactName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Influence Level Filter */}
              <div>
                <Label className="text-sm font-medium mb-2">Influence Level</Label>
                <Popover open={openInfluenceSelect} onOpenChange={setOpenInfluenceSelect}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openInfluenceSelect}
                      className="w-full justify-between cursor-pointer hover:bg-accent"
                      type="button"
                    >
                      {activeFilters.contactInfluence || 'All Influence Levels'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search influence..." />
                      <CommandList>
                        <CommandEmpty>No influence level found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all_influences"
                            onSelect={() => {
                              setActiveFilters(prev => ({ ...prev, contactInfluence: '' }));
                              setOpenInfluenceSelect(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !activeFilters.contactInfluence ? "opacity-100" : "opacity-0"
                              )}
                            />
                            All Influence Levels
                          </CommandItem>
                          {getUniqueInfluenceLevels().map(influence => (
                            <CommandItem
                              key={influence}
                              value={influence}
                              onSelect={() => {
                                setActiveFilters(prev => ({ ...prev, contactInfluence: influence }));
                                setOpenInfluenceSelect(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  activeFilters.contactInfluence === influence ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {influence}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {(searchTerm || Object.values(activeFilters).some(v => v)) && (
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t mt-4">
              <span className="text-sm font-medium text-gray-600">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search {searchColumn !== 'all' ? `(${columns.find(c => c.key === searchColumn)?.label})` : ''}: {searchTerm}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSearchTerm('')}
                  />
                </Badge>
              )}
              {Object.entries(activeFilters).map(([key, value]) => value && (
                <Badge key={key} variant="secondary" className="flex items-center gap-1">
                  {columns.find(c => c.key === key)?.label}: {value}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setActiveFilters(prev => ({ ...prev, [key]: '' }))}
                  />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSearchColumn('all');
                  setActiveFilters({});
                }}
              >
                Clear All
              </Button>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {filteredData.length} of {combinedData.length} records
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {visibleColumns.map(column => (
                  <th key={column.key} className="text-left px-4 py-3 text-sm font-semibold">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length} className="px-4 py-8 text-center text-gray-500">
                    No data matches your current filters
                  </td>
                </tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {visibleColumns.map(column => (
                      <td key={column.key} className="px-4 py-3 text-sm">
                        {renderCellValue(item, column)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
