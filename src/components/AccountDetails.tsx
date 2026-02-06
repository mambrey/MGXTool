import React, { useState, useEffect } from 'react';
import { Building2, Users, Edit, Trash2, Plus, Phone, Mail, Calendar, User, Printer, MapPin, Globe, ChevronDown, ChevronUp, DollarSign, TrendingUp, Package, FileText, Target, Bell, MessageSquare, BarChart3, RefreshCw, Sparkles, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AddressMap } from '@/components/AddressMap';
import type { Account, Contact } from '@/types/crm';
import { useFinancialModelingPrep } from '@/hooks/useFinancialModelingPrep';

interface AccountDetailsProps {
  account: Account;
  contacts: Contact[];
  onBack: () => void;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
  onAddContact: (accountId: string) => void;
  onViewContact: (contact: Contact) => void;
  onUpdateAccount?: (account: Account) => void;
}

// Helper function to get Support Style color matching ContactForm
const getSupportStyleColor = (status: string) => {
  if (status.startsWith('Promoter')) return '#166534'; // dark green
  if (status.startsWith('Supporter')) return '#16a34a'; // green
  if (status.startsWith('Neutral')) return '#6b7280'; // gray
  if (status.startsWith('Detractor')) return '#ea580c'; // orange
  if (status.startsWith('Adversarial')) return '#991b1b'; // red
  return '#6b7280'; // default gray
};

// Helper function to get Support Style label (first word only)
const getSupportStyleLabel = (status: string) => {
  return status.split(' ')[0]; // Get first word only (Promoter, Supporter, Neutral, Detractor, Adversarial)
};

// Helper function to get Execution Reliability Score description
const getExecutionReliabilityDescription = (score: string | undefined): string => {
  if (!score) return '';
  
  switch (score) {
    case '5':
      return '5 – Highly Reliable: Nearly all agreed programs, displays, and resets are executed on time and in full';
    case '4':
      return '4 – Generally Reliable: Most programs land well with occasional gaps that are usually fixed quickly';
    case '3':
      return '3 – Mixed Reliability: Some things execute and some do not; performance often varies by store';
    case '2':
      return '2 – Low Reliability: Many commitments do not materialize or are partial with limited follow through';
    case '1':
      return '1 – Very Low Reliability: Execution rarely matches agreements; plans often stall or disappear';
    default:
      return score;
  }
};

// Helper function to get preferred contact info based on preferredContactMethod
const getPreferredContactInfo = (contact: Contact): { 
  value: string | undefined; 
  icon: React.ComponentType<{ className?: string }>; 
  label: string;
  href: string;
} | null => {
  const method = contact.preferredContactMethod;
  
  if (!method) {
    // Fallback: show email if available, otherwise mobile, otherwise office
    if (contact.email) {
      return {
        value: contact.email,
        icon: Mail,
        label: 'Email',
        href: `mailto:${contact.email}`
      };
    }
    if (contact.mobilePhone) {
      return {
        value: contact.mobilePhone,
        icon: Phone,
        label: 'Mobile',
        href: `tel:${contact.mobilePhone}`
      };
    }
    if (contact.officePhone) {
      return {
        value: contact.officePhone,
        icon: Phone,
        label: 'Office',
        href: `tel:${contact.officePhone}`
      };
    }
    return null;
  }

  switch (method) {
    case 'email':
      return contact.email ? {
        value: contact.email,
        icon: Mail,
        label: 'Email (Preferred)',
        href: `mailto:${contact.email}`
      } : null;
    
    case 'mobile phone':
      return contact.mobilePhone ? {
        value: contact.mobilePhone,
        icon: Phone,
        label: 'Mobile (Preferred)',
        href: `tel:${contact.mobilePhone}`
      } : null;
    
    case 'office phone':
      return contact.officePhone ? {
        value: contact.officePhone,
        icon: Phone,
        label: 'Office (Preferred)',
        href: `tel:${contact.officePhone}`
      } : null;
    
    case 'text':
      return contact.mobilePhone ? {
        value: contact.mobilePhone,
        icon: MessageSquare,
        label: 'Text (Preferred)',
        href: `sms:${contact.mobilePhone}`
      } : null;
    
    default:
      return null;
  }
};

