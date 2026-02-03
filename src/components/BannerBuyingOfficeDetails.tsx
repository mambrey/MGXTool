import React from 'react';
import { Building, MapPin, Globe, Calendar, Target, Package, Truck, TrendingUp, ShoppingCart, FileText, User, Mail, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AddressMap } from '@/components/AddressMap';
import type { BannerBuyingOffice, Contact } from '@/types/crm';

interface BannerBuyingOfficeDetailsProps {
  banner: BannerBuyingOffice;
  accountName: string;
  accountId: string;
  contacts: Contact[];
  onBack: () => void;
  onViewContact?: (contact: Contact) => void;
}

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

export default function BannerBuyingOfficeDetails({ 
  banner, 
  accountName, 
  accountId,
  contacts,
  onBack,
  onViewContact 
}: BannerBuyingOfficeDetailsProps) {
  const InfoItem = ({ label, value, icon: Icon }: { label: string; value: string | number | undefined; icon?: React.ComponentType<{ className?: string }> }) => {
    if (!value) return null;
    return (
      <div>
        <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </label>
        <p className="text-base mt-1">{value}</p>
      </div>
    );
  };

  // Filter contacts by banner/buying office ID instead of account ID
  const primaryContact = contacts.find(
    c => c.bannerBuyingOfficeId === banner.id && c.isPrimaryContact
  );
  const displayContact = primaryContact || contacts.find(
    c => c.bannerBuyingOfficeId === banner.id
  );

  // Get display name with preferred first name if available
  const getContactDisplayName = (contact: Contact) => {
    const firstName = contact.preferredFirstName || contact.firstName;
    return `${firstName} ${contact.lastName}`;
  };

  // Get preferred contact method icon
  const getContactMethodIcon = (method?: string) => {
    switch (method) {
      case 'email':
        return <Mail className="w-3 h-3" />;
      case 'mobile phone':
        return <MessageCircle className="w-3 h-3" />;
      case 'office phone':
        return <Phone className="w-3 h-3" />;
      default:
        return <Mail className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Banner/Buying Offices
          </Button>
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold">{banner.accountName || 'Banner/Buying Office'}</h1>
              <p className="text-gray-600">Part of {accountName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Accordion type="multiple" defaultValue={['overview', 'location', 'influence', 'strategy', 'planogram', 'additional']}>
            
            {/* Overview */}
            <AccordionItem value="overview">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Overview
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem label="Banner/Buying Office Name" value={banner.accountName} icon={Building} />
                      <InfoItem label="Channel" value={banner.channel} />
                      <InfoItem label="Geographic Scope" value={banner.footprint} />
                      <InfoItem label="Operating States" value={Array.isArray(banner.operatingStates) ? `${banner.operatingStates.join(', ')} (${banner.operatingStates.length} states)` : banner.operatingStates} />
                      <InfoItem label="All Spirits Outlets" value={banner.allSpiritsOutlets} />
                      <InfoItem label="Full Proof Outlets" value={banner.fullProofOutlets} />
                    </div>

                    {banner.executionReliabilityScore && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <h4 className="font-semibold mb-3 text-sm text-gray-700">Execution Reliability</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">Execution Reliability Score</label>
                              <p className="text-base mt-1">{getExecutionReliabilityDescription(banner.executionReliabilityScore)}</p>
                            </div>
                            {banner.executionReliabilityRationale && (
                              <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-600">Rationale/Notes</label>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{banner.executionReliabilityRationale}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Location Information */}
            <AccordionItem value="location">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Information
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {banner.address && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Address
                          </label>
                          <p className="text-base mt-1 mb-3">{banner.address}</p>
                          <AddressMap address={banner.address} />
                        </div>
                      )}
                      
                      {banner.website && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Website
                          </label>
                          <a 
                            href={banner.website.startsWith('http') ? banner.website : `https://${banner.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base mt-1 text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                          >
                            {banner.website}
                            <Globe className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Level of Influence */}
            <AccordionItem value="influence">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Level of Influence
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {banner.influenceAssortmentShelf && banner.influenceAssortmentShelf !== 'none' && <InfoItem label="Assortment / Shelf" value={banner.influenceAssortmentShelf} />}
                      {banner.influencePricePromo && banner.influencePricePromo !== 'none' && <InfoItem label="Price / Promo" value={banner.influencePricePromo} />}
                      {banner.influenceDisplayMerchandising && banner.influenceDisplayMerchandising !== 'none' && <InfoItem label="Display / Merchandising" value={banner.influenceDisplayMerchandising} />}
                      {banner.influenceDigital && banner.influenceDigital !== 'none' && <InfoItem label="Digital" value={banner.influenceDigital} />}
                      {banner.influenceEcommerce && banner.influenceEcommerce !== 'none' && <InfoItem label="eCommerce" value={banner.influenceEcommerce} />}
                      {banner.influenceInStoreEvents && banner.influenceInStoreEvents !== 'none' && <InfoItem label="In Store Events" value={banner.influenceInStoreEvents} />}
                      {banner.influenceShrinkManagement && banner.influenceShrinkManagement !== 'none' && <InfoItem label="Shrink Management" value={banner.influenceShrinkManagement} />}
                      {banner.influenceBuyingPOOwnership && banner.influenceBuyingPOOwnership !== 'none' && <InfoItem label="Buying / PO Ownership" value={banner.influenceBuyingPOOwnership} />}
                    </div>
                    {!banner.influenceAssortmentShelf && !banner.influencePricePromo && !banner.influenceDisplayMerchandising && 
                     !banner.influenceDigital && !banner.influenceEcommerce && !banner.influenceInStoreEvents && 
                     !banner.influenceShrinkManagement && !banner.influenceBuyingPOOwnership && (
                      <p className="text-gray-500 text-sm">No level of influence information available</p>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Strategy and Capabilities */}
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
                      {/* JBP Information */}
                      {banner.isJBP && (
                        <div>
                          <h4 className="font-semibold mb-3 text-sm text-gray-700">JBP Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoItem label="JBP Customer" value="Yes" />
                            {banner.lastJBPDate && <InfoItem label="Last JBP" value={banner.lastJBPDate} />}
                            {banner.nextJBPDate && <InfoItem label="Next JBP" value={banner.nextJBPDate} />}
                          </div>
                        </div>
                      )}

                      {(banner.categoryCaptain || banner.categoryAdvisor || banner.pricingStrategy || 
                        banner.privateLabel || banner.innovationAppetite || banner.displayMandates) && (
                        <>
                          {banner.isJBP && <Separator />}
                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-gray-700">Business Strategy</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {banner.categoryCaptain && banner.categoryCaptain !== 'none' && <InfoItem label="Category Captain" value={banner.categoryCaptain} />}
                              {banner.categoryAdvisor && banner.categoryAdvisor !== 'none' && <InfoItem label="Category Validator" value={banner.categoryAdvisor} />}
                              {banner.pricingStrategy && banner.pricingStrategy !== 'none' && <InfoItem label="Pricing Strategy" value={banner.pricingStrategy} />}
                              {banner.privateLabel && banner.privateLabel !== 'none' && <InfoItem label="Private Label" value={banner.privateLabel} />}
                              {banner.innovationAppetite && <InfoItem label="Innovation Appetite" value={banner.innovationAppetite} />}
                              {banner.displayMandates && banner.displayMandates !== 'none' && <InfoItem label="Display Mandates" value={banner.displayMandates} />}
                            </div>
                          </div>
                        </>
                      )}

                      {(banner.ecommerceMaturityLevel || banner.ecommerceSalesPercentage || 
                        banner.fulfillmentTypes?.length > 0 || banner.ecommercePartners?.length > 0) && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-gray-700 flex items-center gap-2">
                              <ShoppingCart className="w-4 h-4" />
                              E-commerce & Fulfillment
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {banner.ecommerceMaturityLevel && banner.ecommerceMaturityLevel !== 'none' && <InfoItem label="E-commerce Maturity Level" value={banner.ecommerceMaturityLevel} />}
                              {banner.ecommerceSalesPercentage && <InfoItem label="% of Sales from E-Commerce" value={`${banner.ecommerceSalesPercentage}%`} />}
                              {banner.fulfillmentTypes && banner.fulfillmentTypes.length > 0 && (
                                <div className="md:col-span-2">
                                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <Truck className="w-4 h-4" />
                                    Fulfillment Types
                                  </label>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {banner.fulfillmentTypes.map((type, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {type}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {banner.ecommercePartners && banner.ecommercePartners.length > 0 && (
                                <div className="md:col-span-2">
                                  <label className="text-sm font-medium text-gray-600">E-commerce Partners</label>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {banner.ecommercePartners.map((partner, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {partner}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Planogram Information */}
            {banner.hasPlanograms && (
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
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Has Planogram" value="Yes" />
                          {banner.planogramWrittenBy && <InfoItem label="Planogram Written By" value={banner.planogramWrittenBy} />}
                          {banner.resetFrequency && <InfoItem label="Reset Frequency" value={banner.resetFrequency} />}
                          {banner.resetWindowLeadTime && <InfoItem label="Reset Window Lead Time" value={banner.resetWindowLeadTime} />}
                        </div>

                        {banner.affectedCategories && banner.affectedCategories.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Affected Segments</label>
                            <p className="text-sm mt-1">{banner.affectedCategories.join(', ')}</p>
                          </div>
                        )}

                        {banner.resetWindowMonths && banner.resetWindowMonths.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Reset Window Months</label>
                            <p className="text-sm mt-1">{banner.resetWindowMonths.join(', ')}</p>
                          </div>
                        )}

                        {banner.hasDifferentResetWindows === 'Yes' && banner.categoryResetWindows && banner.categoryResetWindows.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-600 mb-2 block">Category-Specific Reset Windows</label>
                            <div className="space-y-2">
                              {banner.categoryResetWindows.map((crw, idx) => (
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
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Additional Information */}
            {(banner.strategicPriorities || banner.keyCompetitors || banner.designatedCharities) && (
              <AccordionItem value="additional">
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
                        {banner.strategicPriorities && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Strategic Priorities</label>
                            <p className="text-sm mt-1 whitespace-pre-wrap">{banner.strategicPriorities}</p>
                          </div>
                        )}
                        {banner.keyCompetitors && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Key Competitors</label>
                            <p className="text-sm mt-1 whitespace-pre-wrap">{banner.keyCompetitors}</p>
                          </div>
                        )}
                        {banner.designatedCharities && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Designated Charities</label>
                            <p className="text-sm mt-1 whitespace-pre-wrap">{banner.designatedCharities}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Customer Events */}
            {banner.customerEvents && banner.customerEvents.length > 0 && (
              <AccordionItem value="events">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Customer Events ({banner.customerEvents.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        {banner.customerEvents.map((event, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                            <p className="text-sm font-medium">{event.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{new Date(event.date).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>

        {/* Sidebar - Quick Info */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Quick Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-600">Parent Account</label>
                    <p className="text-gray-900 mt-1">{accountName}</p>
                  </div>

                  {/* Primary Contact Section */}
                  {displayContact ? (
                    <>
                      <Separator />
                      <div>
                        <label className="font-medium text-gray-600 flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          {primaryContact ? 'Primary Contact' : 'Contact'}
                        </label>
                        <div className="space-y-2">
                          <p className="text-gray-900 font-medium">
                            {getContactDisplayName(displayContact)}
                          </p>
                          {displayContact.title && (
                            <p className="text-xs text-gray-600">{displayContact.title}</p>
                          )}
                          {displayContact.email && (
                            <a 
                              href={`mailto:${displayContact.email}`}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <Mail className="w-3 h-3" />
                              {displayContact.email}
                            </a>
                          )}
                          {(displayContact.mobilePhone || displayContact.officePhone) && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Phone className="w-3 h-3" />
                              {displayContact.mobilePhone || displayContact.officePhone}
                            </div>
                          )}
                          {displayContact.preferredContactMethod && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              {getContactMethodIcon(displayContact.preferredContactMethod)}
                              Prefers: {displayContact.preferredContactMethod}
                            </div>
                          )}
                          {onViewContact && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2 text-xs"
                              onClick={() => onViewContact(displayContact)}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Full Contact
                            </Button>
                          )}
                        </div>
                      </div>
                      <Separator />
                    </>
                  ) : (
                    <>
                      <Separator />
                      <div>
                        <label className="font-medium text-gray-600 flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          Primary Contact
                        </label>
                        <p className="text-xs text-gray-500 italic">No contact assigned</p>
                      </div>
                      <Separator />
                    </>
                  )}
                  
                  {banner.channel && (
                    <div>
                      <label className="font-medium text-gray-600">Channel</label>
                      <p className="text-gray-900 mt-1">{banner.channel}</p>
                    </div>
                  )}

                  {banner.footprint && (
                    <div>
                      <label className="font-medium text-gray-600">Geographic Scope</label>
                      <p className="text-gray-900 mt-1">{banner.footprint}</p>
                    </div>
                  )}

                  {banner.operatingStates && banner.operatingStates.length > 0 && (
                    <div>
                      <label className="font-medium text-gray-600">Operating States</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {banner.operatingStates.map((state, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {state}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {banner.allSpiritsOutlets && (
                    <div>
                      <label className="font-medium text-gray-600">All Spirits Outlets</label>
                      <p className="text-gray-900 mt-1">{banner.allSpiritsOutlets}</p>
                    </div>
                  )}

                  {banner.isJBP && (
                    <div>
                      <Badge variant="default" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        JBP Customer
                      </Badge>
                    </div>
                  )}

                  {banner.hasPlanograms && (
                    <div>
                      <Badge variant="default" className="text-xs">
                        <Package className="w-3 h-3 mr-1" />
                        Has Planogram
                      </Badge>
                    </div>
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