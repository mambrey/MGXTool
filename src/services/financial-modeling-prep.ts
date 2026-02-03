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
  changePercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume?: number;
  open: number;
  previousClose: number;
  eps?: number;
  pe?: number;
  earningsAnnouncement?: string;
  sharesOutstanding: number;
  timestamp: number;
}

export interface FMPProfile {
  symbol: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv?: number;
  lastDividend?: number;
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
  revenuePerShare?: number;
  netIncomePerShare?: number;
  operatingCashFlowPerShare?: number;
  freeCashFlowPerShare?: number;
  cashPerShare?: number;
  bookValuePerShare?: number;
  tangibleBookValuePerShare?: number;
  shareholdersEquityPerShare?: number;
  interestDebtPerShare?: number;
  marketCap?: number;
  enterpriseValue?: number;
  peRatio?: number;
  priceToSalesRatio?: number;
  pocfratio?: number;
  pfcfRatio?: number;
  pbRatio?: number;
  ptbRatio?: number;
  evToSales?: number;
  enterpriseValueOverEBITDA?: number;
  evToOperatingCashFlow?: number;
  evToFreeCashFlow?: number;
  earningsYield?: number;
  freeCashFlowYield?: number;
  debtToEquity?: number;
  debtToAssets?: number;
  netDebtToEBITDA?: number;
  currentRatio?: number;
  interestCoverage?: number;
  incomeQuality?: number;
  dividendYield?: number;
  payoutRatio?: number;
  salesGeneralAndAdministrativeToRevenue?: number;
  researchAndDdevelopementToRevenue?: number;
  intangiblesToTotalAssets?: number;
  capexToOperatingCashFlow?: number;
  capexToRevenue?: number;
  capexToDepreciation?: number;
  stockBasedCompensationToRevenue?: number;
  grahamNumber?: number;
  roic?: number;
  returnOnTangibleAssets?: number;
  grahamNetNet?: number;
  workingCapital?: number;
  tangibleAssetValue?: number;
  netCurrentAssetValue?: number;
  investedCapital?: number;
  averageReceivables?: number;
  averagePayables?: number;
  averageInventory?: number;
  daysSalesOutstanding?: number;
  daysPayablesOutstanding?: number;
  daysOfInventoryOnHand?: number;
  receivablesTurnover?: number;
  payablesTurnover?: number;
  inventoryTurnover?: number;
  roe?: number;
  capexPerShare?: number;
  pegRatio?: number;
}

export interface FMPRatios {
  symbol: string;
  date: string;
  fiscalYear: string;
  period: string;
  priceToEarningsRatio?: number;
  priceToBookRatio?: number;
  priceToSalesRatio?: number;
  dividendYield?: number;
  dividendYieldPercentage?: number;
  priceToEarningsGrowthRatio?: number;
  [key: string]: string | number | undefined;
}

