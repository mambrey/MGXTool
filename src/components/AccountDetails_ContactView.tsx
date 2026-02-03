// Helper component to display Last Check In information for a contact
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, Calendar } from 'lucide-react';
import type { Contact } from '@/types/crm';

interface ContactLastCheckInViewProps {
  contact: Contact;
}

export function ContactLastCheckInView({ contact }: ContactLastCheckInViewProps) {
  const owners = contact.primaryDiageoRelationshipOwners;
  
  if (!owners || (!owners.sales && !owners.support)) {
    return null;
  }

  const salesRoles = owners.sales || {};
  const supportRoles = owners.support || {};
  const salesLastCheckIn = owners.salesLastCheckIn || {};
  const supportLastCheckIn = owners.supportLastCheckIn || {};

  const hasSalesRoles = Object.keys(salesRoles).length > 0;
  const hasSupportRoles = Object.keys(supportRoles).length > 0;

  if (!hasSalesRoles && !hasSupportRoles) {
    return null;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not recorded';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysSince = (dateString: string) => {
    if (!dateString) return null;
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Card className="bg-indigo-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="text-indigo-900 flex items-center gap-2 text-base">
          <Calendar className="w-5 h-5" />
          Relationship Owner Check-Ins
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasSalesRoles && (
          <div className="space-y-3 p-3 bg-white border border-indigo-200 rounded-lg">
            <h4 className="font-semibold text-indigo-900 flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4" />
              Sales
            </h4>
            <div className="space-y-2">
              {Object.entries(salesRoles).map(([role, cadence]) => {
                const lastCheckIn = salesLastCheckIn[role];
                const daysSince = lastCheckIn ? getDaysSince(lastCheckIn) : null;
                
                return (
                  <div key={role} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{role}</div>
                      <div className="text-xs text-gray-600">Cadence: {cadence || 'Not set'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-700">
                        {formatDate(lastCheckIn)}
                      </div>
                      {daysSince !== null && (
                        <Badge 
                          variant={daysSince > 90 ? 'destructive' : daysSince > 30 ? 'default' : 'secondary'}
                          className="text-xs mt-1"
                        >
                          {daysSince === 0 ? 'Today' : `${daysSince} days ago`}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {hasSupportRoles && (
          <div className="space-y-3 p-3 bg-white border border-indigo-200 rounded-lg">
            <h4 className="font-semibold text-indigo-900 flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              Support
            </h4>
            <div className="space-y-2">
              {Object.entries(supportRoles).map(([role, cadence]) => {
                const lastCheckIn = supportLastCheckIn[role];
                const daysSince = lastCheckIn ? getDaysSince(lastCheckIn) : null;
                
                return (
                  <div key={role} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{role}</div>
                      <div className="text-xs text-gray-600">Cadence: {cadence || 'Not set'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-700">
                        {formatDate(lastCheckIn)}
                      </div>
                      {daysSince !== null && (
                        <Badge 
                          variant={daysSince > 90 ? 'destructive' : daysSince > 30 ? 'default' : 'secondary'}
                          className="text-xs mt-1"
                        >
                          {daysSince === 0 ? 'Today' : `${daysSince} days ago`}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}