import React, { useState } from 'react';
import { Building, Search, MapPin, Globe, Calendar, Target, Package, Truck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Account, BannerBuyingOffice } from '@/types/crm';

interface BannerBuyingOfficeListProps {
  accounts: Account[];
  onViewBanner: (banner: BannerBuyingOffice, accountName: string) => void;
  onBack: () => void;
}

export default function BannerBuyingOfficeList({ accounts, onViewBanner, onBack }: BannerBuyingOfficeListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Collect all banner/buying offices from all accounts
  const allBanners: Array<{ banner: BannerBuyingOffice; accountName: string }> = [];
  
  accounts.forEach(account => {
    if (account.bannerBuyingOffices && account.bannerBuyingOffices.length > 0) {
      account.bannerBuyingOffices.forEach(banner => {
        allBanners.push({
          banner,
          accountName: account.accountName
        });
      });
    }
  });

  // Filter banners based on search term
  const filteredBanners = allBanners.filter(({ banner, accountName }) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (banner.accountName || '').toLowerCase().includes(searchLower) ||
      (banner.channel || '').toLowerCase().includes(searchLower) ||
      (banner.footprint || '').toLowerCase().includes(searchLower) ||
      (banner.address || '').toLowerCase().includes(searchLower) ||
      accountName.toLowerCase().includes(searchLower) ||
      (banner.operatingStates || []).some(state => state.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Banner/Buying Offices</h2>
          <p className="text-gray-600">View all banner and buying office locations</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by name, channel, footprint, address, parent account, or operating states..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredBanners.length} of {allBanners.length} banner/buying offices
        </p>
      </div>

      {/* Banner/Buying Offices List */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4 pr-4">
          {filteredBanners.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <Building className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {searchTerm ? 'No banner/buying offices found' : 'No banner/buying offices yet'}
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? 'Try adjusting your search terms'
                      : 'Banner/buying offices are added within customer accounts'
                    }
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            filteredBanners.map(({ banner, accountName }, index) => (
              <Card 
                key={`${banner.id}-${index}`} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onViewBanner(banner, accountName)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Building className="w-5 h-5 text-purple-600" />
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                              {banner.accountName || 'Unnamed Banner/Buying Office'}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Parent Account: <span className="font-medium">{accountName}</span>
                          </p>
                        </div>
                      </div>

                      {/* Key Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {banner.channel && (
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="secondary">{banner.channel}</Badge>
                          </div>
                        )}
                        {banner.footprint && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {banner.footprint}
                          </div>
                        )}
                        {banner.operatingStates && banner.operatingStates.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {banner.operatingStates.length} state{banner.operatingStates.length !== 1 ? 's' : ''}
                          </div>
                        )}
                        {banner.allSpiritsOutlets && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="w-4 h-4" />
                            {banner.allSpiritsOutlets} spirits outlets
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      {banner.address && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{banner.address}</span>
                        </div>
                      )}

                      {/* Additional Badges */}
                      <div className="flex flex-wrap gap-2">
                        {banner.isJBP && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            JBP Customer
                          </Badge>
                        )}
                        {banner.categoryCaptain && banner.categoryCaptain !== 'none' && (
                          <Badge variant="outline" className="text-xs">
                            <Target className="w-3 h-3 mr-1" />
                            Category Captain: {banner.categoryCaptain}
                          </Badge>
                        )}
                        {banner.hasPlanograms && (
                          <Badge variant="outline" className="text-xs">
                            <Package className="w-3 h-3 mr-1" />
                            Has Planogram
                          </Badge>
                        )}
                        {banner.fulfillmentTypes && banner.fulfillmentTypes.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Truck className="w-3 h-3 mr-1" />
                            {banner.fulfillmentTypes.length} fulfillment type{banner.fulfillmentTypes.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        {banner.ecommerceMaturityLevel && banner.ecommerceMaturityLevel !== 'none' && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            E-commerce: {banner.ecommerceMaturityLevel.split('—')[0].trim()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}