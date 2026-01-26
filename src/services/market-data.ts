/**
 * IEX Cloud API Service
 * Fetches real-time stock market data using IEX Cloud API
 * Free tier: 50,000 API calls per month
 * Documentation: https://iexcloud.io/docs/api/
 */

// Get API key from environment variable or use placeholder
const IEX_CLOUD_API_KEY = import.meta.env.VITE_IEX_CLOUD_API_KEY || 'YOUR_IEX_CLOUD_API_KEY';
const BASE_URL = 'https://cloud.iexapis.com/stable';

export interface MarketSnapshot {
  symbol: string;
  name: string;
  currentPrice: string;
  percentChange: string;
  marketCap: string;
  highPrice: string;
  lowPrice: string;
  openPrice: string;
  previousClose: string;
  peRatio: string;
  volume: string;
  dividendYield: string;
  fiftyTwoWeekLow: string;
  fiftyTwoWeekHigh: string;
  currency: string;
  lastUpdated: string;
}

interface IEXQuoteResponse {
  symbol?: string;
  companyName?: string;
  latestPrice?: number;
  iexRealtimePrice?: number;
  change?: number;
  previousClose?: number;
  close?: number;
  marketCap?: number;
  high?: number;
  low?: number;
  open?: number;
  iexOpen?: number;
  peRatio?: number;
  volume?: number;
  latestVolume?: number;
  week52High?: number;
  week52Low?: number;
  ytdChange?: number;
}

interface IEXCompanyResponse {
  companyName?: string;
  description?: string;
  exchange?: string;
  industry?: string;
  sector?: string;
  CEO?: string;
  website?: string;
}

interface IEXStatsResponse {
  marketcap?: number;
  peRatio?: number;
  dividendYield?: number;
  week52high?: number;
  week52low?: number;
  beta?: number;
  ttmEPS?: number;
  ttmDividendRate?: number;
}

class IEXCloudService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetch quote data (real-time price, volume, etc.)
   * Endpoint: /stock/{symbol}/quote
   * Cost: 1 credit per call
   */
  async getQuote(symbol: string): Promise<IEXQuoteResponse | null> {
    try {
      const url = `${BASE_URL}/stock/${symbol}/quote?token=${this.apiKey}`;
      console.log(`📡 Fetching quote from IEX Cloud: ${symbol}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Invalid ticker symbol: ${symbol}`);
        }
        if (response.status === 403) {
          throw new Error('API key is invalid or has insufficient permissions');
        }
        if (response.status === 429) {
          throw new Error('API rate limit reached. Please try again later.');
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Quote data received:', data);
      return data as IEXQuoteResponse;
    } catch (error) {
      console.error('❌ Error fetching quote:', error);
      throw error;
    }
  }

  /**
   * Fetch company information (name, description, etc.)
   * Endpoint: /stock/{symbol}/company
   * Cost: 1 credit per call
   */
  async getCompany(symbol: string): Promise<IEXCompanyResponse | null> {
    try {
      const url = `${BASE_URL}/stock/${symbol}/company?token=${this.apiKey}`;
      console.log(`📡 Fetching company info from IEX Cloud: ${symbol}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`⚠️ Company info not available for ${symbol}`);
        return null;
      }

      const data = await response.json();
      console.log('📊 Company data received:', data);
      return data as IEXCompanyResponse;
    } catch (error) {
      console.warn('⚠️ Error fetching company info (non-critical):', error);
      return null;
    }
  }

  /**
   * Fetch advanced stats (PE ratio, dividend yield, 52-week range, etc.)
   * Endpoint: /stock/{symbol}/stats
   * Cost: 3 credits per call
   */
  async getStats(symbol: string): Promise<IEXStatsResponse | null> {
    try {
      const url = `${BASE_URL}/stock/${symbol}/stats?token=${this.apiKey}`;
      console.log(`📡 Fetching stats from IEX Cloud: ${symbol}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`⚠️ Stats not available for ${symbol}`);
        return null;
      }

      const data = await response.json();
      console.log('📊 Stats data received:', data);
      return data as IEXStatsResponse;
    } catch (error) {
      console.warn('⚠️ Error fetching stats (non-critical):', error);
      return null;
    }
  }

  /**
   * Fetch complete market snapshot (combines quote, company, and stats data)
   * Total cost: 5 credits per call (1 for quote + 1 for company + 3 for stats)
   */
  async getMarketSnapshot(symbol: string): Promise<MarketSnapshot | null> {
    try {
      console.log(`🔍 Fetching market data for ${symbol} from IEX Cloud...`);

      // Fetch quote first (required), then company and stats in parallel
      const quote = await this.getQuote(symbol);
      
      if (!quote) {
        throw new Error(`No quote data available for symbol: ${symbol}`);
      }

      // Fetch company and stats in parallel (both optional)
      const [company, stats] = await Promise.all([
        this.getCompany(symbol),
        this.getStats(symbol)
      ]);

      console.log('📦 Quote result: Success');
      console.log('📦 Company result:', company ? 'Success' : 'Not available');
      console.log('📦 Stats result:', stats ? 'Success' : 'Not available');

      // Calculate percent change
      const change = quote.change || 0;
      const previousClose = quote.previousClose || quote.close || 0;
      const percentChange = previousClose !== 0 
        ? ((change / previousClose) * 100).toFixed(2)
        : '0.00';

      // Combine data from all sources
      const snapshot: MarketSnapshot = {
        symbol: quote.symbol || symbol,
        name: company?.companyName || quote.companyName || symbol,
        currentPrice: quote.latestPrice?.toString() || quote.iexRealtimePrice?.toString() || 'N/A',
        percentChange: percentChange,
        marketCap: quote.marketCap?.toString() || stats?.marketcap?.toString() || 'N/A',
        highPrice: quote.high?.toString() || 'N/A',
        lowPrice: quote.low?.toString() || 'N/A',
        openPrice: quote.open?.toString() || quote.iexOpen?.toString() || 'N/A',
        previousClose: quote.previousClose?.toString() || quote.close?.toString() || 'N/A',
        peRatio: quote.peRatio?.toString() || stats?.peRatio?.toString() || 'N/A',
        volume: quote.volume?.toString() || quote.latestVolume?.toString() || 'N/A',
        dividendYield: stats?.dividendYield?.toString() || quote.ytdChange?.toString() || 'N/A',
        fiftyTwoWeekLow: quote.week52Low?.toString() || stats?.week52low?.toString() || 'N/A',
        fiftyTwoWeekHigh: quote.week52High?.toString() || stats?.week52high?.toString() || 'N/A',
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      };

      console.log('✅ Market snapshot created:', snapshot);
      return snapshot;
    } catch (error) {
      console.error('❌ Error fetching market snapshot:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const marketDataService = new IEXCloudService(IEX_CLOUD_API_KEY);