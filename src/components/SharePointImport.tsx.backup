import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Account } from '@/types/crm';

interface SharePointImportProps {
  onImport: (accounts: Account[]) => void;
  existingAccounts?: Account[];
}

export default function SharePointImport({ onImport, existingAccounts = [] }: SharePointImportProps) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  const downloadTemplate = () => {
    // Generate CSV with ALL account form fields
    const headers = [
      // Basic Information
      'Account Name', 'Parent Company', 'Ticker Symbol', 'Channel', 'Sub Channel',
      'Geographic Scope', 'Operating States', 'All Spirits Outlets', 'Full Proof Outlets',
      
      // Execution Reliability
      'Execution Reliability Score', 'Execution Reliability Rationale',
      
      // Parent Information
      'Address', 'Website',
      
      // HQ Level of Influence
      'Influence Assortment Shelf', 'Private Label', 'Influence Display Merchandising',
      'Display Mandates', 'Influence Price Promo', 'Pricing Strategy',
      'Influence Ecommerce', 'Influence Digital', 'Influence Buying PO Ownership',
      'Influence Shrink Management',
      
      // Sampling & Innovation
      'Influence In Store Events', 'Allows Wet Sampling', 'Innovation Appetite',
      'Innovation Lead Time',
      
      // E-Commerce & Digital
      'Ecommerce Maturity Level', 'Ecommerce Sales Percentage', 'Fulfillment Types',
      'Ecommerce Partners',
      
      // Category Advisory Roles
      'Category Captain', 'Category Validator',
      
      // Planogram Information
      'Has Planograms', 'Planogram Written By', 'Affected Categories', 'Reset Frequency',
      'Reset Window Lead Time', 'Has Different Reset Windows', 'Reset Window Months',
      'Category Reset Windows',
      
      // JBP Information
      'Is JBP', 'Last JBP Date', 'Next JBP Date', 'Next JBP Alert', 'Next JBP Alert Options',
      
      // Additional Information
      'Strategic Priorities', 'Key Competitors', 'Designated Charities', 'Customer Events',
      
      // Spirits Outlets by State (JSON format)
      'Spirits Outlets By State',
      
      // Banner/Buying Offices (JSON format)
      'Banner Buying Offices',
      
      // Legacy/Other fields
      'Account Owner', 'VP', 'Revenue', 'Employees', 'Phone', 'Email', 'Description',
      'Publicly Traded', 'Primary Contact ID', 'Total Buying Offices',
      'Percent of General Market', 'Sales 52 Weeks', 'Sales 12 Weeks', 'Sales 4 Weeks',
      
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

    // Add existing accounts to the template
    existingAccounts.forEach(account => {
      // Handle operatingStates safely - it might be a string or an array
      let operatingStatesStr = '';
      if (account.operatingStates) {
        if (Array.isArray(account.operatingStates)) {
          operatingStatesStr = account.operatingStates.join('; ');
        } else if (typeof account.operatingStates === 'string') {
          operatingStatesStr = account.operatingStates;
        }
      }

      // Handle keyCompetitors - might be string or array
      let keyCompetitorsStr = '';
      if (account.keyCompetitors) {
        if (Array.isArray(account.keyCompetitors)) {
          keyCompetitorsStr = account.keyCompetitors.join('; ');
        } else if (typeof account.keyCompetitors === 'string') {
          keyCompetitorsStr = account.keyCompetitors;
        }
      }
      
      const row = [
        // Basic Information
        escapeCSV(account.accountName),
        escapeCSV(account.parentCompany),
        escapeCSV(account.tickerSymbol),
        escapeCSV(account.channel),
        escapeCSV(account.subChannel),
        escapeCSV(account.footprint),
        escapeCSV(operatingStatesStr),
        escapeCSV(account.allSpiritsOutlets),
        escapeCSV(account.fullProofOutlets),
        
        // Execution Reliability
        escapeCSV(account.executionReliabilityScore),
        escapeCSV(account.executionReliabilityRationale),
        
        // Parent Information
        escapeCSV(account.address),
        escapeCSV(account.website),
        
        // HQ Level of Influence
        escapeCSV(account.influenceAssortmentShelf),
        escapeCSV(account.privateLabel),
        escapeCSV(account.influenceDisplayMerchandising),
        escapeCSV(account.displayMandates),
        escapeCSV(account.influencePricePromo),
        escapeCSV(account.pricingStrategy),
        escapeCSV(account.influenceEcommerce),
        escapeCSV(account.influenceDigital),
        escapeCSV(account.influenceBuyingPOOwnership),
        escapeCSV(account.influenceShrinkManagement),
        
        // Sampling & Innovation
        escapeCSV(account.influenceInStoreEvents),
        escapeCSV(account.allowsWetSampling),
        escapeCSV(account.innovationAppetite),
        escapeCSV(account.innovationLeadTime),
        
        // E-Commerce & Digital
        escapeCSV(account.ecommerceMaturityLevel),
        escapeCSV(account.ecommerceSalesPercentage),
        escapeCSV(account.fulfillmentTypes),
        escapeCSV(account.ecommercePartners),
        
        // Category Advisory Roles
        escapeCSV(account.categoryCaptain),
        escapeCSV(account.categoryAdvisor),
        
        // Planogram Information
        escapeCSV(account.hasPlanograms),
        escapeCSV(account.planogramWrittenBy),
        escapeCSV(account.affectedCategories),
        escapeCSV(account.resetFrequency),
        escapeCSV(account.resetWindowLeadTime),
        escapeCSV(account.hasDifferentResetWindows),
        escapeCSV(account.resetWindowMonths),
        escapeCSV(account.categoryResetWindows),
        
        // JBP Information
        escapeCSV(account.isJBP),
        escapeCSV(account.lastJBPDate),
        escapeCSV(account.nextJBPDate),
        escapeCSV(account.nextJBPAlert),
        escapeCSV(account.nextJBPAlertOptions),
        
        // Additional Information
        escapeCSV(account.strategicPriorities),
        escapeCSV(keyCompetitorsStr),
        escapeCSV(account.designatedCharities),
        escapeCSV(account.customerEvents),
        
        // Spirits Outlets by State
        escapeCSV(account.spiritsOutletsByState),
        
        // Banner/Buying Offices
        escapeCSV(account.bannerBuyingOffices),
        
        // Legacy/Other fields
        escapeCSV(account.accountOwner),
        escapeCSV(account.vp),
        escapeCSV(account.revenue),
        escapeCSV(account.employees),
        escapeCSV(account.phone),
        escapeCSV(account.email),
        escapeCSV(account.description),
        escapeCSV(account.publiclyTraded),
        escapeCSV(account.primaryContactId),
        escapeCSV(account.totalBuyingOffices),
        escapeCSV(account.percentOfGeneralMarket),
        escapeCSV(account.sales52Weeks),
        escapeCSV(account.sales12Weeks),
        escapeCSV(account.sales4Weeks),
        
        // Timestamps
        escapeCSV(account.createdAt),
        escapeCSV(account.lastModified)
      ];
      
      rows.push(row.join(','));
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'SharePoint_Accounts_Template.csv';
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

      const accounts: Account[] = dataRows.map((row, index) => {
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

        const getNumberCell = (columnName: string): number | undefined => {
          const value = getCell(columnName);
          const num = parseFloat(value.replace(/[$,]/g, ''));
          return isNaN(num) ? undefined : num;
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

        const accountName = getCell('Account Name');
        if (!accountName) {
          throw new Error(`Row ${index + 2}: Account Name is required`);
        }

        const now = new Date().toISOString();

        return {
          id: `imported-${Date.now()}-${index}`,
          
          // Basic Information
          accountName,
          parentCompany: getCell('Parent Company') || undefined,
          tickerSymbol: getCell('Ticker Symbol') || undefined,
          channel: getCell('Channel') || undefined,
          subChannel: getCell('Sub Channel') || undefined,
          footprint: getCell('Geographic Scope') || undefined,
          operatingStates: getArrayCell('Operating States'),
          allSpiritsOutlets: getCell('All Spirits Outlets') || undefined,
          fullProofOutlets: getCell('Full Proof Outlets') || undefined,
          
          // Execution Reliability
          executionReliabilityScore: getCell('Execution Reliability Score') || undefined,
          executionReliabilityRationale: getCell('Execution Reliability Rationale') || undefined,
          
          // Parent Information
          address: getCell('Address') || undefined,
          website: getCell('Website') || undefined,
          
          // HQ Level of Influence
          influenceAssortmentShelf: getCell('Influence Assortment Shelf') || undefined,
          privateLabel: getCell('Private Label') || undefined,
          influenceDisplayMerchandising: getCell('Influence Display Merchandising') || undefined,
          displayMandates: getCell('Display Mandates') || undefined,
          influencePricePromo: getCell('Influence Price Promo') || undefined,
          pricingStrategy: getCell('Pricing Strategy') || undefined,
          influenceEcommerce: getCell('Influence Ecommerce') || undefined,
          influenceDigital: getCell('Influence Digital') || undefined,
          influenceBuyingPOOwnership: getCell('Influence Buying PO Ownership') || undefined,
          influenceShrinkManagement: getCell('Influence Shrink Management') || undefined,
          
          // Sampling & Innovation
          influenceInStoreEvents: getCell('Influence In Store Events') || undefined,
          allowsWetSampling: getCell('Allows Wet Sampling') || undefined,
          innovationAppetite: getCell('Innovation Appetite') || undefined,
          innovationLeadTime: getCell('Innovation Lead Time') || undefined,
          
          // E-Commerce & Digital
          ecommerceMaturityLevel: getCell('Ecommerce Maturity Level') || undefined,
          ecommerceSalesPercentage: getCell('Ecommerce Sales Percentage') || undefined,
          fulfillmentTypes: getArrayCell('Fulfillment Types'),
          ecommercePartners: getArrayCell('Ecommerce Partners'),
          
          // Category Advisory Roles
          categoryCaptain: getCell('Category Captain') || undefined,
          categoryAdvisor: getCell('Category Validator') || undefined,
          
          // Planogram Information
          hasPlanograms: getBooleanCell('Has Planograms'),
          planogramWrittenBy: getCell('Planogram Written By') || undefined,
          affectedCategories: getArrayCell('Affected Categories'),
          resetFrequency: getCell('Reset Frequency') || undefined,
          resetWindowLeadTime: getCell('Reset Window Lead Time') || undefined,
          hasDifferentResetWindows: getCell('Has Different Reset Windows') || undefined,
          resetWindowMonths: getArrayCell('Reset Window Months'),
          categoryResetWindows: getJSONCell('Category Reset Windows') as Account['categoryResetWindows'],
          
          // JBP Information
          isJBP: getBooleanCell('Is JBP'),
          lastJBPDate: getCell('Last JBP Date') || undefined,
          nextJBPDate: getCell('Next JBP Date') || undefined,
          nextJBPAlert: getBooleanCell('Next JBP Alert'),
          nextJBPAlertOptions: getArrayCell('Next JBP Alert Options'),
          
          // Additional Information
          strategicPriorities: getCell('Strategic Priorities') || undefined,
          keyCompetitors: getArrayCell('Key Competitors'),
          designatedCharities: getCell('Designated Charities') || undefined,
          customerEvents: getJSONCell('Customer Events') as Account['customerEvents'] || [],
          
          // Spirits Outlets by State
          spiritsOutletsByState: getJSONCell('Spirits Outlets By State') as Account['spiritsOutletsByState'],
          
          // Banner/Buying Offices
          bannerBuyingOffices: getJSONCell('Banner Buying Offices') as Account['bannerBuyingOffices'],
          
          // Legacy/Other fields
          accountOwner: getCell('Account Owner') || 'Unassigned',
          vp: getCell('VP') || undefined,
          revenue: getNumberCell('Revenue'),
          employees: getNumberCell('Employees'),
          phone: getCell('Phone') || undefined,
          email: getCell('Email') || undefined,
          description: getCell('Description') || undefined,
          publiclyTraded: getBooleanCell('Publicly Traded'),
          primaryContactId: getCell('Primary Contact ID') || undefined,
          totalBuyingOffices: getCell('Total Buying Offices') || undefined,
          percentOfGeneralMarket: getCell('Percent of General Market') || undefined,
          sales52Weeks: getCell('Sales 52 Weeks') || undefined,
          sales12Weeks: getCell('Sales 12 Weeks') || undefined,
          sales4Weeks: getCell('Sales 4 Weeks') || undefined,
          
          // Default values for required fields
          industry: 'Not Specified',
          accountStatus: 'Prospect' as 'Active' | 'Inactive' | 'Prospect',
          
          // Timestamps
          createdAt: getCell('Created At') || now,
          lastModified: getCell('Last Modified') || now
        };
      });

      onImport(accounts);
      setImportResult({
        success: true,
        message: `Successfully imported ${accounts.length} account(s)`,
        count: accounts.length
      });
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to import accounts'
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
          Import Accounts
        </CardTitle>
        <CardDescription>
          Import accounts from CSV file - Use this page to upload account data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Step 1: Download Template</h4>
          <p className="text-sm text-gray-600">
            Download the CSV template with all your current account data pre-populated. This includes ALL fields from the Account Form.
          </p>
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Template ({existingAccounts.length} account{existingAccounts.length !== 1 ? 's' : ''})
          </Button>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-medium">Step 2: Fill in Your Data</h4>
          <p className="text-sm text-gray-600">
            Open the downloaded CSV in Excel, add or modify account data, and save as CSV
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Account Name is required</li>
            <li>Use TRUE/FALSE for Yes/No columns</li>
            <li>Use semicolon-separated values for multi-select fields (e.g., "CA; NY; TX")</li>
            <li>Complex fields like Banner/Buying Offices use JSON format</li>
            <li>Leave cells blank if data is not available</li>
          </ul>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-medium">Step 3: Upload CSV File</h4>
          <p className="text-sm text-gray-600">
            Select your filled CSV file to import accounts
          </p>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={importing}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
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
            <p><strong>Basic Info:</strong> Account Name*, Parent Company, Ticker Symbol, Channel, Sub Channel, Geographic Scope, Operating States, All Spirits Outlets, Full Proof Outlets</p>
            <p><strong>Execution:</strong> Execution Reliability Score (1-5), Execution Reliability Rationale</p>
            <p><strong>Parent Info:</strong> Address, Website</p>
            <p><strong>HQ Influence:</strong> Influence Assortment Shelf, Private Label, Influence Display Merchandising, Display Mandates, Influence Price Promo, Pricing Strategy, Influence Ecommerce, Influence Digital, Influence Buying PO Ownership, Influence Shrink Management</p>
            <p><strong>Sampling & Innovation:</strong> Influence In Store Events, Allows Wet Sampling, Innovation Appetite, Innovation Lead Time</p>
            <p><strong>E-Commerce:</strong> Ecommerce Maturity Level, Ecommerce Sales Percentage, Fulfillment Types, Ecommerce Partners</p>
            <p><strong>Category Roles:</strong> Category Captain, Category Validator</p>
            <p><strong>Planogram:</strong> Has Planograms, Planogram Written By, Affected Categories, Reset Frequency, Reset Window Lead Time, Has Different Reset Windows, Reset Window Months, Category Reset Windows (JSON)</p>
            <p><strong>JBP:</strong> Is JBP, Last JBP Date, Next JBP Date, Next JBP Alert, Next JBP Alert Options</p>
            <p><strong>Additional:</strong> Strategic Priorities, Key Competitors, Designated Charities, Customer Events (JSON)</p>
            <p><strong>Complex Data:</strong> Spirits Outlets By State (JSON), Banner Buying Offices (JSON)</p>
            <p><strong>Legacy:</strong> Account Owner, VP, Revenue, Employees, Phone, Email, Description, Publicly Traded, Primary Contact ID, Total Buying Offices, Sales Data</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}