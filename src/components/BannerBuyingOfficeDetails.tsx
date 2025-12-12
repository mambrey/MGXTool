import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Phone, Mail, User } from 'lucide-react';
import type { BannerBuyingOffice, Contact } from '@/types';

interface BannerBuyingOfficeDetailsProps {
  banner: BannerBuyingOffice;
  contacts: Contact[];
  accountId: string;
}

export function BannerBuyingOfficeDetails({ banner, contacts, accountId }: BannerBuyingOfficeDetailsProps) {
  // Filter contacts by banner/buying office ID instead of account ID
  const primaryContact = contacts.find(
    c => c.bannerBuyingOfficeId === banner.id && c.isPrimaryContact
  );
  const displayContact = primaryContact || contacts.find(
    c => c.bannerBuyingOfficeId === banner.id
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{banner.name}</CardTitle>
          </div>
          <Badge variant={banner.status === 'Active' ? 'default' : 'secondary'}>
            {banner.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-muted-foreground">
                  {banner.address.street}<br />
                  {banner.address.city}, {banner.address.state} {banner.address.zipCode}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-medium">Contact</p>
                {displayContact ? (
                  <>
                    <p className="text-muted-foreground">{displayContact.name}</p>
                    {displayContact.title && (
                      <p className="text-xs text-muted-foreground">{displayContact.title}</p>
                    )}
                    {displayContact.phone && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        <span className="text-xs">{displayContact.phone}</span>
                      </div>
                    )}
                    {displayContact.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{displayContact.email}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No contact assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {banner.notes && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-1">Notes</p>
            <p className="text-sm text-muted-foreground">{banner.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}