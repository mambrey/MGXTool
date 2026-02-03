/**
 * Service for fetching market data from local CSV file
 */

export interface MarketData {
  tickerSymbol: string;
  currentPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  annualSales: number;
  marketCap: number;
  volumeAverage: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  percentChange: number;
  actualChange: number;
  previousClose: number;
  name: string;
  currency: string;
}

/**
 * Parse CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Fetch market data from CSV file for a specific ticker symbol
 */
export async function fetchMarketDataFromCSV(tickerSymbol: string): Promise<MarketData | null> {
  try {
    console.log('[CSV Service] Fetching market data for ticker:', tickerSymbol);
    
    const response = await fetch('/data/market-data.csv');
    
    if (!response.ok) {
      console.error('[CSV Service] Failed to fetch CSV:', response.statusText);
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log('[CSV Service] CSV file loaded, length:', csvText.length);
    
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log('[CSV Service] Total lines:', lines.length);
    
    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }
    
    // Parse header to get column indices
    const headers = parseCSVLine(lines[0]);
    console.log('[CSV Service] Headers:', headers);
    
    const tickerIndex = headers.findIndex(h => h.toLowerCase().includes('ticker'));
    console.log('[CSV Service] Ticker column index:', tickerIndex);
    
    if (tickerIndex === -1) {
      throw new Error('Ticker_symbol column not found in CSV');
    }
    
    // Search for the ticker symbol (case-insensitive)
    const upperTickerSymbol = tickerSymbol.toUpperCase().trim();
    console.log('[CSV Service] Searching for ticker:', upperTickerSymbol);
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const csvTicker = values[tickerIndex]?.toUpperCase().trim();
      
      console.log(`[CSV Service] Line ${i}: Comparing "${csvTicker}" with "${upperTickerSymbol}"`);
      
      if (csvTicker === upperTickerSymbol) {
        console.log('[CSV Service] Match found! Parsing data...');
        
        // Found the ticker, parse the data
        const getColumnValue = (columnName: string): string => {
          const index = headers.findIndex(h => 
            h.toLowerCase().replace(/_/g, '').includes(columnName.toLowerCase().replace(/_/g, ''))
          );
          const value = index !== -1 ? values[index] : '';
          console.log(`[CSV Service] ${columnName}: ${value} (index: ${index})`);
          return value;
        };
        
        const parseNumber = (value: string): number => {
          const cleaned = value.replace(/[^0-9.-]/g, '');
          const result = cleaned ? parseFloat(cleaned) : 0;
          return result;
        };
        
        const marketData = {
          tickerSymbol: values[tickerIndex],
          currentPrice: parseNumber(getColumnValue('current_price')),
          openPrice: parseNumber(getColumnValue('open_price')),
          highPrice: parseNumber(getColumnValue('high_price')),
          lowPrice: parseNumber(getColumnValue('low_price')),
          annualSales: parseNumber(getColumnValue('annual_sales')),
          marketCap: parseNumber(getColumnValue('market_cap')),
          volumeAverage: parseNumber(getColumnValue('volume_average')),
          fiftyTwoWeekHigh: parseNumber(getColumnValue('fifty_two_week_high')),
          fiftyTwoWeekLow: parseNumber(getColumnValue('fifty_two_week_low')),
          percentChange: parseNumber(getColumnValue('percent_change')),
          actualChange: parseNumber(getColumnValue('actual_change')),
          previousClose: parseNumber(getColumnValue('previous_close')),
          name: getColumnValue('name'),
          currency: getColumnValue('currency') || 'USD'
        };
        
        console.log('[CSV Service] Market data parsed:', marketData);
        return marketData;
      }
    }
    
    // Ticker not found
    console.log('[CSV Service] Ticker not found in CSV');
    return null;
    
  } catch (error) {
    console.error('[CSV Service] Error fetching market data from CSV:', error);
    throw error;
  }
}

/**
 * Get all available ticker symbols from the CSV
 */
export async function getAllTickerSymbols(): Promise<string[]> {
  try {
    const response = await fetch('/data/market-data.csv');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return [];
    }
    
    const headers = parseCSVLine(lines[0]);
    const tickerIndex = headers.findIndex(h => h.toLowerCase().includes('ticker'));
    
    if (tickerIndex === -1) {
      return [];
    }
    
    const tickers: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values[tickerIndex]) {
        tickers.push(values[tickerIndex]);
      }
    }
    
    return tickers;
    
  } catch (error) {
    console.error('Error getting ticker symbols:', error);
    return [];
  }
}