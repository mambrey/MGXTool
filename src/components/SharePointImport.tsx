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
    // Generate CSV with current account data - removed Industry and Account Status
    const headers = [
      'Account Name', 'Account Owner', 'VP', 'Revenue', 'Employees',
      'Website', 'Address', 'Phone', 'Email', 'Description', 'Channel', 'Footprint',
      'Operating States', 'Publicly Traded', 'Ticker Symbol', 'Parent Company', 'Primary Contact ID',
      'Total Buying Offices', 'Current Price', 'Percent Change', 'High Price', 'Low Price',
      'Open Price', 'Previous Close', 'Market Cap', 'PEG Ratio', 'Annual Sales', 'Dividend Yield',
      '52 Week Low', '52 Week High', 'Percent of General Market', 'Sales 52 Weeks', 'Sales 12 Weeks',
      'Sales 4 Weeks', 'Category Captain', 'Category Advisor', 'Pricing Strategy', 'Private Label',
      'Innovation Appetite', 'Has Ecommerce', 'Is JBP', 'Last JBP Date', 'Next JBP Date',
      'Has Planograms', 'HQ Influence', 'Display Mandates', 'Fulfillment Types', 'Spirits Outlets',
      'Reset Window Q1', 'Reset Window Q2', 'Reset Window Q3', 'Reset Window Q4',
      'Reset Window Spring', 'Reset Window Summer', 'Reset Window Fall', 'Reset Window Winter',
      'Strategic Priorities', 'Key Competitors', 'Created At', 'Last Modified'
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

    // Add existing accounts to the template
    existingAccounts.forEach(account => {
      // Handle operatingStates safely - it might be a string or an array
      let operatingStatesStr = '';
      if (account.operatingStates) {
        if (Array.isArray(account.operatingStates)) {
          operatingStatesStr = account.operatingStates.join(', ');
        } else if (typeof account.operatingStates === 'string') {
          operatingStatesStr = account.operatingStates;
        }
      }
      
      const row = [
        escapeCSV(account.accountName),
        escapeCSV(account.accountOwner),
        escapeCSV(account.vp),
        escapeCSV(account.revenue),
        escapeCSV(account.employees),
        escapeCSV(account.website),
        escapeCSV(account.address),
        escapeCSV(account.phone),
        escapeCSV(account.email),
        escapeCSV(account.description),
        escapeCSV(account.channel),
        escapeCSV(account.footprint),
        escapeCSV(operatingStatesStr),
        escapeCSV(account.publiclyTraded),
        escapeCSV(account.tickerSymbol),
        escapeCSV(account.parentCompany),
        escapeCSV(account.primaryContactId),
        escapeCSV(account.totalBuyingOffices),
        escapeCSV(account.currentPrice),
        escapeCSV(account.percentChange),
        escapeCSV(account.highPrice),
        escapeCSV(account.lowPrice),
        escapeCSV(account.openPrice),
        escapeCSV(account.previousClose),
        escapeCSV(account.marketCap),
        escapeCSV(account.pegRatio),
        escapeCSV(account.annualSales),
        escapeCSV(account.dividendYield),
        escapeCSV(account.fiftyTwoWeekLow),
        escapeCSV(account.fiftyTwoWeekHigh),
        escapeCSV(account.percentOfGeneralMarket),
        escapeCSV(account.sales52Weeks),
        escapeCSV(account.sales12Weeks),
        escapeCSV(account.sales4Weeks),
        escapeCSV(account.categoryCaptain),
        escapeCSV(account.categoryAdvisor),
        escapeCSV(account.pricingStrategy),
        escapeCSV(account.privateLabel),
        escapeCSV(account.innovationAppetite),
        escapeCSV(account.hasEcommerce),
        escapeCSV(account.isJBP),
        escapeCSV(account.lastJBPDate),
        escapeCSV(account.nextJBPDate),
        escapeCSV(account.hasPlanograms),
        escapeCSV(account.hqInfluence),
        escapeCSV(account.displayMandates),
        escapeCSV(account.fulfillmentTypes),
        escapeCSV(account.spiritsOutlets),
        escapeCSV(account.resetWindowQ1),
        escapeCSV(account.resetWindowQ2),
        escapeCSV(account.resetWindowQ3),
        escapeCSV(account.resetWindowQ4),
        escapeCSV(account.resetWindowSpring),
        escapeCSV(account.resetWindowSummer),
        escapeCSV(account.resetWindowFall),
        escapeCSV(account.resetWindowWinter),
        escapeCSV(account.strategicPriorities),
        escapeCSV(account.keyCompetitors),
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

        const accountName = getCell('Account Name');
        if (!accountName) {
          throw new Error(`Row ${index + 2}: Account Name is required`);
        }

        const operatingStatesStr = getCell('Operating States');
        const operatingStates = operatingStatesStr 
          ? operatingStatesStr.split(',').map(s => s.trim()).filter(Boolean)
          : undefined;

        const now = new Date().toISOString();

        return {
          id: `imported-${Date.now()}-${index}`,
          accountName,
          industry: 'Not Specified', // Default value since Industry column is removed
          accountStatus: 'Prospect' as 'Active' | 'Inactive' | 'Prospect', // Default value since Account Status column is removed
          accountOwner: getCell('Account Owner') || 'Unassigned',
          vp: getCell('VP') || undefined,
          revenue: getNumberCell('Revenue'),
          employees: getNumberCell('Employees'),
          website: getCell('Website') || undefined,
          address: getCell('Address') || undefined,
          phone: getCell('Phone') || undefined,
          email: getCell('Email') || undefined,
          description: getCell('Description') || undefined,
          channel: getCell('Channel') || undefined,
          footprint: getCell('Footprint') || undefined,
          operatingStates,
          publiclyTraded: getBooleanCell('Publicly Traded'),
          tickerSymbol: getCell('Ticker Symbol') || undefined,
          parentCompany: getCell('Parent Company') || undefined,
          primaryContactId: getCell('Primary Contact ID') || undefined,
          totalBuyingOffices: getCell('Total Buying Offices') || undefined,
          // Market Snapshot
          currentPrice: getCell('Current Price') || undefined,
          percentChange: getCell('Percent Change') || undefined,
          highPrice: getCell('High Price') || undefined,
          lowPrice: getCell('Low Price') || undefined,
          openPrice: getCell('Open Price') || undefined,
          previousClose: getCell('Previous Close') || undefined,
          marketCap: getCell('Market Cap') || undefined,
          pegRatio: getCell('PEG Ratio') || undefined,
          annualSales: getCell('Annual Sales') || undefined,
          dividendYield: getCell('Dividend Yield') || undefined,
          fiftyTwoWeekLow: getCell('52 Week Low') || undefined,
          fiftyTwoWeekHigh: getCell('52 Week High') || undefined,
          // Sales Data
          percentOfGeneralMarket: getCell('Percent of General Market') || undefined,
          sales52Weeks: getCell('Sales 52 Weeks') || undefined,
          sales12Weeks: getCell('Sales 12 Weeks') || undefined,
          sales4Weeks: getCell('Sales 4 Weeks') || undefined,
          // Strategy & Capabilities
          categoryCaptain: getCell('Category Captain') || undefined,
          categoryAdvisor: getCell('Category Advisor') || undefined,
          pricingStrategy: getBooleanCell('Pricing Strategy'),
          privateLabel: getBooleanCell('Private Label'),
          innovationAppetite: getNumberCell('Innovation Appetite'),
          hasEcommerce: getBooleanCell('Has Ecommerce'),
          isJBP: getBooleanCell('Is JBP'),
          lastJBPDate: getCell('Last JBP Date') || undefined,
          nextJBPDate: getCell('Next JBP Date') || undefined,
          hasPlanograms: getBooleanCell('Has Planograms'),
          hqInfluence: getBooleanCell('HQ Influence'),
          displayMandates: getBooleanCell('Display Mandates'),
          fulfillmentTypes: getCell('Fulfillment Types') || undefined,
          spiritsOutlets: getCell('Spirits Outlets') || undefined,
          // Reset Windows
          resetWindowQ1: getCell('Reset Window Q1') || undefined,
          resetWindowQ2: getCell('Reset Window Q2') || undefined,
          resetWindowQ3: getCell('Reset Window Q3') || undefined,
          resetWindowQ4: getCell('Reset Window Q4') || undefined,
          resetWindowSpring: getCell('Reset Window Spring') || undefined,
          resetWindowSummer: getCell('Reset Window Summer') || undefined,
          resetWindowFall: getCell('Reset Window Fall') || undefined,
          resetWindowWinter: getCell('Reset Window Winter') || undefined,
          // Strategic Information
          strategicPriorities: getCell('Strategic Priorities') || undefined,
          keyCompetitors: getCell('Key Competitors') || undefined,
          customerEvents: [],
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
          SharePoint Import
        </CardTitle>
        <CardDescription>
          Import accounts from SharePoint Excel file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Step 1: Download Template</h4>
          <p className="text-sm text-gray-600">
            Download the CSV template with all your current account data pre-populated. Any accounts you've added (like Albertsons Safeway) will be included in the download.
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
            <li>Use comma-separated values for Operating States (e.g., "CA, NY, TX")</li>
            <li>Leave cells blank if data is not available</li>
            <li>Industry and Account Status will be set to default values ("Not Specified" and "Prospect")</li>
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
          <h4 className="text-sm font-medium mb-2">Column Mapping Reference</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Required:</strong> Account Name, Account Owner</p>
            <p><strong>Optional:</strong> VP, Revenue, Employees, Website, Address, Phone, Email, Description, Channel, Footprint, Operating States, Publicly Traded, Ticker Symbol, Parent Company, Total Buying Offices</p>
            <p><strong>Market Data:</strong> Current Price, Percent Change, High Price, Low Price, Open Price, Previous Close, Market Cap, PEG Ratio, Annual Sales, Dividend Yield, 52 Week Low, 52 Week High</p>
            <p><strong>Sales Data:</strong> Percent of General Market, Sales 52 Weeks, Sales 12 Weeks, Sales 4 Weeks</p>
            <p><strong>Strategy:</strong> Category Captain, Category Advisor, Pricing Strategy, Private Label, Innovation Appetite, Has Ecommerce, Is JBP, Last JBP Date, Next JBP Date, Has Planograms, HQ Influence, Display Mandates, Fulfillment Types, Spirits Outlets</p>
            <p><strong>Reset Windows:</strong> Q1, Q2, Q3, Q4, Spring, Summer, Fall, Winter</p>
            <p><strong>Strategic Info:</strong> Strategic Priorities, Key Competitors</p>
            <p><strong>Note:</strong> Industry and Account Status columns have been removed. Imported accounts will default to "Not Specified" for Industry and "Prospect" for Account Status.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}