/**
 * Financial Modeling Prep API Service
 * Fetches real-time stock market data using Financial Modeling Prep API
 */

const FMP_API_KEY = 'SWwNNWvzhEb3ze28GzPFaDjZxvihd3qf';
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

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
      const url = `${BASE_URL}/quote/${symbol}?apikey=${this.apiKey}`;
      console.log(`📡 Fetching quote from FMP: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`📊 Raw FMP API response for quote:`, JSON.stringify(data, null, 2));

      // Check for API error messages
      if (data['Error Message'] || (Array.isArray(data) && data.length === 0)) {
        console.error('❌ FMP API Error: Invalid symbol or no data');
        throw new Error(`Invalid ticker symbol: ${symbol}`);
      }

      if (Array.isArray(data) && data.length > 0) {
        const quote = data[0];
        console.log('✅ Quote data parsed successfully');
        return quote;
      }

      console.warn('⚠️ No quote data found for symbol:', symbol);
      return null;
    } catch (error) {
      console.error('❌ Error fetching quote:', error);
      throw error;
    }
  }

  /**
   * Fetch company profile data
   */
  async getCompanyProfile(symbol: string): Promise<FMPProfile | null> {
    try {
      const url = `${BASE_URL}/profile/${symbol}?apikey=${this.apiKey}`;
      console.log(`📡 Fetching profile from FMP: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`📊 Raw FMP API response for profile:`, JSON.stringify(data, null, 2));

      // Check for API error messages
      if (data['Error Message'] || (Array.isArray(data) && data.length === 0)) {
        console.error('❌ FMP API Error: Invalid symbol or no data');
        throw new Error(`Invalid ticker symbol: ${symbol}`);
      }

      if (Array.isArray(data) && data.length > 0) {
        const profile = data[0];
        console.log('✅ Profile data parsed successfully');
        return profile;
      }

      console.warn('⚠️ No profile data found for symbol:', symbol);
      return null;
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Fetch key metrics including PEG ratio
   */
  async getKeyMetrics(symbol: string): Promise<FMPKeyMetrics | null> {
    try {
      const url = `${BASE_URL}/key-metrics/${symbol}?apikey=${this.apiKey}&limit=1`;
      console.log(`📡 Fetching key metrics from FMP: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`📊 Raw FMP API response for key metrics:`, JSON.stringify(data, null, 2));

      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Key metrics data parsed successfully');
        return data[0];
      }

      console.warn('⚠️ No key metrics data found for symbol:', symbol);
      return null;
    } catch (error) {
      console.error('❌ Error fetching key metrics:', error);
      return null; // Don't throw, this is optional data
    }
  }

  /**
   * Fetch complete market snapshot (combines quote, profile, and metrics)
   */
  async getMarketSnapshot(symbol: string): Promise<MarketSnapshot | null> {
    try {
      console.log(`🔍 Fetching market data for ${symbol} from Financial Modeling Prep...`);

      // Fetch quote data (required)
      const quote = await this.getQuote(symbol);
      
      if (!quote) {
        throw new Error(`No quote data available for symbol: ${symbol}. Please verify the ticker symbol is correct.`);
      }

      // Try to fetch profile and metrics, but don't fail if they error
      let profile = null;
      let metrics = null;
      
      try {
        profile = await this.getCompanyProfile(symbol);
      } catch (profileError) {
        console.warn('⚠️ Could not fetch profile data, using quote data only');
      }

      try {
        metrics = await this.getKeyMetrics(symbol);
      } catch (metricsError) {
        console.warn('⚠️ Could not fetch key metrics data');
      }

      console.log('📦 Quote result:', quote ? 'Success' : 'Failed');
      console.log('📦 Profile result:', profile ? 'Success' : 'Failed');
      console.log('📦 Metrics result:', metrics ? 'Success' : 'Failed');

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
        annualSales: 'N/A', // FMP doesn't provide this in quote/profile
        dividendYield: profile?.lastDiv && quote.price ? ((profile.lastDiv / quote.price) * 100).toFixed(2) : 'N/A',
        fiftyTwoWeekLow: quote.yearLow ? quote.yearLow.toString() : 'N/A',
        fiftyTwoWeekHigh: quote.yearHigh ? quote.yearHigh.toString() : 'N/A',
        currency: profile?.currency || 'USD',
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
export const financialModelingPrepService = new FinancialModelingPrepService(FMP_API_KEY);