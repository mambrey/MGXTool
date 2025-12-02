/**
 * Power Automate Integration Service
 * Handles communication between the CRM and Power Automate workflows
 */

// Configuration for Power Automate workflows
const config = {
  birthdayWorkflowUrl: import.meta.env.VITE_PA_BIRTHDAY_WORKFLOW_URL || '',
  nextContactWorkflowUrl: import.meta.env.VITE_PA_NEXT_CONTACT_WORKFLOW_URL || '',
  taskWorkflowUrl: import.meta.env.VITE_PA_TASK_WORKFLOW_URL || '',
  jbpWorkflowUrl: import.meta.env.VITE_PA_JBP_WORKFLOW_URL || '',
  accountEventWorkflowUrl: import.meta.env.VITE_PA_ACCOUNT_EVENT_WORKFLOW_URL || '',
  contactEventWorkflowUrl: import.meta.env.VITE_PA_CONTACT_EVENT_WORKFLOW_URL || '',
  tickerSymbolWorkflowUrl: import.meta.env.VITE_PA_TICKER_SYMBOL_WORKFLOW_URL || '',
  marketDataWorkflowUrl: import.meta.env.VITE_PA_MARKET_DATA_WORKFLOW_URL || '', // New: For retrieving market data from Google Sheets
};

/**
 * Alert data structure sent to Power Automate
 */
export interface PowerAutomateAlert {
  alertType: 'birthday' | 'next-contact' | 'task-due' | 'jbp' | 'accountEvent' | 'contactEvent';
  contactName: string;
  contactEmail?: string;
  accountName?: string;
  dueDate: string;
  daysUntil: number;
  priority: string;
  relationshipOwner?: string;
  relationshipOwnerEmail?: string;
  relationshipOwnerTeamsChannel?: string;
  vicePresident?: string;
  description?: string;
  additionalData?: {
    alertId?: string;
    contactId?: string;
    accountId?: string;
    contactPhone?: string;
    contactTitle?: string;
    autoSent?: boolean;
  };
  timestamp?: string;
  // Legacy fields for backwards compatibility
  notes?: string;
  email?: string;
  phone?: string;
}

/**
 * Ticker symbol data structure sent to Power Automate
 */
export interface TickerSymbolData {
  accountId: string;
  accountName: string;
  tickerSymbol: string;
  publiclyTraded: boolean;
  parentCompany?: string;
  industry?: string;
  accountOwner?: string;
  // Market data (may be empty when first sent)
  currentPrice?: string;
  percentChange?: string;
  marketCap?: string;
  highPrice?: string;
  lowPrice?: string;
  openPrice?: string;
  previousClose?: string;
  pegRatio?: string;
  annualSales?: string;
  dividendYield?: string;
  fiftyTwoWeekLow?: string;
  fiftyTwoWeekHigh?: string;
  // Metadata
  timestamp: string;
  action: 'added' | 'updated';
}

/**
 * Market data structure received from Power Automate (from Google Sheets)
 */
export interface MarketDataResponse {
  accountId: string;
  tickerSymbol: string;
  // Market snapshot data
  currentPrice?: string;
  percentChange?: string;
  marketCap?: string;
  highPrice?: string;
  lowPrice?: string;
  openPrice?: string;
  previousClose?: string;
  // Financial API data
  pegRatio?: string;
  annualSales?: string;
  dividendYield?: string;
  fiftyTwoWeekLow?: string;
  fiftyTwoWeekHigh?: string;
  // Databricks analytics
  percentOfGeneralMarket?: string;
  sales52Weeks?: string;
  // Metadata
  timestamp: string;
  source: 'google-sheets' | 'manual';
}

/**
 * Callback function type for handling market data updates
 */
export type MarketDataCallback = (data: MarketDataResponse) => void;

class PowerAutomateService {
  private marketDataCallbacks: MarketDataCallback[] = [];

  /**
   * Check if Power Automate integration is enabled
   */
  isEnabled(): boolean {
    return !!(
      config.birthdayWorkflowUrl ||
      config.nextContactWorkflowUrl ||
      config.taskWorkflowUrl ||
      config.jbpWorkflowUrl ||
      config.accountEventWorkflowUrl ||
      config.contactEventWorkflowUrl
    );
  }

  /**
   * Check if ticker symbol workflow is enabled
   */
  isTickerSymbolWorkflowEnabled(): boolean {
    return !!config.tickerSymbolWorkflowUrl;
  }

  /**
   * Check if market data workflow is enabled
   */
  isMarketDataWorkflowEnabled(): boolean {
    return !!config.marketDataWorkflowUrl;
  }

