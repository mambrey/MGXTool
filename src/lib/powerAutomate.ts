/**
 * Power Automate Integration Service
 * Handles sending data to Microsoft Power Automate workflows
 */

export interface TickerSymbolData {
  accountId: string;
  accountName: string;
  tickerSymbol: string;
  publiclyTraded: boolean;
  parentCompany?: string;
  industry?: string;
  accountOwner?: string;
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
  timestamp: string;
  action: 'added' | 'updated';
}

class PowerAutomateService {
  private tickerSymbolWorkflowUrl: string | null = null;

  constructor() {
    // Initialize with environment variable if available
    this.tickerSymbolWorkflowUrl = import.meta.env.VITE_POWER_AUTOMATE_TICKER_WORKFLOW_URL || null;
  }

  /**
   * Check if ticker symbol workflow is enabled
   */
  isTickerSymbolWorkflowEnabled(): boolean {
    return this.tickerSymbolWorkflowUrl !== null && this.tickerSymbolWorkflowUrl.trim() !== '';
  }

  /**
   * Send ticker symbol data to Power Automate workflow
   */
  async sendTickerSymbol(data: TickerSymbolData): Promise<boolean> {
    if (!this.isTickerSymbolWorkflowEnabled()) {
      console.warn('Power Automate ticker symbol workflow URL not configured');
      return false;
    }

    try {
      const response = await fetch(this.tickerSymbolWorkflowUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Power Automate workflow request failed:', response.status, response.statusText);
        return false;
      }

      console.log('Successfully sent ticker symbol data to Power Automate');
      return true;
    } catch (error) {
      console.error('Error sending data to Power Automate:', error);
      return false;
    }
  }

  /**
   * Set the ticker symbol workflow URL (for testing or dynamic configuration)
   */
  setTickerSymbolWorkflowUrl(url: string): void {
    this.tickerSymbolWorkflowUrl = url;
  }
}

// Export singleton instance
export const powerAutomateService = new PowerAutomateService();