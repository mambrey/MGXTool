import React, { useState } from 'react';
import { Upload, Download, TrendingUp, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Account } from '@/types/crm';

interface MarketSnapshotUploadProps {
  accounts: Account[];
  onUpdate: (updatedAccounts: Account[]) => void;
}

interface MarketSnapshotData {
  tickerSymbol: string;
  currentPrice?: string;
  percentChange?: string;
  marketCap?: string;
  highPrice?: string;
  lowPrice?: string;
  openPrice?: string;
  previousClose?: string;
  annualSales?: string;
  dividendYield?: string;
  fiftyTwoWeekHigh?: string;
  fiftyTwoWeekLow?: string;
  pegRatio?: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  updated?: number;
  failed?: number;
  errors?: string[];
}

export default function MarketSnapshotUpload({ accounts, onUpdate }: MarketSnapshotUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<MarketSnapshotData[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const downloadTemplate = () => {
    // Generate CSV template with market snapshot fields
    const headers = [
      'Ticker Symbol',
      'Current Price',
      'Percent Change',
      'Market Cap',
      'High Price',
      'Low Price',
      'Open Price',
      'Previous Close',
      'Annual Sales',
      'Dividend Yield',
      '52 Week High',
      '52 Week Low',
      'PEG Ratio'
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

    // Add existing accounts with ticker symbols to the template
    const accountsWithTickers = accounts.filter(acc => acc.tickerSymbol);
    accountsWithTickers.forEach(account => {
      const row = [
        escapeCSV(account.tickerSymbol),
        escapeCSV(account.currentPrice),
        escapeCSV(account.percentChange),
        escapeCSV(account.marketCap),
        escapeCSV(account.highPrice),
        escapeCSV(account.lowPrice),
        escapeCSV(account.openPrice),
        escapeCSV(account.previousClose),
        escapeCSV(account.annualSales),
        escapeCSV(account.dividendYield),
        escapeCSV(account.fiftyTwoWeekHigh),
        escapeCSV(account.fiftyTwoWeekLow),
        escapeCSV(account.pegRatio)
      ];
      rows.push(row.join(','));
    });

    // If no accounts have ticker symbols, add example rows
    if (accountsWithTickers.length === 0) {
      rows.push('AAPL,150.25,+2.5%,2.5T,152.00,148.50,149.00,147.50,394.3B,0.52%,182.94,124.17,2.85');
      rows.push('MSFT,380.50,+1.2%,2.8T,382.00,378.00,379.00,376.00,211.9B,0.75%,384.30,213.43,2.92');
    }

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'Market_Snapshot_Template.csv';
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

    setUploading(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length < 2) {
        setImportResult({
          success: false,
          message: 'CSV file is empty or has no data rows'
        });
        setUploading(false);
        return;
      }

      const headers = rows[0].map(h => h.trim());
      const dataRows = rows.slice(1).filter(row => row.some(cell => cell.trim()));

      // Validate required column
      const tickerIndex = headers.findIndex(h => h.toLowerCase() === 'ticker symbol');
      if (tickerIndex === -1) {
        setImportResult({
          success: false,
          message: 'CSV file must contain "Ticker Symbol" column'
        });
        setUploading(false);
        return;
      }

      const marketData: MarketSnapshotData[] = dataRows.map((row, index) => {
        const getCell = (columnName: string): string => {
          const colIndex = headers.findIndex(h => 
            h.toLowerCase() === columnName.toLowerCase()
          );
          return colIndex >= 0 ? row[colIndex]?.trim() || '' : '';
        };

        const tickerSymbol = getCell('Ticker Symbol');
        if (!tickerSymbol) {
          throw new Error(`Row ${index + 2}: Ticker Symbol is required`);
        }

        return {
          tickerSymbol,
          currentPrice: getCell('Current Price') || undefined,
          percentChange: getCell('Percent Change') || undefined,
          marketCap: getCell('Market Cap') || undefined,
          highPrice: getCell('High Price') || undefined,
          lowPrice: getCell('Low Price') || undefined,
          openPrice: getCell('Open Price') || undefined,
          previousClose: getCell('Previous Close') || undefined,
          annualSales: getCell('Annual Sales') || undefined,
          dividendYield: getCell('Dividend Yield') || undefined,
          fiftyTwoWeekHigh: getCell('52 Week High') || undefined,
          fiftyTwoWeekLow: getCell('52 Week Low') || undefined,
          pegRatio: getCell('PEG Ratio') || undefined
        };
      });

      // Show preview dialog
      setPreviewData(marketData);
      setShowPreview(true);
      setUploading(false);
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to parse CSV file'
      });
      setUploading(false);
    } finally {
      event.target.value = '';
    }
  };

  const confirmImport = () => {
    if (!previewData) return;

    const errors: string[] = [];
    let updatedCount = 0;
    let failedCount = 0;

    const updatedAccounts = accounts.map(account => {
      if (!account.tickerSymbol) return account;

      const matchingData = previewData.find(
        data => data.tickerSymbol.toUpperCase() === account.tickerSymbol?.toUpperCase()
      );

      if (matchingData) {
        updatedCount++;
        return {
          ...account,
          currentPrice: matchingData.currentPrice || account.currentPrice,
          percentChange: matchingData.percentChange || account.percentChange,
          marketCap: matchingData.marketCap || account.marketCap,
          highPrice: matchingData.highPrice || account.highPrice,
          lowPrice: matchingData.lowPrice || account.lowPrice,
          openPrice: matchingData.openPrice || account.openPrice,
          previousClose: matchingData.previousClose || account.previousClose,
          annualSales: matchingData.annualSales || account.annualSales,
          dividendYield: matchingData.dividendYield || account.dividendYield,
          fiftyTwoWeekHigh: matchingData.fiftyTwoWeekHigh || account.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: matchingData.fiftyTwoWeekLow || account.fiftyTwoWeekLow,
          pegRatio: matchingData.pegRatio || account.pegRatio,
          lastModified: new Date().toISOString()
        };
      }

      return account;
    });

    // Check for ticker symbols in CSV that don't match any accounts
    previewData.forEach(data => {
      const matchingAccount = accounts.find(
        acc => acc.tickerSymbol?.toUpperCase() === data.tickerSymbol.toUpperCase()
      );
      if (!matchingAccount) {
        failedCount++;
        errors.push(`Ticker Symbol "${data.tickerSymbol}" not found in any account`);
      }
    });

    onUpdate(updatedAccounts);

    setImportResult({
      success: true,
      message: `Successfully updated ${updatedCount} account(s)${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
      updated: updatedCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined
    });

    setShowPreview(false);
    setPreviewData(null);
  };

  const cancelImport = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  const accountsWithTickers = accounts.filter(acc => acc.tickerSymbol);
  const accountsWithoutTickers = accounts.filter(acc => !acc.tickerSymbol);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Upload Market Snapshot
          </CardTitle>
          <CardDescription>
            Update market data for accounts with ticker symbols
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Account Status Summary */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p><strong>Accounts with ticker symbols:</strong> {accountsWithTickers.length}</p>
                <p><strong>Accounts without ticker symbols:</strong> {accountsWithoutTickers.length}</p>
                {accountsWithoutTickers.length > 0 && (
                  <p className="text-sm text-orange-600 mt-2">
                    Note: Accounts without ticker symbols will not be updated. Please add ticker symbols to accounts before uploading market data.
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Step 1: Download Template</h4>
            <p className="text-sm text-gray-600">
              Download the CSV template with current market data for accounts that have ticker symbols.
            </p>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Template ({accountsWithTickers.length} account{accountsWithTickers.length !== 1 ? 's' : ''})
            </Button>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-medium">Step 2: Fill in Market Data</h4>
            <p className="text-sm text-gray-600">
              Open the downloaded CSV in Excel, update market snapshot data, and save as CSV
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li><strong>Ticker Symbol</strong> is required and must match an existing account</li>
              <li>All other fields are optional</li>
              <li>Leave cells blank to keep existing values</li>
              <li>Use proper formatting (e.g., "$150.25" for prices, "+2.5%" for percent change)</li>
            </ul>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-medium">Step 3: Upload CSV File</h4>
            <p className="text-sm text-gray-600">
              Select your filled CSV file to preview and import market data
            </p>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="market-snapshot-upload"
              />
              <label htmlFor="market-snapshot-upload">
                <Button
                  variant="default"
                  disabled={uploading}
                  className="flex items-center gap-2"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Processing...' : 'Upload CSV'}
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
                <div className="space-y-2">
                  <p>{importResult.message}</p>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Errors:</p>
                      <ul className="text-sm list-disc list-inside">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li>... and {importResult.errors.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Supported Fields</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Required:</strong> Ticker Symbol (must match existing account)</p>
              <p><strong>Market Data:</strong> Current Price, Percent Change, Market Cap, High Price, Low Price, Open Price, Previous Close</p>
              <p><strong>Financial Data:</strong> Annual Sales, Dividend Yield, 52 Week High, 52 Week Low, PEG Ratio</p>
              <p><strong>Note:</strong> Only accounts with ticker symbols will be updated. The system matches data by ticker symbol.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Preview Market Snapshot Data</DialogTitle>
            <DialogDescription>
              Review the data before importing. {previewData?.length || 0} record(s) will be processed.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>% Change</TableHead>
                  <TableHead>Market Cap</TableHead>
                  <TableHead>High</TableHead>
                  <TableHead>Low</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData?.map((data, index) => {
                  const matchingAccount = accounts.find(
                    acc => acc.tickerSymbol?.toUpperCase() === data.tickerSymbol.toUpperCase()
                  );
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{data.tickerSymbol}</TableCell>
                      <TableCell>{data.currentPrice || '-'}</TableCell>
                      <TableCell>{data.percentChange || '-'}</TableCell>
                      <TableCell>{data.marketCap || '-'}</TableCell>
                      <TableCell>{data.highPrice || '-'}</TableCell>
                      <TableCell>{data.lowPrice || '-'}</TableCell>
                      <TableCell>
                        {matchingAccount ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {matchingAccount.accountName}
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <X className="w-4 h-4" />
                            Not found
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={cancelImport}>
              Cancel
            </Button>
            <Button onClick={confirmImport}>
              Confirm Import
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}