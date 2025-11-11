import React from 'react';
import { Edit2, Printer, Mail, Phone, Linkedin, Calendar, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Contact, Account } from '@/types/crm';

interface ContactDetailsProps {
  contact: Contact;
  account?: Account;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  onBack: () => void;
}

export default function ContactDetails({ 
  contact, 
  account, 
  onEdit, 
  onDelete, 
  onBack 
}: ContactDetailsProps) {

  // Helper function to get influencer level badge with color coding
  const getInfluencerLevelBadge = (level?: number) => {
    if (!level) return null;
    
    let className = '';
    let label = '';
    
    if (level <= 3) {
      className = 'bg-gray-100 text-gray-800 border-gray-300';
      label = 'Low';
    } else if (level <= 6) {
      className = 'bg-blue-100 text-blue-800 border-blue-300';
      label = 'Medium';
    } else if (level <= 8) {
      className = 'bg-yellow-100 text-yellow-800 border-yellow-300';
      label = 'High';
    } else {
      className = 'bg-green-100 text-green-800 border-green-300';
      label = 'Very High';
    }
    
    return (
      <Badge variant="outline" className={`${className}`}>
        <TrendingUp className="w-3 h-3 mr-1 inline" />
        Influence Rating: {level}/10 ({label})
      </Badge>
    );
  };

  const printContact = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Contact: ${contact.firstName} ${contact.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            h2 { color: #4b5563; margin-top: 20px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #6b7280; }
            .value { margin-left: 10px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>${contact.firstName} ${contact.lastName}</h1>
          ${contact.title ? `<p style="font-size: 18px; color: #6b7280;">${contact.title}</p>` : ''}
          ${account ? `<p style="color: #2563eb;">Account: ${account.accountName}</p>` : ''}
          
          <div class="section">
            <h2>Contact Information</h2>
            ${contact.email ? `<p><span class="label">Email:</span><span class="value">${contact.email}</span></p>` : ''}
            ${contact.mobilePhone ? `<p><span class="label">Mobile:</span><span class="value">${contact.mobilePhone}</span></p>` : ''}
            ${contact.officePhone ? `<p><span class="label">Office:</span><span class="value">${contact.officePhone}</span></p>` : ''}
          </div>
          
          ${contact.relationshipStatus || contact.preferredContactMethod ? `
          <div class="section">
            <h2>Relationship Details</h2>
            ${contact.relationshipStatus ? `<p><span class="label">Status:</span><span class="value">${contact.relationshipStatus}</span></p>` : ''}
            ${contact.preferredContactMethod ? `<p><span class="label">Preferred Contact:</span><span class="value">${contact.preferredContactMethod}</span></p>` : ''}
          </div>` : ''}
          
          ${contact.knownPreferences ? `
          <div class="section">
            <h2>Known Preferences</h2>
            <p>${contact.knownPreferences}</p>
          </div>` : ''}
          
          ${contact.notes ? `
          <div class="section">
            <h2>Notes</h2>
            <p style="white-space: pre-wrap;">${contact.notes}</p>
          </div>` : ''}
          
          <button onclick="window.print()">Print</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Contacts
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold">{contact.firstName} {contact.lastName}</h1>
              <p className="text-gray-600">{contact.title || 'No title specified'}</p>
              {account && (
                <p className="text-blue-600 text-sm mt-1">{account.accountName}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={printContact}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            onClick={() => onEdit(contact)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Contact
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}? This action cannot be undone.`)) {
                onDelete(contact.id);
              }
            }}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                {contact.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800 text-sm break-all">
                        {contact.email}
                      </a>
                    </div>
                  </div>
                )}
                {contact.mobilePhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 mb-1">Mobile</p>
                      <a href={`tel:${contact.mobilePhone}`} className="text-blue-600 hover:text-blue-800 text-sm">
                        {contact.mobilePhone}
                      </a>
                    </div>
                  </div>
                )}
                {contact.officePhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 mb-1">Office</p>
                      <a href={`tel:${contact.officePhone}`} className="text-blue-600 hover:text-blue-800 text-sm">
                        {contact.officePhone}
                      </a>
                    </div>
                  </div>
                )}
                {contact.socialHandles && contact.socialHandles.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Social Handles</p>
                    <div className="space-y-2">
                      {contact.socialHandles.map((handle, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {handle}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Relationship Details */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4">Relationship Details</h3>
              <div className="space-y-3">
                {contact.contactType && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Contact Type</p>
                    <Badge variant={contact.contactType === 'Primary' ? 'default' : 'secondary'}>
                      {contact.contactType}
                    </Badge>
                  </div>
                )}
                {contact.influence && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Influence Level</p>
                    <Badge variant="outline">
                      {contact.influence}
                    </Badge>
                  </div>
                )}
                {contact.influencerLevel && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Influencer Rating</p>
                    {getInfluencerLevelBadge(contact.influencerLevel)}
                  </div>
                )}
                {contact.relationshipStatus && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Relationship Status</p>
                    <p className="text-sm">{contact.relationshipStatus}</p>
                  </div>
                )}
                {contact.preferredContactMethod && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Preferred Contact Method</p>
                    <p className="text-sm">{contact.preferredContactMethod}</p>
                  </div>
                )}
                {contact.birthday && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Birthday</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <p className="text-sm">{new Date(contact.birthday).toLocaleDateString()}</p>
                      {contact.birthdayAlert && (
                        <Badge variant="secondary" className="text-xs">
                          Alert On
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                {/* Relationship Owner - Simplified formatting */}
                {contact.relationshipOwner && (contact.relationshipOwner.name || contact.relationshipOwner.email || contact.relationshipOwner.vicePresident) && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Relationship Owner</p>
                    <div className="text-sm text-gray-700 space-y-1">
                      {contact.relationshipOwner.name && (
                        <p>{contact.relationshipOwner.name}</p>
                      )}
                      {contact.relationshipOwner.email && (
                        <p className="text-blue-600">{contact.relationshipOwner.email}</p>
                      )}
                      {contact.relationshipOwner.vicePresident && (
                        <p>VP: {contact.relationshipOwner.vicePresident}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Timestamps */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Contact Record Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Created</p>
                <p className="text-sm">{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Not available'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Last Modified</p>
                <p className="text-sm">{contact.lastModified ? new Date(contact.lastModified).toLocaleDateString() : 'Not available'}</p>
              </div>
            </div>
          </div>

          {/* Important Dates */}
          {(contact.lastContactDate || contact.nextContactDate) && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Important Dates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {contact.lastContactDate && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Contact</p>
                    <p className="text-sm">{new Date(contact.lastContactDate).toLocaleDateString()}</p>
                  </div>
                )}
                {contact.nextContactDate && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Next Contact</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <p className="text-sm">{new Date(contact.nextContactDate).toLocaleDateString()}</p>
                      {contact.nextContactAlert && (
                        <Badge variant="secondary" className="text-xs">
                          Alert On
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preferences */}
          {contact.knownPreferences && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-base sm:text-lg font-semibold mb-3">Known Preferences</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.knownPreferences}</p>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-base sm:text-lg font-semibold mb-3">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          {/* Uploaded Notes */}
          {contact.uploadedNotes && contact.uploadedNotes.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-base sm:text-lg font-semibold mb-3">Additional Notes</h3>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}