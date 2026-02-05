import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Contact, Account } from '@/types/crm';

interface ContactImportProps {
  onImport: (contacts: Contact[]) => void;
  existingContacts?: Contact[];
  existingAccounts: Account[];
}

export default function ContactImport({ onImport, existingContacts = [], existingAccounts = [] }: ContactImportProps) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  const downloadTemplate = () => {
    // Generate CSV with ALL contact form fields
    const headers = [
      // Basic Information
      'First Name', 'Preferred First Name', 'Last Name', 'Email', 'Headshot',
      'Title', 'Current Role Tenure', 'Account Name', 'Banner Buying Office Name',
      'Manager Name', 'Is Primary Contact', 'Contact Active Status',
      
      // Contact Information
      'Office Phone', 'Mobile Phone', 'Preferred Contact Method', 'Preferred Shipping Address',
      
      // Ways of Working
      'Advocacy Style', 'Category Segment Ownership', 'Responsibility Levels',
      
      // Important Dates
      'Birthday', 'Birthday Alert', 'Birthday Alert Options',
      'Next Contact Date', 'Next Contact Alert', 'Next Contact Alert Options',
      'Last Contact Date', 'Contact Events',
      
      // LinkedIn
      'LinkedIn Profile',
      
      // Preferences & Notes
      'Known Preferences', 'Entertainment', 'Decision Bias Profile', 'Follow Through',
      'Values', 'Pain Points', 'Notes', 'Uploaded Notes',
      
      // Diageo Relationship Owners
      'Primary Owner Name', 'Primary Owner Title', 'Primary Owner Email', 'SVP',
      'Sales Roles', 'Support Roles', 'Sales Last Check In', 'Support Last Check In',
      
      // Timestamps
      'Created At', 'Last Modified'
    ];

    const escapeCSV = (value: string | number | boolean | undefined | null | string[] | object): string => {
      if (value === null || value === undefined) return '';
      
      // Handle arrays
      if (Array.isArray(value)) {
        const arrayStr = value.join('; ');
        if (arrayStr.includes(',') || arrayStr.includes('"') || arrayStr.includes('\n')) {
          return `"${arrayStr.replace(/"/g, '""')}"`;
        }
        return arrayStr;
      }
      
      // Handle objects (JSON stringify)
      if (typeof value === 'object') {
        const jsonStr = JSON.stringify(value);
        return `"${jsonStr.replace(/"/g, '""')}"`;
      }
      
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const rows = [headers.join(',')];

    // Add existing contacts to the template
    existingContacts.forEach(contact => {
      // Find account name from accountId
      const account = contact.accountId 
        ? existingAccounts.find(acc => acc.id === contact.accountId)
        : null;
      const accountName = account?.accountName || '';
      
      // Find banner/buying office name
      let bannerName = '';
      if (contact.bannerBuyingOfficeId && account?.bannerBuyingOffices) {
        const banner = account.bannerBuyingOffices.find(b => b.id === contact.bannerBuyingOfficeId);
        bannerName = banner?.accountName || '';
      }
      
      // Find manager name from managerId
      let managerName = '';
      if (contact.managerId) {
        const manager = existingContacts.find(c => c.id === contact.managerId);
        if (manager) {
          managerName = `${manager.firstName} ${manager.lastName}`;
        }
      }

      // Handle categorySegmentOwnership - might be string or array
      let categorySegmentStr = '';
      if (contact.categorySegmentOwnership) {
        if (Array.isArray(contact.categorySegmentOwnership)) {
          categorySegmentStr = contact.categorySegmentOwnership.join('; ');
        } else if (typeof contact.categorySegmentOwnership === 'string') {
          categorySegmentStr = contact.categorySegmentOwnership;
        }
      }

      // Handle decisionBiasProfile - might be string or array
      let decisionBiasStr = '';
      if (contact.decisionBiasProfile) {
        if (Array.isArray(contact.decisionBiasProfile)) {
          decisionBiasStr = contact.decisionBiasProfile.join('; ');
        } else if (typeof contact.decisionBiasProfile === 'string') {
          decisionBiasStr = contact.decisionBiasProfile;
        }
      }
      
      const row = [
        // Basic Information
        escapeCSV(contact.firstName),
        escapeCSV(contact.preferredFirstName),
        escapeCSV(contact.lastName),
        escapeCSV(contact.email),
        escapeCSV(contact.headshot ? '[Base64 Image Data]' : ''), // Don't export full base64
        escapeCSV(contact.title),
        escapeCSV(contact.currentRoleTenure),
        escapeCSV(accountName),
        escapeCSV(bannerName),
        escapeCSV(managerName),
        escapeCSV(contact.isPrimaryContact),
        escapeCSV(contact.contactActiveStatus),
        
        // Contact Information
        escapeCSV(contact.officePhone),
        escapeCSV(contact.mobilePhone),
        escapeCSV(contact.preferredContactMethod),
        escapeCSV(contact.preferredShippingAddress),
        
        // Ways of Working
        escapeCSV(contact.relationshipStatus), // This is "Advocacy Style" in the form
        escapeCSV(categorySegmentStr),
        escapeCSV(contact.responsibilityLevels),
        
        // Important Dates
        escapeCSV(contact.birthday),
        escapeCSV(contact.birthdayAlert),
        escapeCSV(contact.birthdayAlertOptions),
        escapeCSV(contact.nextContactDate),
        escapeCSV(contact.nextContactAlert),
        escapeCSV(contact.nextContactAlertOptions),
        escapeCSV(contact.lastContactDate),
        escapeCSV(contact.contactEvents),
        
        // LinkedIn
        escapeCSV(contact.linkedinProfile),
        
        // Preferences & Notes
        escapeCSV(contact.knownPreferences),
        escapeCSV(contact.entertainment),
        escapeCSV(decisionBiasStr),
        escapeCSV(contact.followThrough),
        escapeCSV(contact.values),
        escapeCSV(contact.painPoints),
        escapeCSV(contact.notes),
        escapeCSV(contact.uploadedNotes),
        
        // Diageo Relationship Owners
        escapeCSV(contact.primaryDiageoRelationshipOwners?.ownerName),
        escapeCSV(contact.primaryDiageoRelationshipOwners?.ownerTitle),
        escapeCSV(contact.primaryDiageoRelationshipOwners?.ownerEmail),
        escapeCSV(contact.primaryDiageoRelationshipOwners?.svp),
        escapeCSV(contact.primaryDiageoRelationshipOwners?.sales),
        escapeCSV(contact.primaryDiageoRelationshipOwners?.support),
        escapeCSV(contact.primaryDiageoRelationshipOwners?.salesLastCheckIn),
        escapeCSV(contact.primaryDiageoRelationshipOwners?.supportLastCheckIn),
        
        // Timestamps
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

      const contacts: Contact[] = [];
      const unmatchedAccounts: string[] = [];
      let linkedCount = 0;

      dataRows.forEach((row, index) => {
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

        const getArrayCell = (columnName: string): string[] | undefined => {
          const value = getCell(columnName);
          if (!value) return undefined;
          return value.split(';').map(s => s.trim()).filter(Boolean);
        };

        const getJSONCell = (columnName: string): unknown => {
          const value = getCell(columnName);
          if (!value) return undefined;
          try {
            return JSON.parse(value);
          } catch {
            return undefined;
          }
        };

        const firstName = getCell('First Name');
        const lastName = getCell('Last Name');
        const email = getCell('Email');

        if (!firstName || !lastName || !email) {
          throw new Error(`Row ${index + 2}: First Name, Last Name, and Email are required`);
        }

        const now = new Date().toISOString();

        // Match account name to account ID (case-insensitive)
        const accountName = getCell('Account Name');
        let accountId: string | undefined = undefined;
        let bannerBuyingOfficeId: string | undefined = undefined;
        
        if (accountName) {
          const matchedAccount = existingAccounts.find(
            acc => acc.accountName.toLowerCase() === accountName.toLowerCase()
          );
          
          if (matchedAccount) {
            accountId = matchedAccount.id;
            linkedCount++;
            
            // Try to match banner/buying office
            const bannerName = getCell('Banner Buying Office Name');
            if (bannerName && matchedAccount.bannerBuyingOffices) {
              const matchedBanner = matchedAccount.bannerBuyingOffices.find(
                b => b.accountName.toLowerCase() === bannerName.toLowerCase()
              );
              if (matchedBanner) {
                bannerBuyingOfficeId = matchedBanner.id;
              }
            }
          } else {
            if (!unmatchedAccounts.includes(accountName)) {
              unmatchedAccounts.push(accountName);
            }
          }
        }

        // Match manager name to manager ID
        const managerName = getCell('Manager Name');
        let managerId: string | undefined = undefined;
        if (managerName) {
          const matchedManager = existingContacts.find(c => 
            `${c.firstName} ${c.lastName}`.toLowerCase() === managerName.toLowerCase()
          );
          if (matchedManager) {
            managerId = matchedManager.id;
          }
        }

        // Build primaryDiageoRelationshipOwners object
        const ownerName = getCell('Primary Owner Name');
        const ownerTitle = getCell('Primary Owner Title');
        const ownerEmail = getCell('Primary Owner Email');
        const svp = getCell('SVP');
        const salesRoles = getJSONCell('Sales Roles') as Record<string, string> | undefined;
        const supportRoles = getJSONCell('Support Roles') as Record<string, string> | undefined;
        const salesLastCheckIn = getJSONCell('Sales Last Check In') as Record<string, string> | undefined;
        const supportLastCheckIn = getJSONCell('Support Last Check In') as Record<string, string> | undefined;

        const primaryDiageoRelationshipOwners = (ownerName || ownerTitle || ownerEmail || svp) ? {
          ownerName: ownerName || '',
          ownerTitle: ownerTitle || '',
          ownerEmail: ownerEmail || '',
          svp: svp || '',
          sales: salesRoles || {},
          support: supportRoles || {},
          salesLastCheckIn: salesLastCheckIn || {},
          supportLastCheckIn: supportLastCheckIn || {}
        } : undefined;

        contacts.push({
          id: `imported-${Date.now()}-${index}`,
          
          // Basic Information
          firstName,
          preferredFirstName: getCell('Preferred First Name') || undefined,
          lastName,
          email,
          headshot: undefined, // Don't import headshot from CSV
          title: getCell('Title') || undefined,
          currentRoleTenure: getCell('Current Role Tenure') || undefined,
          accountId,
          bannerBuyingOfficeId,
          managerId,
          isPrimaryContact: getBooleanCell('Is Primary Contact') || false,
          contactActiveStatus: getCell('Contact Active Status') || 'Active',
          
          // Contact Information
          officePhone: getCell('Office Phone') || undefined,
          mobilePhone: getCell('Mobile Phone') || undefined,
          preferredContactMethod: getCell('Preferred Contact Method') || undefined,
          preferredShippingAddress: getCell('Preferred Shipping Address') || undefined,
          
          // Ways of Working
          relationshipStatus: getCell('Advocacy Style') || undefined,
          categorySegmentOwnership: getArrayCell('Category Segment Ownership') || [],
          responsibilityLevels: getJSONCell('Responsibility Levels') as Record<string, string> || {},
          
          // Important Dates
          birthday: getCell('Birthday') || undefined,
          birthdayAlert: getBooleanCell('Birthday Alert') || false,
          birthdayAlertOptions: getArrayCell('Birthday Alert Options') || [],
          nextContactDate: getCell('Next Contact Date') || undefined,
          nextContactAlert: getBooleanCell('Next Contact Alert') || false,
          nextContactAlertOptions: getArrayCell('Next Contact Alert Options') || [],
          lastContactDate: getCell('Last Contact Date') || undefined,
          contactEvents: getJSONCell('Contact Events') as Contact['contactEvents'] || [],
          
          // LinkedIn
          linkedinProfile: getCell('LinkedIn Profile') || undefined,
          
          // Preferences & Notes
          knownPreferences: getCell('Known Preferences') || undefined,
          entertainment: getCell('Entertainment') || undefined,
          decisionBiasProfile: getArrayCell('Decision Bias Profile') || [],
          followThrough: getCell('Follow Through') || undefined,
          values: getCell('Values') || undefined,
          painPoints: getCell('Pain Points') || undefined,
          notes: getCell('Notes') || undefined,
          uploadedNotes: getJSONCell('Uploaded Notes') as Contact['uploadedNotes'] || [],
          
          // Diageo Relationship Owners
          primaryDiageoRelationshipOwners,
          
          // Timestamps
          createdAt: getCell('Created At') || now,
          lastModified: getCell('Last Modified') || now
        });
      });

      onImport(contacts);
      
      // Build detailed success message
      let message = `Successfully imported ${contacts.length} contact(s).`;
      if (linkedCount > 0) {
        message += ` ${linkedCount} contact(s) linked to existing accounts.`;
      }
      if (unmatchedAccounts.length > 0) {
        message += ` Warning: The following account names were not found and contacts were not linked: ${unmatchedAccounts.join(', ')}`;
      }
      
      setImportResult({
        success: true,
        message,
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
            Download the CSV template with all your current contact data pre-populated. This includes ALL fields from the Contact Form.
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
            <li>Use TRUE/FALSE for Yes/No columns (Is Primary Contact, Birthday Alert, etc.)</li>
            <li>Use semicolon-separated values for multi-select fields (e.g., "Vodka; Whiskey; Tequila")</li>
            <li>Complex fields like Responsibility Levels use JSON format</li>
            <li>Account Name must match an existing account exactly to link</li>
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
          <h4 className="text-sm font-medium mb-2">Column Reference</h4>
          <div className="text-xs text-gray-600 space-y-1 max-h-64 overflow-y-auto">
            <p><strong>Basic Info:</strong> First Name*, Last Name*, Email*, Preferred First Name, Headshot, Title, Current Role Tenure, Account Name, Banner Buying Office Name, Manager Name, Is Primary Contact, Contact Active Status</p>
            <p><strong>Contact Info:</strong> Office Phone, Mobile Phone, Preferred Contact Method (mobile phone/text/email/office phone), Preferred Shipping Address</p>
            <p><strong>Ways of Working:</strong> Advocacy Style (Promoter/Supporter/Neutral/Detractor/Adversarial), Category Segment Ownership (semicolon-separated), Responsibility Levels (JSON)</p>
            <p><strong>Important Dates:</strong> Birthday (MM-DD), Birthday Alert, Birthday Alert Options, Next Contact Date, Next Contact Alert, Next Contact Alert Options, Last Contact Date, Contact Events (JSON)</p>
            <p><strong>LinkedIn:</strong> LinkedIn Profile (URL)</p>
            <p><strong>Preferences:</strong> Known Preferences, Entertainment (Yes/Yes with Restrictions/No), Decision Bias Profile (semicolon-separated), Follow Through (High/Medium/Low), Values, Pain Points, Notes</p>
            <p><strong>Diageo Owners:</strong> Primary Owner Name, Primary Owner Title, Primary Owner Email, SVP, Sales Roles (JSON), Support Roles (JSON), Sales Last Check In (JSON), Support Last Check In (JSON)</p>
            <p><strong>Timestamps:</strong> Created At, Last Modified</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}