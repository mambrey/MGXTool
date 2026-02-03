import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, Users, 
  Package, Target, Info, X, Edit, Trash2, Building2, Crown, Bell
} from 'lucide-react';
import type { Contact, Account } from '@/types/crm';
import { ContactLastCheckInView } from './AccountDetails_ContactView';
import { formatBirthdayLong } from '@/lib/dateUtils';

interface ContactDetailsViewProps {
  contact: Contact;
  account?: Account;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
  onClose?: () => void;
}

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

  const formatAlertOptions = (options?: ('same_day' | 'day_before' | 'week_before')[]) => {
    if (!options || options.length === 0) return 'None';
    return options.map(opt => {
      switch (opt) {
        case 'same_day': return 'Same Day';
        case 'day_before': return 'Day Before';
        case 'week_before': return 'Week Before';
        default: return opt;
      }
    }).join(', ');
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
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">
                {contact.preferredFirstName || contact.firstName} {contact.lastName}
              </h2>
              {contact.isPrimaryContact && (
                <Badge className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Primary
                </Badge>
              )}
            </div>
            {contact.preferredFirstName && (
              <p className="text-sm text-gray-500">Legal name: {contact.firstName} {contact.lastName}</p>
            )}
            {contact.title && (
              <p className="text-gray-600">{contact.title}</p>
            )}
            {account && (
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {contact.bannerBuyingOfficeId && account.bannerBuyingOffices
                    ? account.bannerBuyingOffices.find(b => b.id === contact.bannerBuyingOfficeId)?.accountName || account.accountName
                    : account.accountName}
                </span>
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
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Current Role Tenure" value={contact.currentRoleTenure} icon={Briefcase} />
                <InfoItem label="Contact Status" value={contact.contactActiveStatus} />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
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

          {/* Ways of Working */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ways of Working</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Relationship Status */}
              {contact.relationshipStatus && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Support Style</label>
                  <div className="mt-2">
                    <Badge 
                      className="text-white"
                      style={{ backgroundColor: getSupportStyleColor(contact.relationshipStatus) }}
                    >
                      {contact.relationshipStatus}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Category/Segment Ownership */}
              {contact.categorySegmentOwnership && contact.categorySegmentOwnership.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Category/Segment Ownership
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contact.categorySegmentOwnership.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibility Levels */}
              {contact.responsibilityLevels && Object.keys(contact.responsibilityLevels).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4" />
                    Responsibility Levels
                  </label>
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
                </div>
              )}
            </CardContent>
          </Card>

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
                  <div className="flex-1">
                    <span className="text-sm font-medium">Birthday</span>
                    <p className="text-sm text-gray-600">{formatBirthdayLong(contact.birthday)}</p>
                  </div>
                  {contact.birthdayAlert && (
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-600" />
                      <Badge variant="secondary" className="text-xs">
                        {formatAlertOptions(contact.birthdayAlertOptions)}
                      </Badge>
                    </div>
                  )}
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
                  <div className="flex-1">
                    <span className="text-sm font-medium">Next Contact</span>
                    <p className="text-sm text-gray-600">{formatDate(contact.nextContactDate)}</p>
                  </div>
                  {contact.nextContactAlert && (
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-600" />
                      <Badge variant="secondary" className="text-xs">
                        {formatAlertOptions(contact.nextContactAlertOptions)}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
              
              {/* Custom Events */}
              {contact.contactEvents && contact.contactEvents.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <h4 className="text-sm font-medium text-gray-700">Custom Events</h4>
                  {contact.contactEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{event.title}</span>
                        <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                      </div>
                      {event.alertEnabled && (
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-orange-600" />
                          <Badge variant="secondary" className="text-xs">
                            {formatAlertOptions(event.alertOptions)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* LinkedIn Profile */}
          {contact.linkedinProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">LinkedIn Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={contact.linkedinProfile.startsWith('http') ? contact.linkedinProfile : `https://${contact.linkedinProfile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm block"
                >
                  {contact.linkedinProfile}
                </a>
              </CardContent>
            </Card>
          )}

          {/* Relationship Owner Check-Ins */}
          <ContactLastCheckInView contact={contact} />

          {/* Preferences & Notes */}
          {(contact.knownPreferences || contact.entertainment || contact.decisionBiasProfile || contact.followThrough || contact.values || contact.painPoints || contact.notes) && (
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
                {contact.entertainment && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Allowed to Entertain</label>
                    <p className="text-sm mt-1">{contact.entertainment}</p>
                  </div>
                )}
                {contact.decisionBiasProfile && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Decision Bias Profile</label>
                    <p className="text-sm mt-1">{contact.decisionBiasProfile}</p>
                  </div>
                )}
                {contact.followThrough && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Follow Through</label>
                    <Badge variant="outline">{contact.followThrough}</Badge>
                  </div>
                )}
                {contact.values && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">What They Value (Business Perspective)</label>
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

          {/* Additional Notes */}
          {contact.uploadedNotes && contact.uploadedNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contact.uploadedNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.timestamp).toLocaleString()}
                      </p>
                    </div>
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
