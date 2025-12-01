import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, Users, 
  Package, Target, Info, X, Edit, Trash2, Building2
} from 'lucide-react';
import type { Contact, Account } from '@/types/crm';
import { ContactLastCheckInView } from './AccountDetails_ContactView';

interface ContactDetailsViewProps {
  contact: Contact;
  account?: Account;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
  onClose?: () => void;
}


// Format birthday from MM-DD to readable format
const formatBirthday = (birthday: string): string => {
  if (!birthday || !birthday.match(/^\d{2}-\d{2}$/)) return birthday;
  const [month, day] = birthday.split('-');
  const date = new Date(2000, parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

export default function ContactDetailsView({ 
  contact, 
  account,
  onEdit, 
  onDelete,
  onClose 
}: ContactDetailsViewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSupportStyleColor = (status: string) => {
    if (status.startsWith('Promoter')) return '#166534';
    if (status.startsWith('Supporter')) return '#16a34a';
    if (status.startsWith('Neutral')) return '#6b7280';
    if (status.startsWith('Detractor')) return '#ea580c';
    if (status.startsWith('Adversarial')) return '#991b1b';
    return '#6b7280';
  };

  const InfoItem = ({ 
    label, 
    value, 
    icon: Icon 
  }: { 
    label: string; 
    value: string | number | undefined; 
    icon?: React.ComponentType<{ className?: string }> 
  }) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {contact.headshot ? (
            <img 
              src={contact.headshot} 
              alt={`${contact.firstName} ${contact.lastName}`}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {contact.preferredFirstName || contact.firstName} {contact.lastName}
            </h2>
            {contact.title && (
              <p className="text-gray-600">{contact.title}</p>
            )}
            {account && (
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{account.accountName}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(contact)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this contact?')) {
                  onDelete(contact.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6 pr-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Email" value={contact.email} icon={Mail} />
                <InfoItem label="Office Phone" value={contact.officePhone} icon={Phone} />
                <InfoItem label="Mobile Phone" value={contact.mobilePhone} icon={Phone} />
                <InfoItem label="Preferred Contact Method" value={contact.preferredContactMethod} />
                <InfoItem label="Current Role Tenure" value={contact.currentRoleTenure} />
                <InfoItem label="Contact Status" value={contact.contactActiveStatus} />
              </div>
              {contact.preferredShippingAddress && (
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Preferred Shipping Address
                  </label>
                  <p className="text-base mt-1">{contact.preferredShippingAddress}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Relationship Status */}
          {contact.relationshipStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Relationship Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge 
                  className="text-white"
                  style={{ backgroundColor: getSupportStyleColor(contact.relationshipStatus) }}
                >
                  {contact.relationshipStatus}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Category/Segment Ownership */}
          {contact.categorySegmentOwnership && contact.categorySegmentOwnership.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Category/Segment Ownership
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contact.categorySegmentOwnership.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Responsibility Levels */}
          {contact.responsibilityLevels && Object.keys(contact.responsibilityLevels).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Responsibility Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(contact.responsibilityLevels).map(([key, value]) => {
                    if (!value || value === 'None') return null;
                    const label = key.replace(/([A-Z])/g, ' $1').trim();
                    return (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm capitalize">{label}</span>
                        <Badge variant="outline">{value}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Important Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contact.birthday && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Birthday</span>
                  <span className="text-sm">{formatBirthday(contact.birthday)}</span>
                </div>
              )}
              {contact.lastContactDate && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Last Contact</span>
                  <span className="text-sm">{formatDate(contact.lastContactDate)}</span>
                </div>
              )}
              {contact.nextContactDate && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Next Contact</span>
                  <span className="text-sm">{formatDate(contact.nextContactDate)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Relationship Owner Check-Ins - NEW */}
          <ContactLastCheckInView contact={contact} />

          {/* Preferences & Notes */}
          {(contact.knownPreferences || contact.decisionBiasProfile || contact.values || contact.painPoints || contact.notes) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Preferences & Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contact.knownPreferences && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Known Preferences</label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{contact.knownPreferences}</p>
                  </div>
                )}
                {contact.decisionBiasProfile && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Decision Bias Profile</label>
                    <p className="text-sm mt-1">{contact.decisionBiasProfile}</p>
                  </div>
                )}
                {contact.values && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Values</label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{contact.values}</p>
                  </div>
                )}
                {contact.painPoints && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pain Points</label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{contact.painPoints}</p>
                  </div>
                )}
                {contact.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">General Notes</label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{contact.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Social Handles */}
          {contact.socialHandles && contact.socialHandles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">LinkedIn Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contact.socialHandles.map((handle, index) => (
                    <a
                      key={index}
                      href={handle}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm block"
                    >
                      {handle}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}