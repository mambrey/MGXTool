import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Contact } from '@/types/crm';

interface ContactImportProps {
  onImport: (contacts: Contact[]) => void;
  existingContacts?: Contact[];
}

interface ExtendedContact extends Contact {
  director?: string;
  seniorVicePresident?: string;
}

export default function ContactImport({ onImport, existingContacts = [] }: ContactImportProps) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  const downloadTemplate = () => {
    // Generate CSV with current contact data
    const headers = [
      'First Name', 'Last Name', 'Email', 'Office Phone', 'Mobile Phone', 'Preferred Contact Method',
      'Title', 'Account ID', 'Contact Type', 'Influence', 'Birthday', 'Birthday Alert',
      'Relationship Status', 'Last Contact Date', 'Next Contact Date', 'Next Contact Alert',
      'Social Handles', 'Known Preferences', 'Notes', 'Relationship Owner Name',
      'Relationship Owner Email', 'Director', 'Vice President', 'Senior Vice President', 
      'Created At', 'Last Modified'
    ];

    const escapeCSV = (value: string | number | boolean | undefined | null): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const rows = [headers.join(',')];

    // Add existing contacts to the template
    existingContacts.forEach(contact => {
      const extendedContact = contact as ExtendedContact;
      // Handle socialHandles array
      const socialHandlesStr = contact.socialHandles ? contact.socialHandles.join('; ') : '';
      
      const row = [
        escapeCSV(contact.firstName),
        escapeCSV(contact.lastName),
        escapeCSV(contact.email),
        escapeCSV(contact.officePhone),
        escapeCSV(contact.mobilePhone),
        escapeCSV(contact.preferredContactMethod),
        escapeCSV(contact.title),
        escapeCSV(contact.accountId),
        escapeCSV(contact.contactType),
        escapeCSV(contact.influence),
        escapeCSV(contact.birthday),
        escapeCSV(contact.birthdayAlert),
        escapeCSV(contact.relationshipStatus),
        escapeCSV(contact.lastContactDate),
        escapeCSV(contact.nextContactDate),
        escapeCSV(contact.nextContactAlert),
        escapeCSV(socialHandlesStr),
        escapeCSV(contact.knownPreferences),
        escapeCSV(contact.notes),
        escapeCSV(contact.relationshipOwner?.name),
        escapeCSV(contact.relationshipOwner?.email),
        escapeCSV(extendedContact.director),
        escapeCSV(contact.relationshipOwner?.vicePresident),
        escapeCSV(extendedContact.seniorVicePresident),
        escapeCSV(contact.createdAt),
        escapeCSV(contact.lastModified)
      ];
      
      rows.push(row.join(','));
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'Contacts_Template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField.trim());
          rows.push(currentRow);
          currentRow = [];
          currentField = '';
        }
      } else {
        currentField += char;
      }
    }

    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      rows.push(currentRow);
    }

    return rows;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportResult({
        success: false,
        message: 'Please upload a valid CSV file. Only .csv files are accepted.'
      });
      event.target.value = '';
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length < 2) {
        setImportResult({
          success: false,
          message: 'CSV file is empty or has no data rows'
        });
        setImporting(false);
        return;
      }

      const headers = rows[0].map(h => h.trim());
      const dataRows = rows.slice(1).filter(row => row.some(cell => cell.trim()));

      const contacts: ExtendedContact[] = dataRows.map((row, index) => {
        const getCell = (columnName: string): string => {
          const colIndex = headers.findIndex(h => 
            h.toLowerCase() === columnName.toLowerCase()
          );
          return colIndex >= 0 ? row[colIndex]?.trim() || '' : '';
        };

        const getBooleanCell = (columnName: string): boolean | undefined => {
          const value = getCell(columnName).toLowerCase();
          if (value === 'true' || value === 'yes' || value === '1') return true;
          if (value === 'false' || value === 'no' || value === '0') return false;
          return undefined;
        };

        const firstName = getCell('First Name');
        const lastName = getCell('Last Name');
        const email = getCell('Email');

        if (!firstName || !lastName || !email) {
          throw new Error(`Row ${index + 2}: First Name, Last Name, and Email are required`);
        }

        // Parse social handles
        const socialHandlesStr = getCell('Social Handles');
        const socialHandles = socialHandlesStr 
          ? socialHandlesStr.split(';').map(s => s.trim()).filter(Boolean)
          : undefined;

        const now = new Date().toISOString();

        // Parse relationship owner with new hierarchy fields
        const ownerName = getCell('Relationship Owner Name');
        const ownerEmail = getCell('Relationship Owner Email');
        const director = getCell('Director');
        const vicePresident = getCell('Vice President');
        const seniorVicePresident = getCell('Senior Vice President');
        
        const relationshipOwner = (ownerName || ownerEmail || vicePresident) ? {
          name: ownerName || '',
          email: ownerEmail || '',
          vicePresident: vicePresident || ''
        } : undefined;

        return {
          id: `imported-${Date.now()}-${index}`,
          firstName,
          lastName,
          email,
          officePhone: getCell('Office Phone') || undefined,
          mobilePhone: getCell('Mobile Phone') || undefined,
          preferredContactMethod: (getCell('Preferred Contact Method') || undefined) as 'email' | 'mobile phone' | 'office phone' | undefined,
          title: getCell('Title') || undefined,
          accountId: getCell('Account ID') || undefined,
          contactType: (getCell('Contact Type') || undefined) as 'Primary' | 'Secondary' | undefined,
          influence: (getCell('Influence') || undefined) as 'Decision Maker' | 'Influencer' | 'User' | 'Gatekeeper' | undefined,
          birthday: getCell('Birthday') || undefined,
          birthdayAlert: getBooleanCell('Birthday Alert'),
          relationshipStatus: getCell('Relationship Status') || undefined,
          lastContactDate: getCell('Last Contact Date') || undefined,
          nextContactDate: getCell('Next Contact Date') || undefined,
          nextContactAlert: getBooleanCell('Next Contact Alert'),
          socialHandles,
          knownPreferences: getCell('Known Preferences') || undefined,
          notes: getCell('Notes') || undefined,
          uploadedNotes: [],
          relationshipOwner,
          director: director || undefined,
          seniorVicePresident: seniorVicePresident || undefined,
          createdAt: getCell('Created At') || now,
          lastModified: getCell('Last Modified') || now
        };
      });

      onImport(contacts);
      setImportResult({
        success: true,
        message: `Successfully imported ${contacts.length} contact(s)`,
        count: contacts.length
      });
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to import contacts'
      });
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Import Contacts
        </CardTitle>
        <CardDescription>
          Import contacts from CSV file - Use this page to upload contact data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Step 1: Download Template</h4>
          <p className="text-sm text-gray-600">
            Download the CSV template with all your current contact data pre-populated. Any contacts you've added will be included in the download.
          </p>
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Template ({existingContacts.length} contact{existingContacts.length !== 1 ? 's' : ''})
          </Button>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-medium">Step 2: Fill in Your Data</h4>
          <p className="text-sm text-gray-600">
            Open the downloaded CSV in Excel, add or modify contact data, and save as CSV
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>First Name, Last Name, and Email are required</li>
            <li>Use TRUE/FALSE for Yes/No columns (Birthday Alert, Next Contact Alert)</li>
            <li>Use semicolon-separated values for Social Handles (e.g., "@twitter; @linkedin")</li>
            <li>Contact Type: Primary or Secondary</li>
            <li>Influence: Decision Maker, Influencer, User, or Gatekeeper</li>
            <li>Preferred Contact Method: email, mobile phone, or office phone</li>
            <li>Leave cells blank if data is not available</li>
          </ul>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-medium">Step 3: Upload CSV File</h4>
          <p className="text-sm text-gray-600">
            Select your filled CSV file to import contacts
          </p>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={importing}
              className="hidden"
              id="contact-csv-upload"
            />
            <label htmlFor="contact-csv-upload">
              <Button
                variant="default"
                disabled={importing}
                className="flex items-center gap-2"
                asChild
              >
                <span>
                  <Upload className="w-4 h-4" />
                  {importing ? 'Importing...' : 'Upload CSV'}
                </span>
              </Button>
            </label>
          </div>
        </div>

        {importResult && (
          <Alert variant={importResult.success ? 'default' : 'destructive'}>
            {importResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {importResult.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Column Mapping Reference</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Required:</strong> First Name, Last Name, Email</p>
            <p><strong>Contact Info:</strong> Office Phone, Mobile Phone, Preferred Contact Method, Title</p>
            <p><strong>Account Link:</strong> Account ID (use the account's ID to link this contact)</p>
            <p><strong>Classification:</strong> Contact Type (Primary/Secondary), Influence (Decision Maker/Influencer/User/Gatekeeper)</p>
            <p><strong>Dates & Alerts:</strong> Birthday, Birthday Alert, Last Contact Date, Next Contact Date, Next Contact Alert</p>
            <p><strong>Relationship:</strong> Relationship Status, Known Preferences, Notes</p>
            <p><strong>Social:</strong> Social Handles (semicolon-separated, e.g., "@twitter; @linkedin")</p>
            <p><strong>Owner Info:</strong> Relationship Owner Name, Relationship Owner Email, Director, Vice President, Senior Vice President</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}