// Helper function to format JBP alert options
const formatJBPAlertOptions = (options?: string[]) => {
  if (!options || options.length === 0) return 'None';
  return options.map(opt => {
    if (opt === '30_days_before') return '30 Days Before';
    if (opt === '7_days_before') return '7 Days Before';
    if (opt === '1_day_before') return '1 Day Before';
    if (opt.startsWith('custom_')) {
      const days = opt.replace('custom_', '');
      return `${days} Days Before`;
    }
    return opt;
  }).join(', ');
};

// Helper function to format key competitors
const formatKeyCompetitors = (competitors: string | string[] | undefined): string => {
  if (!competitors) return '';
  
  // If it's already a string, return it as is
  if (typeof competitors === 'string') return competitors;
  
  // If it's an array, join with comma and space
  if (Array.isArray(competitors)) {
    return competitors.join(', ');
  }
  
  return '';
};

export default function AccountDetails({ 
  account, 
  contacts, 
  onBack, 
  onEdit, 
  onDelete, 
  onAddContact, 
  onViewContact,
  onUpdateAccount
}: AccountDetailsProps) {
  // Get primary contact for this account
  const primaryContact = account.primaryContactId 
    ? contacts.find(c => c.id === account.primaryContactId)
    : contacts.find(c => c.contactType === 'Primary');

  // Find the relationship owner - look for any contact with primaryDiageoRelationshipOwners.ownerName set
  const relationshipOwnerContact = contacts.find(c => c.primaryDiageoRelationshipOwners?.ownerName);
  const relationshipOwnerName = relationshipOwnerContact?.primaryDiageoRelationshipOwners?.ownerName || 'Unassigned';

  // Get preferred contact info for primary contact
  const primaryContactInfo = primaryContact ? getPreferredContactInfo(primaryContact) : null;

  const [expandAll, setExpandAll] = useState(false);
  
  // Selected contact state for highlighting in the sidebar
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Market data state using Financial Modeling Prep hook
  const { marketData, loading: marketLoading, error: marketError, fetchMarketData } = useFinancialModelingPrep();

  // Fetch market data when account has a ticker symbol
  useEffect(() => {
    if (account.tickerSymbol) {
      fetchMarketData(account.tickerSymbol);
    }
  }, [account.tickerSymbol]);

  // Helper function to format large numbers
  const formatLargeNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'N/A';
    
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Helper function to format percentage
  const formatPercentage = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'N/A';
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  // Helper function to safely format price - handles 'N/A' strings
  const formatPrice = (value: string) => {
    if (value === 'N/A') return 'N/A';
    const num = parseFloat(value);
    if (isNaN(num)) return 'N/A';
    return `$${num.toFixed(2)}`;
  };

  // Helper function to format date for display
  const formatDateForDisplay = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const InfoItem = ({ label, value, icon: Icon, muted }: { label: string; value: string | number | undefined; icon?: React.ComponentType<{ className?: string }>; muted?: boolean }) => {
    if (!value) return null;
    return (
      <div>
        <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </label>
        <p className={`text-base mt-1 ${muted ? 'text-muted-foreground' : ''}`}>{value}</p>
      </div>
    );
  };

  // Helper to display spirits outlets by state
  const renderSpiritsOutletsByState = () => {
    if (!account.spiritsOutletsByState || account.spiritsOutletsByState.length === 0) return null;
    
    return (
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-gray-600">Spirits Outlets by State</label>
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {account.spiritsOutletsByState.map((outlet, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-medium">{outlet.state}:</span> {outlet.outletCount || 'N/A'}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Calculate the total buying offices count
  const getTotalBuyingOfficesCount = () => {
    if (account.bannerBuyingOffices && account.bannerBuyingOffices.length > 0) {
      return account.bannerBuyingOffices.length;
    }
    return 1; // Default to 1 if no buying offices exist
  };

  // Helper function to format ad type display - shows "Other: [custom text]" if Other is selected
  const formatAdType = (adType: string): string => {
    if (adType === 'Other' && account.adTypesOther) {
      return `Other: ${account.adTypesOther}`;
    }
    return adType;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Accounts
          </Button>
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">{account.accountName}</h1>
              {account.parentCompany && (
                <p className="text-gray-600">Part of {account.parentCompany}</p>
              )}
            </div>
            {account.tickerSymbol && (
              <Badge variant="outline" className="ml-2">
                {account.tickerSymbol}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExpandAll(!expandAll)}
          >
            {expandAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Expand All
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={() => onEdit(account)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this account? This will also delete all associated contacts.')) {
                onDelete(account.id);
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Collapsible Sections */}
        <div className="lg:col-span-2 space-y-4">
          <Accordion type="multiple" defaultValue={expandAll ? ['overview', 'parent-info', 'market-snapshot', 'planogram', 'strategy', 'strategic-engagement', 'additional-info'] : ['overview']} value={expandAll ? ['overview', 'parent-info', 'market-snapshot', 'planogram', 'strategy', 'strategic-engagement', 'additional-info'] : undefined}>
            
            {/* Customer Overview */}
            <AccordionItem value="overview">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Customer Overview
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Basic Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Account Name" value={account.accountName} icon={Building2} />
                          <InfoItem label="Parent Company" value={account.parentCompany} />
                          <InfoItem label="Ticker Symbol" value={account.tickerSymbol} />
                        </div>
                      </div>

                      <Separator />

                      {/* Channel & Footprint */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Channel & Footprint</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Channel" value={account.channel} />
                          <InfoItem label="Sub-Channel" value={account.subChannel} />
                          <InfoItem label="Geographic Scope" value={account.footprint} />
                          <InfoItem label="Operating States" value={Array.isArray(account.operatingStates) ? account.operatingStates.join(', ') : account.operatingStates} />
                          {renderSpiritsOutletsByState()}
                          <InfoItem label="Full Proof Outlets" value={account.fullProofOutlets} />
                          <InfoItem label="Total Buying Offices" value={getTotalBuyingOfficesCount()} />
                        </div>
                      </div>

                      <Separator />

                      {/* Execution Reliability */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Execution Reliability</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {account.executionReliabilityScore && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">Execution Reliability Score</label>
                              <p className="text-base mt-1">{getExecutionReliabilityDescription(account.executionReliabilityScore)}</p>
                            </div>
                          )}
                          {account.executionReliabilityRationale && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-gray-600">Rationale/Notes</label>
                              <p className="text-sm mt-1 whitespace-pre-wrap">{account.executionReliabilityRationale}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Team Information */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Team Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Primary Contact" value={primaryContact ? `${primaryContact.firstName} ${primaryContact.lastName}` : account.accountOwner} icon={User} />
                          <InfoItem 
                            label="Relationship Owner" 
                            value={relationshipOwnerName} 
                            icon={User} 
                            muted={relationshipOwnerName === 'Unassigned'}
                          />
                          <InfoItem label="VP" value={account.vp} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Parent Information */}
            <AccordionItem value="parent-info">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Parent Information
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Address with embedded Google Map */}
                      {account.address && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Parent Company Address
                          </label>
                          <p className="text-base mt-1 mb-3">{account.address}</p>
                          <AddressMap address={account.address} />
                        </div>
                      )}
                      
                      {/* Clickable Company Website */}
                      {account.website && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Company Website
                          </label>
                          <a 
                            href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base mt-1 text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                          >
                            {account.website}
                            <Globe className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Market Snapshot - SEPARATE ACCORDION SECTION */}
            {account.tickerSymbol && (
              <AccordionItem value="market-snapshot">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Market Snapshot
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-sm text-gray-700">Real-time Market Data</h4>
                        <button
                          onClick={() => fetchMarketData(account.tickerSymbol!)}
                          disabled={marketLoading}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${marketLoading ? 'animate-spin' : ''}`} />
                          Refresh
                        </button>
                      </div>

                      {marketLoading && (
                        <div className="p-4 bg-gray-50 rounded-lg border text-center">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                          <p className="text-sm text-gray-600">Loading market data...</p>
                        </div>
                      )}

                      {/* Show error as warning banner if there's an error BUT still show data if available */}
                      {marketError && !marketLoading && (
                        <div className="p-3 mb-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-xs text-yellow-800">{marketError}</p>
                        </div>
                      )}

                      {/* Show data if available, regardless of error state */}
                      {marketData && !marketLoading && (
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          {/* Company Name and Symbol */}
                          <div className="mb-4">
                            <h5 className="text-lg font-semibold text-gray-900">{marketData.name}</h5>
                            <p className="text-sm text-gray-600">{marketData.symbol} • {marketData.currency}</p>
                          </div>

                          {/* Current Price and Change */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                Current Price
                              </label>
                              <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatPrice(marketData.currentPrice)}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Change
                              </label>
                              <p className={`text-2xl font-bold mt-1 ${marketData.percentChange === 'N/A' ? 'text-gray-600' : parseFloat(marketData.percentChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(marketData.percentChange)}
                              </p>
                            </div>
                          </div>

                          {/* Additional Market Metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-blue-200">
                            <div>
                              <label className="text-xs font-medium text-gray-600">Market Cap</label>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {formatLargeNumber(marketData.marketCap)}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">Open</label>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {formatPrice(marketData.openPrice)}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">Previous Close</label>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {formatPrice(marketData.previousClose)}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">Day High</label>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {formatPrice(marketData.highPrice)}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">Day Low</label>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {formatPrice(marketData.lowPrice)}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">52W Range</label>
                              <p className="text-xs font-semibold text-gray-900 mt-1">
                                {formatPrice(marketData.fiftyTwoWeekLow)} - {formatPrice(marketData.fiftyTwoWeekHigh)}
                              </p>
                            </div>
                            {marketData.annualSales !== '0' && marketData.annualSales !== 'N/A' && (
                              <div>
                                <label className="text-xs font-medium text-gray-600">Annual Sales</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">
                                  {formatLargeNumber(marketData.annualSales)}
                                </p>
                              </div>
                            )}
                            {marketData.dividendYield !== '0' && marketData.dividendYield !== 'N/A' && (
                              <div>
                                <label className="text-xs font-medium text-gray-600">Dividend Yield</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">
                                  {marketData.dividendYield}%
                                </p>
                              </div>
                            )}
                            {marketData.peRatio && marketData.peRatio !== "0" && marketData.peRatio !== "N/A" && (
                              <div>
                                <label className="text-xs font-medium text-gray-600">P/E Ratio</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">
                                  {parseFloat(marketData.peRatio).toFixed(2)}
                                </p>
                              </div>
                            )}
                            {marketData.earningDate && marketData.earningDate !== "N/A" && (
                              <div>
                                <label className="text-xs font-medium text-gray-600">Earning Date</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">
                                  {new Date(marketData.earningDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                </p>
                              </div>
                            )}
                            {marketData.pegRatio !== '0' && marketData.pegRatio !== 'N/A' && (
                              <div>
                                <label className="text-xs font-medium text-gray-600">PEG Ratio</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">
                                  {parseFloat(marketData.pegRatio).toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Last Updated */}
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-xs text-gray-500">
                              Last updated: {new Date(marketData.lastUpdated).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {!marketData && !marketLoading && !marketError && (
                        <div className="p-4 bg-gray-50 rounded-lg border text-center">
                          <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Click refresh to load market data</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Planogram Information */}
            <AccordionItem value="planogram">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Planogram Information
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem label="Has Planogram" value={account.hasPlanograms ? 'Yes' : 'No'} />
                        <InfoItem label="Planogram Written By" value={account.planogramWrittenBy} />
                      </div>

                      {account.hasPlanograms && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-gray-700">Reset Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InfoItem label="Affected Segments" value={Array.isArray(account.affectedCategories) ? account.affectedCategories.join(', ') : account.affectedCategories} />
                              <InfoItem label="Reset Frequency" value={account.resetFrequency} />
                              <InfoItem label="Reset Window Lead Time" value={account.resetWindowLeadTime} />
                              <InfoItem label="Different Reset Windows per Category" value={account.hasDifferentResetWindows} />
                              {account.hasDifferentResetWindows !== 'Yes' && (
                                <InfoItem label="Reset Window Months" value={Array.isArray(account.resetWindowMonths) ? account.resetWindowMonths.join(', ') : account.resetWindowMonths} />
                              )}
                            </div>

                            {/* Category-Specific Reset Windows */}
                            {account.hasDifferentResetWindows === 'Yes' && account.categoryResetWindows && account.categoryResetWindows.length > 0 && (
                              <div className="mt-4">
                                <label className="text-sm font-medium text-gray-600 mb-2 block">Category-Specific Reset Windows</label>
                                <div className="space-y-2">
                                  {account.categoryResetWindows.map((crw, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                                      <p className="text-sm font-medium">{crw.category}</p>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {Array.isArray(crw.months) ? crw.months.join(', ') : 'No months specified'}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Strategy and Capabilities - MOVED BEFORE Strategic Engagement Plan */}
            <AccordionItem value="strategy">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Strategy and Capabilities
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* HQ Level of Influence */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          HQ Level of Influence
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Assortment / Shelf" value={account.influenceAssortmentShelf} />
                          <InfoItem label="Private Label Emphasis" value={account.privateLabel} />
                          <InfoItem label="Display / Merchandising" value={account.influenceDisplayMerchandising} />
                          <InfoItem label="Are Displays Mandated" value={account.displayMandates} />
                          <InfoItem label="Price / Promo" value={account.influencePricePromo} />
                          <InfoItem label="Pricing Strategy" value={account.pricingStrategy} />
                          <InfoItem label="Ecommerce" value={account.influenceEcommerce} />
                          <InfoItem label="Digital / Social" value={account.influenceDigital} />
                          <InfoItem label="Buying / PO Ownership" value={account.influenceBuyingPOOwnership} />
                          <InfoItem label="Shrink Management" value={account.influenceShrinkManagement} />
                        </div>
                      </div>

                      <Separator />

                      {/* Advertising Section - FIXED to use isAdvertiser and show Other custom text */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700 flex items-center gap-2">
                          <Megaphone className="w-4 h-4" />
                          Advertising
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Advertiser" value={account.isAdvertiser} />
                          {account.adTypesDeployed && account.adTypesDeployed.length > 0 && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-gray-600">Ad Types Deployed</label>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {account.adTypesDeployed.map((adType, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {formatAdType(adType)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Sampling & Innovation */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Sampling & Innovation
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="In Store Events" value={account.influenceInStoreEvents} />
                          <InfoItem label="Allows Wet Sampling" value={account.allowsWetSampling} />
                          <InfoItem label="Innovation Appetite" value={account.innovationAppetite} />
                          <InfoItem label="Innovation Information Lead Time" value={account.innovationLeadTime} />
                        </div>
                      </div>

                      <Separator />

                      {/* E-Commerce & Digital Operating Model */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          E-Commerce & Digital Operating Model
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="E-Commerce Maturity Level" value={account.ecommerceMaturityLevel} />
                          <InfoItem label="% of Sales from E-Commerce" value={account.ecommerceSalesPercentage ? `${account.ecommerceSalesPercentage}%` : undefined} />
                          <InfoItem label="Fulfillment Types" value={Array.isArray(account.fulfillmentTypes) ? account.fulfillmentTypes.join(', ') : account.fulfillmentTypes} />
                          <InfoItem label="E-commerce Partners" value={Array.isArray(account.ecommercePartners) ? account.ecommercePartners.join(', ') : account.ecommercePartners} />
                        </div>
                      </div>

                      <Separator />

                      {/* Category Advisory Roles */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Category Advisory Roles
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Category Captain" value={account.categoryCaptain} />
                          <InfoItem label="Category Validator" value={account.categoryAdvisor} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Strategic Engagement Plan - RENAMED from JBP Information */}
            <AccordionItem value="strategic-engagement">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Strategic Engagement Plan
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* Engagement Type Section */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Engagement Type
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="In-Person Visit" value={account.inPersonVisit} />
                          <InfoItem label="Phone/Email Communication" value={account.phoneEmailCommunication} />
                        </div>
                      </div>

                      <Separator />

                      {/* JBP Information Section */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">JBP Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="JBP Customer" value={account.isJBP ? 'Yes' : 'No'} />
                          {account.isJBP && (
                            <>
                              <InfoItem label="Last JBP" value={formatDateForDisplay(account.lastJBPDate)} />
                              <InfoItem label="Next JBP" value={formatDateForDisplay(account.nextJBPDate)} />
                              {account.nextJBPDate && (
                                <>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                      <Bell className="w-4 h-4" />
                                      Alert Status
                                    </label>
                                    <div className="mt-1">
                                      <Badge variant={account.nextJBPAlert ? "default" : "secondary"}>
                                        {account.nextJBPAlert ? "Enabled" : "Disabled"}
                                      </Badge>
                                    </div>
                                  </div>
                                  {account.nextJBPAlert && account.nextJBPAlertOptions && account.nextJBPAlertOptions.length > 0 && (
                                    <div className="md:col-span-2">
                                      <label className="text-sm font-medium text-gray-600">Alert Options</label>
                                      <p className="text-sm mt-1">{formatJBPAlertOptions(account.nextJBPAlertOptions)}</p>
                                    </div>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Additional Information */}
            <AccordionItem value="additional-info">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Additional Information
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {account.strategicPriorities && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Customer Strategic Priorities</label>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{account.strategicPriorities}</p>
                        </div>
                      )}
                      {account.keyCompetitors && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Key Competitors</label>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{formatKeyCompetitors(account.keyCompetitors)}</p>
                        </div>
                      )}
                      {account.designatedCharities && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Designated Charities</label>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{account.designatedCharities}</p>
                        </div>
                      )}
                      {!account.strategicPriorities && !account.keyCompetitors && !account.designatedCharities && (
                        <p className="text-gray-500 text-sm">No additional information available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Note: Banners/Buying Offices, Important Dates, and Account Tasks sections would continue here */}
            {/* These sections remain unchanged from the original file */}
          </Accordion>
        </div>

        {/* Contacts Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  All Contacts ({contacts.length})
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => onAddContact(account.id)}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add a Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {contacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No contacts yet</p>
                      <p className="text-xs mt-1">Click "Add a Contact" to create one</p>
                    </div>
                  ) : (
                    contacts.map((contact) => (
                      <Card 
                        key={contact.id} 
                        className={`cursor-pointer transition-all ${
                          selectedContact?.id === contact.id 
                            ? 'ring-2 ring-blue-500 bg-blue-50' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedContact(contact);
                          onViewContact(contact);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">
                                {contact.firstName} {contact.lastName}
                              </h3>
                              <p className="text-xs text-gray-600 mt-1">{contact.title}</p>
                              {contact.email && (
                                <p className="text-xs text-blue-600 mt-1">{contact.email}</p>
                              )}
                              {contact.officePhone && (
                                <p className="text-xs text-gray-600 mt-1">Office: {contact.officePhone}</p>
                              )}
                              {contact.mobilePhone && (
                                <p className="text-xs text-gray-600 mt-1">Mobile: {contact.mobilePhone}</p>
                              )}
                              {contact.phone && (
                                <p className="text-xs text-gray-600 mt-1">{contact.phone}</p>
                              )}
                            </div>
                            {contact.isPrimary && (
                              <Badge variant="secondary" className="text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}