export interface FMPEarningsCalendar {
  symbol: string;
  date: string;
  epsActual?: number;
  epsEstimated?: number;
  revenueActual?: number;
  revenueEstimated?: number;
  lastUpdated?: string;
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
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`❌ [FMP] HTTP Error: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📊 [FMP] Raw quote response:`, data);

      if (data.error || data['Error Message']) {
        const errorMsg = data.error || data['Error Message'];
        console.error(`❌ [FMP] API Error: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      if (Array.isArray(data)) {
        if (data.length === 0) {
          console.warn(`⚠️ [FMP] Empty array returned for ${symbol}`);
          throw new Error(`No data found for ticker symbol: ${symbol}`);
        }
        
        const quote = data[0];
        console.log(`✅ [FMP] Quote received - price: ${quote.price}, change: ${quote.changePercentage}%`);
        return quote;
      }

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
        return null;
      }
      
      const data = await response.json();

      if (data.error || data['Error Message']) {
        console.warn(`⚠️ [FMP] Profile API Error: ${data.error || data['Error Message']}`);
        return null;
      }

      if (Array.isArray(data) && data.length > 0) {
        console.log(`✅ [FMP] Profile received for ${data[0].symbol}`);
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
   * Fetch financial ratios including PE ratio
   */
  async getRatios(symbol: string): Promise<FMPRatios | null> {
    try {
      const url = `${BASE_URL}/ratios?symbol=${symbol}&apikey=${this.apiKey}&limit=1`;
      console.log(`📡 [FMP] Fetching ratios for ${symbol}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`❌ [FMP] HTTP Error: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        console.log(`✅ [FMP] Ratios received - PE: ${data[0].priceToEarningsRatio}`);
        return data[0];
      }

      console.warn(`⚠️ [FMP] No ratios data for ${symbol}`);
      return null;
    } catch (error) {
      console.warn(`⚠️ [FMP] Error fetching ratios (non-critical):`, error);
      return null;
    }
  }

  /**
   * Fetch earnings calendar to get next earnings date
   */
  async getEarningsCalendar(symbol: string): Promise<FMPEarningsCalendar | null> {
    try {
      const url = `${BASE_URL}/earnings-calendar?symbol=${symbol}&apikey=${this.apiKey}`;
      console.log(`📡 [FMP] Fetching earnings calendar for ${symbol}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`❌ [FMP] HTTP Error: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        // Find the most recent or upcoming earnings date
        const sortedEarnings = data
          .filter((e: FMPEarningsCalendar) => e.symbol === symbol)
          .sort((a: FMPEarningsCalendar, b: FMPEarningsCalendar) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        
        if (sortedEarnings.length > 0) {
          const latestEarnings = sortedEarnings[0];
          console.log(`✅ [FMP] Earnings date found: ${latestEarnings.date}`);
          return latestEarnings;
        }
      }

      console.warn(`⚠️ [FMP] No earnings calendar data for ${symbol}`);
      return null;
    } catch (error) {
      console.warn(`⚠️ [FMP] Error fetching earnings calendar (non-critical):`, error);
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
   * Fetch complete market snapshot (combines quote, profile, ratios, earnings, and metrics)
   */
  async getMarketSnapshot(symbol: string): Promise<MarketSnapshot | null> {
    try {
      console.log(`🔍 [FMP] Starting market snapshot fetch for ${symbol}`);

      // Fetch quote data (required)
      const quote = await this.getQuote(symbol);
      
      if (!quote) {
        throw new Error(`Unable to fetch market data for ${symbol}`);
      }

      console.log(`✅ [FMP] Quote fetched successfully`);

      // Fetch additional data in parallel (all optional)
      const [profile, ratios, earnings, metrics] = await Promise.all([
        this.getCompanyProfile(symbol),
        this.getRatios(symbol),
        this.getEarningsCalendar(symbol),
        this.getKeyMetrics(symbol)
      ]);

      console.log(`📦 [FMP] Additional data fetched:`, {
        profile: !!profile,
        ratios: !!ratios,
        earnings: !!earnings,
        metrics: !!metrics
      });

      // Helper function to safely convert to string
      const safeToString = (value: number | undefined | null): string => {
        if (value === undefined || value === null || isNaN(value)) {
          return 'N/A';
        }
        return value.toString();
      };

      // Get PE ratio from ratios endpoint (most reliable source)
      const peRatio = ratios?.priceToEarningsRatio 
        ? safeToString(ratios.priceToEarningsRatio)
        : (quote.pe ? safeToString(quote.pe) : 'N/A');

      // Get earnings date from earnings calendar
      const earningDate = earnings?.date || quote.earningsAnnouncement || undefined;

      // Get dividend yield - check both profile fields
      let dividendYield = 'N/A';
      if (ratios?.dividendYieldPercentage) {
        dividendYield = ratios.dividendYieldPercentage.toFixed(2);
      } else if (profile && quote.price) {
        const lastDiv = profile.lastDividend || profile.lastDiv;
        if (lastDiv) {
          dividendYield = ((lastDiv / quote.price) * 100).toFixed(2);
        }
      }

      // Combine data from all sources
      const snapshot: MarketSnapshot = {
        peRatio: peRatio,
        earningDate: earningDate,
        symbol: symbol,
        name: profile?.companyName || quote.name || symbol,
        currentPrice: safeToString(quote.price),
        percentChange: safeToString(quote.changePercentage),
        marketCap: safeToString(quote.marketCap),
        highPrice: safeToString(quote.dayHigh),
        lowPrice: safeToString(quote.dayLow),
        openPrice: safeToString(quote.open),
        previousClose: safeToString(quote.previousClose),
        pegRatio: metrics?.pegRatio ? safeToString(metrics.pegRatio) : 'N/A',
        annualSales: 'N/A',
        dividendYield: dividendYield,
        fiftyTwoWeekLow: safeToString(quote.yearLow),
        fiftyTwoWeekHigh: safeToString(quote.yearHigh),
        currency: profile?.currency || 'USD',
        lastUpdated: new Date().toISOString()
      };

      console.log(`✅ [FMP] Market snapshot created successfully`);
      console.log(`📊 [FMP] PE Ratio: ${peRatio}, Earnings Date: ${earningDate || 'N/A'}`);
      return snapshot;
    } catch (error) {
      console.error(`❌ [FMP] Failed to create market snapshot for ${symbol}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const financialModelingPrepService = new FinancialModelingPrepService(FMP_API_KEY);