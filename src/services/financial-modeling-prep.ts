/**
 * Financial Modeling Prep API Service
 * Fetches real-time stock market data using Financial Modeling Prep API
 */

const FMP_API_KEY = 'SWwNNWvzhEb3ze28GzPFaDjZxvihd3qf';
const BASE_URL = 'https://financialmodelingprep.com/stable';

export interface FMPQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
}

export interface FMPProfile {
  symbol: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
}

export interface FMPKeyMetrics {
  date: string;
  symbol: string;
  period: string;
  revenuePerShare: number;
  netIncomePerShare: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  bookValuePerShare: number;
  tangibleBookValuePerShare: number;
  shareholdersEquityPerShare: number;
  interestDebtPerShare: number;
  marketCap: number;
  enterpriseValue: number;
  peRatio: number;
  priceToSalesRatio: number;
  pocfratio: number;
  pfcfRatio: number;
  pbRatio: number;
  ptbRatio: number;
  evToSales: number;
  enterpriseValueOverEBITDA: number;
  evToOperatingCashFlow: number;
  evToFreeCashFlow: number;
  earningsYield: number;
  freeCashFlowYield: number;
  debtToEquity: number;
  debtToAssets: number;
  netDebtToEBITDA: number;
  currentRatio: number;
  interestCoverage: number;
  incomeQuality: number;
  dividendYield: number;
  payoutRatio: number;
  salesGeneralAndAdministrativeToRevenue: number;
  researchAndDdevelopementToRevenue: number;
  intangiblesToTotalAssets: number;
  capexToOperatingCashFlow: number;
  capexToRevenue: number;
  capexToDepreciation: number;
  stockBasedCompensationToRevenue: number;
  grahamNumber: number;
  roic: number;
  returnOnTangibleAssets: number;
  grahamNetNet: number;
  workingCapital: number;
  tangibleAssetValue: number;
  netCurrentAssetValue: number;
  investedCapital: number;
  averageReceivables: number;
  averagePayables: number;
  averageInventory: number;
  daysSalesOutstanding: number;
  daysPayablesOutstanding: number;
  daysOfInventoryOnHand: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  roe: number;
  capexPerShare: number;
  pegRatio?: number;
}

export interface MarketSnapshot {
  peRatio?: string;
  earningDate?: string;
  symbol: string;
  name: string;
  currentPrice: string;
  percentChange: string;
  marketCap: string;
  highPrice: string;
  lowPrice: string;
  openPrice: string;
  previousClose: string;
  pegRatio: string;
  annualSales: string;
  dividendYield: string;
  fiftyTwoWeekLow: string;
  fiftyTwoWeekHigh: string;
  currency: string;
  lastUpdated: string;
}

