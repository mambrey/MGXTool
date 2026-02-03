/**
 * Market Data Webhook Handler
 * Handles incoming market data from Power Automate
 */

import { powerAutomateService, type MarketDataResponse } from './power-automate';

/**
 * Initialize the webhook listener
 * This sets up a message listener for receiving market data from Power Automate
 */
export function initializeMarketDataWebhook(): void {
  // Listen for messages from Power Automate (via iframe or postMessage)
  window.addEventListener('message', (event) => {
    // Validate the message origin (adjust this based on your Power Automate setup)
    // For now, we'll accept messages from any origin, but in production you should validate
    
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      
      // Check if this is a market data message
      if (data && data.type === 'market-data-update') {
        const marketData: MarketDataResponse = data.payload;
        
        // Validate the data structure
        if (marketData.accountId && marketData.tickerSymbol) {
          console.log('Received market data from Power Automate:', marketData);
          powerAutomateService.processMarketData(marketData);
        } else {
          console.warn('Invalid market data structure:', data);
        }
      }
    } catch (error) {
      console.error('Error processing webhook message:', error);
    }
  });

  console.log('Market data webhook listener initialized');
}

/**
 * Manual webhook endpoint for testing
 * This can be called directly to simulate receiving market data
 */
export function receiveMarketData(data: MarketDataResponse): void {
  powerAutomateService.processMarketData(data);
}

/**
 * Create a webhook URL that Power Automate can call
 * This generates a unique endpoint for this session
 */
export function getWebhookUrl(): string {
  const baseUrl = window.location.origin;
  const sessionId = Date.now().toString(36);
  return `${baseUrl}/api/webhook/market-data/${sessionId}`;
}