  /**
   * Send an alert to Power Automate
   */
  async sendAlert(alert: PowerAutomateAlert): Promise<boolean> {
    let workflowUrl = '';

    // Determine which workflow to use based on alert type
    switch (alert.alertType) {
      case 'birthday':
        workflowUrl = config.birthdayWorkflowUrl;
        break;
      case 'next-contact':
        workflowUrl = config.nextContactWorkflowUrl;
        break;
      case 'task-due':
        workflowUrl = config.taskWorkflowUrl;
        break;
      case 'jbp':
        workflowUrl = config.jbpWorkflowUrl;
        break;
      case 'accountEvent':
        workflowUrl = config.accountEventWorkflowUrl;
        break;
      case 'contactEvent':
        workflowUrl = config.contactEventWorkflowUrl;
        break;
      default:
        console.error('Unknown alert type:', alert.alertType);
        return false;
    }

    if (!workflowUrl) {
      console.warn(`No workflow URL configured for ${alert.alertType} alerts`);
      return false;
    }

    try {
      // Add timestamp if not present
      const payload = {
        ...alert,
        timestamp: alert.timestamp || new Date().toISOString()
      };

      console.log(`Sending ${alert.alertType} alert to Power Automate:`, payload);

      const response = await fetch(workflowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`Alert sent successfully to Power Automate: ${alert.alertType}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error('Failed to send alert to Power Automate:', response.status, response.statusText, errorText);
        return false;
      }
    } catch (error) {
      console.error('Error sending alert to Power Automate:', error);
      return false;
    }
  }

  /**
   * Send ticker symbol data to Power Automate
   * This triggers the workflow to look up market data in Google Sheets
   */
  async sendTickerSymbol(data: TickerSymbolData): Promise<boolean> {
    if (!config.tickerSymbolWorkflowUrl) {
      console.warn('No ticker symbol workflow URL configured');
      return false;
    }

    try {
      const response = await fetch(config.tickerSymbolWorkflowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Ticker symbol sent successfully to Power Automate:', data.tickerSymbol);
        return true;
      } else {
        console.error('Failed to send ticker symbol to Power Automate:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error sending ticker symbol to Power Automate:', error);
      return false;
    }
  }

  /**
   * Request market data for a specific ticker symbol from Google Sheets
   * This sends a request to Power Automate which will look up the data and return it
   */
  async requestMarketData(accountId: string, tickerSymbol: string): Promise<MarketDataResponse | null> {
    if (!config.marketDataWorkflowUrl) {
      console.warn('No market data workflow URL configured');
      return null;
    }

    try {
      const requestData = {
        accountId,
        tickerSymbol,
        action: 'request-market-data',
        timestamp: new Date().toISOString(),
      };

      console.log('Requesting market data from Power Automate:', requestData);

      const response = await fetch(config.marketDataWorkflowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Market data received from Power Automate:', data);
        
        // Transform the response to match our MarketDataResponse interface
        const marketData: MarketDataResponse = {
          accountId,
          tickerSymbol,
          currentPrice: data.current_price || data.currentPrice,
          percentChange: data.percent_change || data.percentChange,
          marketCap: data.market_cap || data.marketCap,
          highPrice: data.high_price || data.highPrice,
          lowPrice: data.low_price || data.lowPrice,
          openPrice: data.open_price || data.openPrice,
          previousClose: data.previous_close || data.previousClose,
          pegRatio: data.peg_ratio || data.pegRatio,
          annualSales: data.annual_sales || data.annualSales,
          dividendYield: data.dividend_yield || data.dividendYield,
          fiftyTwoWeekLow: data.fifty_two_week_low || data.fiftyTwoWeekLow,
          fiftyTwoWeekHigh: data.fifty_two_week_high || data.fiftyTwoWeekHigh,
          percentOfGeneralMarket: data.percent_of_general_market || data.percentOfGeneralMarket,
          sales52Weeks: data.sales_52_weeks || data.sales52Weeks,
          timestamp: new Date().toISOString(),
          source: 'google-sheets'
        };

        // Notify all registered callbacks
        this.processMarketData(marketData);
        
        return marketData;
      } else {
        const errorText = await response.text();
        console.error('Failed to request market data:', response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error('Error requesting market data:', error);
      return null;
    }
  }

  /**
   * Register a callback to handle incoming market data
   * This allows components to react when market data is received from Power Automate
   */
  onMarketDataReceived(callback: MarketDataCallback): () => void {
    this.marketDataCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.marketDataCallbacks.indexOf(callback);
      if (index > -1) {
        this.marketDataCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Process incoming market data from Power Automate webhook
   * This should be called when the webhook receives data
   */
  processMarketData(data: MarketDataResponse): void {
    console.log('Processing market data from Power Automate:', data);
    
    // Notify all registered callbacks
    this.marketDataCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in market data callback:', error);
      }
    });
  }

  /**
   * Simulate receiving market data (for testing purposes)
   * In production, this would be triggered by the actual webhook
   */
  simulateMarketDataReceived(data: MarketDataResponse): void {
    this.processMarketData(data);
  }
}

// Export singleton instance
export const powerAutomateService = new PowerAutomateService();

// Make the service available globally for webhook handling
if (typeof window !== 'undefined') {
  (window as Window & { powerAutomateService?: PowerAutomateService }).powerAutomateService = powerAutomateService;
}