class FinancialModelingPrepService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetch real-time quote data
   */
  async getQuote(symbol: string): Promise<FMPQuote | null> {
    try {
      const url = `${BASE_URL}/quote?symbol=${symbol}&apikey=${this.apiKey}`;
      console.log(`📡 [FMP] Fetching quote for ${symbol}`);
      console.log(`📡 [FMP] URL: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`❌ [FMP] HTTP Error: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📊 [FMP] Raw API response:`, data);

      // Check for API error messages in response
      if (data.error || data['Error Message']) {
        const errorMsg = data.error || data['Error Message'];
        console.error(`❌ [FMP] API Error: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // FMP returns an array of quotes
      if (Array.isArray(data)) {
        if (data.length === 0) {
          console.warn(`⚠️ [FMP] Empty array returned for ${symbol} - symbol may not exist`);
          throw new Error(`No data found for ticker symbol: ${symbol}. Please verify the symbol is correct.`);
        }
        
        const quote = data[0];
        console.log(`✅ [FMP] Quote data received for ${quote.symbol}`);
        return quote;
      }

      // Handle unexpected response format
      console.error(`❌ [FMP] Unexpected response format:`, typeof data, data);
      throw new Error('Unexpected API response format');
    } catch (error) {
      console.error(`❌ [FMP] Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Fetch company profile data
   */
  async getCompanyProfile(symbol: string): Promise<FMPProfile | null> {
    try {
      const url = `${BASE_URL}/profile?symbol=${symbol}&apikey=${this.apiKey}`;
      console.log(`📡 [FMP] Fetching profile for ${symbol}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`❌ [FMP] HTTP Error: ${response.status} ${response.statusText}`);
        return null; // Profile is optional, don't throw
      }
      
      const data = await response.json();
      console.log(`📊 [FMP] Profile response:`, data);

      if (data.error || data['Error Message']) {
        console.warn(`⚠️ [FMP] Profile API Error: ${data.error || data['Error Message']}`);
        return null;
      }

      if (Array.isArray(data) && data.length > 0) {
        console.log(`✅ [FMP] Profile data received for ${data[0].symbol}`);
        return data[0];
      }

      console.warn(`⚠️ [FMP] No profile data for ${symbol}`);
      return null;
    } catch (error) {
      console.warn(`⚠️ [FMP] Error fetching profile (non-critical):`, error);
      return null;
    }
  }

  /**
   * Fetch key metrics including PEG ratio
   */
  async getKeyMetrics(symbol: string): Promise<FMPKeyMetrics | null> {
    try {
      const url = `${BASE_URL}/key-metrics?symbol=${symbol}&apikey=${this.apiKey}&limit=1`;
      console.log(`📡 [FMP] Fetching key metrics for ${symbol}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`❌ [FMP] HTTP Error: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      console.log(`📊 [FMP] Key metrics response:`, data);

      if (Array.isArray(data) && data.length > 0) {
        console.log(`✅ [FMP] Key metrics received for ${symbol}`);
        return data[0];
      }

      console.warn(`⚠️ [FMP] No key metrics for ${symbol}`);
      return null;
    } catch (error) {
      console.warn(`⚠️ [FMP] Error fetching key metrics (non-critical):`, error);
      return null;
    }
  }

  /**
   * Fetch complete market snapshot (combines quote, profile, and metrics)
   */
  async getMarketSnapshot(symbol: string): Promise<MarketSnapshot | null> {
    try {
      console.log(`🔍 [FMP] Starting market snapshot fetch for ${symbol}`);

      // Fetch quote data (required) - this will throw if it fails
      const quote = await this.getQuote(symbol);
      
      if (!quote) {
        throw new Error(`Unable to fetch market data for ${symbol}`);
      }

      console.log(`✅ [FMP] Quote fetched successfully`);

      // Try to fetch profile and metrics (optional)
      let profile: FMPProfile | null = null;
      let metrics: FMPKeyMetrics | null = null;
      
      try {
        profile = await this.getCompanyProfile(symbol);
        console.log(`📦 [FMP] Profile result: ${profile ? 'Success' : 'Not available'}`);
      } catch (profileError) {
        console.warn(`⚠️ [FMP] Profile fetch failed (continuing with quote only)`);
      }

      try {
        metrics = await this.getKeyMetrics(symbol);
        console.log(`📦 [FMP] Metrics result: ${metrics ? 'Success' : 'Not available'}`);
      } catch (metricsError) {
        console.warn(`⚠️ [FMP] Metrics fetch failed (continuing without metrics)`);
      }

      // Combine data from all sources
      const snapshot: MarketSnapshot = {
        peRatio: quote.pe ? quote.pe.toString() : 'N/A',
        earningDate: quote.earningsAnnouncement || undefined,
        symbol: symbol,
        name: profile?.companyName || quote.name || symbol,
        currentPrice: quote.price.toString(),
        percentChange: quote.changesPercentage.toString(),
        marketCap: quote.marketCap ? quote.marketCap.toString() : 'N/A',
        highPrice: quote.dayHigh ? quote.dayHigh.toString() : 'N/A',
        lowPrice: quote.dayLow ? quote.dayLow.toString() : 'N/A',
        openPrice: quote.open ? quote.open.toString() : 'N/A',
        previousClose: quote.previousClose ? quote.previousClose.toString() : 'N/A',
        pegRatio: metrics?.pegRatio ? metrics.pegRatio.toString() : 'N/A',
        annualSales: 'N/A',
        dividendYield: profile?.lastDiv && quote.price ? ((profile.lastDiv / quote.price) * 100).toFixed(2) : 'N/A',
        fiftyTwoWeekLow: quote.yearLow ? quote.yearLow.toString() : 'N/A',
        fiftyTwoWeekHigh: quote.yearHigh ? quote.yearHigh.toString() : 'N/A',
        currency: profile?.currency || 'USD',
        lastUpdated: new Date().toISOString()
      };

      console.log(`✅ [FMP] Market snapshot created successfully for ${symbol}`);
      console.log(`📊 [FMP] Snapshot data:`, snapshot);
      return snapshot;
    } catch (error) {
      console.error(`❌ [FMP] Failed to create market snapshot for ${symbol}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const financialModelingPrepService = new FinancialModelingPrepService(FMP_API_KEY);