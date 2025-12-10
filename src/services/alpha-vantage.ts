/**
 * Alpha Vantage API Service
 * Fetches real-time stock market data using Alpha Vantage API
 */

const ALPHA_VANTAGE_API_KEY = 'M3AGSUE85C1UQ5AE';
const BASE_URL = 'https://www.alphavantage.co/query';

export interface AlphaVantageQuote {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  volume: string;
  latestTradingDay: string;
  previousClose: string;
  open: string;
  high: string;
  low: string;
}

export interface AlphaVantageOverview {
  symbol: string;
  name: string;
  description: string;
  exchange: string;
  currency: string;
  country: string;
  sector: string;
  industry: string;
  marketCapitalization: string;
  peRatio: string;
  pegRatio: string;
  bookValue: string;
  dividendPerShare: string;
  dividendYield: string;
  eps: string;
  revenuePerShareTTM: string;
  profitMargin: string;
  operatingMarginTTM: string;
  returnOnAssetsTTM: string;
  returnOnEquityTTM: string;
  revenueTTM: string;
  grossProfitTTM: string;
  dilutedEPSTTM: string;
  quarterlyEarningsGrowthYOY: string;
  quarterlyRevenueGrowthYOY: string;
  analystTargetPrice: string;
  trailingPE: string;
  forwardPE: string;
  priceToSalesRatioTTM: string;
  priceToBookRatio: string;
  evToRevenue: string;
  evToEBITDA: string;
  beta: string;
  week52High: string;
  week52Low: string;
  day50MovingAverage: string;
  day200MovingAverage: string;
  sharesOutstanding: string;
  dividendDate: string;
  exDividendDate: string;
}

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
  pegRatio: string;
  annualSales: string;
  dividendYield: string;
  fiftyTwoWeekLow: string;
  fiftyTwoWeekHigh: string;
  currency: string;
  lastUpdated: string;
}

class AlphaVantageService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetch global quote (real-time price data)
   */
  async getGlobalQuote(symbol: string): Promise<AlphaVantageQuote | null> {
    try {
      const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
        const quote = data['Global Quote'];
        return {
          symbol: quote['01. symbol'],
          name: symbol, // Will be enriched from overview
          price: quote['05. price'],
          change: quote['09. change'],
          changePercent: quote['10. change percent'].replace('%', ''),
          volume: quote['06. volume'],
          latestTradingDay: quote['07. latest trading day'],
          previousClose: quote['08. previous close'],
          open: quote['02. open'],
          high: quote['03. high'],
          low: quote['04. low']
        };
      }

      console.warn('No quote data found for symbol:', symbol);
      return null;
    } catch (error) {
      console.error('Error fetching global quote:', error);
      return null;
    }
  }

  /**
   * Fetch company overview (fundamental data)
   */
  async getCompanyOverview(symbol: string): Promise<AlphaVantageOverview | null> {
    try {
      const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.Symbol) {
        return {
          symbol: data.Symbol,
          name: data.Name,
          description: data.Description,
          exchange: data.Exchange,
          currency: data.Currency,
          country: data.Country,
          sector: data.Sector,
          industry: data.Industry,
          marketCapitalization: data.MarketCapitalization,
          peRatio: data.PERatio,
          pegRatio: data.PEGRatio,
          bookValue: data.BookValue,
          dividendPerShare: data.DividendPerShare,
          dividendYield: data.DividendYield,
          eps: data.EPS,
          revenuePerShareTTM: data.RevenuePerShareTTM,
          profitMargin: data.ProfitMargin,
          operatingMarginTTM: data.OperatingMarginTTM,
          returnOnAssetsTTM: data.ReturnOnAssetsTTM,
          returnOnEquityTTM: data.ReturnOnEquityTTM,
          revenueTTM: data.RevenueTTM,
          grossProfitTTM: data.GrossProfitTTM,
          dilutedEPSTTM: data.DilutedEPSTTM,
          quarterlyEarningsGrowthYOY: data.QuarterlyEarningsGrowthYOY,
          quarterlyRevenueGrowthYOY: data.QuarterlyRevenueGrowthYOY,
          analystTargetPrice: data.AnalystTargetPrice,
          trailingPE: data.TrailingPE,
          forwardPE: data.ForwardPE,
          priceToSalesRatioTTM: data.PriceToSalesRatioTTM,
          priceToBookRatio: data.PriceToBookRatio,
          evToRevenue: data.EVToRevenue,
          evToEBITDA: data.EVToEBITDA,
          beta: data.Beta,
          week52High: data['52WeekHigh'],
          week52Low: data['52WeekLow'],
          day50MovingAverage: data['50DayMovingAverage'],
          day200MovingAverage: data['200DayMovingAverage'],
          sharesOutstanding: data.SharesOutstanding,
          dividendDate: data.DividendDate,
          exDividendDate: data.ExDividendDate
        };
      }

      console.warn('No overview data found for symbol:', symbol);
      return null;
    } catch (error) {
      console.error('Error fetching company overview:', error);
      return null;
    }
  }

  /**
   * Fetch complete market snapshot (combines quote and overview data)
   */
  async getMarketSnapshot(symbol: string): Promise<MarketSnapshot | null> {
    try {
      console.log(`🔍 Fetching market data for ${symbol} from Alpha Vantage...`);

      // Fetch both quote and overview data in parallel
      const [quote, overview] = await Promise.all([
        this.getGlobalQuote(symbol),
        this.getCompanyOverview(symbol)
      ]);

      if (!quote && !overview) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      // Combine data from both sources
      const snapshot: MarketSnapshot = {
        symbol: symbol,
        name: overview?.name || symbol,
        currentPrice: quote?.price || '0',
        percentChange: quote?.changePercent || '0',
        marketCap: overview?.marketCapitalization || '0',
        highPrice: quote?.high || '0',
        lowPrice: quote?.low || '0',
        openPrice: quote?.open || '0',
        previousClose: quote?.previousClose || '0',
        pegRatio: overview?.pegRatio || '0',
        annualSales: overview?.revenueTTM || '0',
        dividendYield: overview?.dividendYield || '0',
        fiftyTwoWeekLow: overview?.week52Low || '0',
        fiftyTwoWeekHigh: overview?.week52High || '0',
        currency: overview?.currency || 'USD',
        lastUpdated: new Date().toISOString()
      };

      console.log('✅ Market snapshot fetched successfully:', snapshot);
      return snapshot;
    } catch (error) {
      console.error('❌ Error fetching market snapshot:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const alphaVantageService = new AlphaVantageService(ALPHA_VANTAGE_API_KEY);
