import type { Account } from './crm';

// Extended Account interface with additional market and strategy fields
export interface ExtendedAccount extends Account {
  // Market Snapshot fields
  currentPrice?: string;
  percentChange?: string;
  highPrice?: string;
  lowPrice?: string;
  openPrice?: string;
  previousClose?: string;
  marketCap?: string;
  pegRatio?: string;
  annualSales?: string;
  dividendYield?: string;
  fiftyTwoWeekLow?: string;
  fiftyTwoWeekHigh?: string;
  percentOfGeneralMarket?: string;
  sales52Weeks?: string;
  sales12Weeks?: string;
  
  // Strategy and Capabilities
  pricingStrategy?: boolean;
  privateLabel?: boolean;
  innovationAppetite?: number;
  hasEcommerce?: boolean;
  strategicPriorities?: string;
  keyCompetitors?: string;
}