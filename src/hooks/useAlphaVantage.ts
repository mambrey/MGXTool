import { useState } from 'react';
import { alphaVantageService, type MarketSnapshot } from '@/services/alpha-vantage';

export function useAlphaVantage() {
  const [marketData, setMarketData] = useState<MarketSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async (symbol: string) => {
    if (!symbol || symbol.trim() === '') {
      setError('Please provide a valid ticker symbol');
      return;
    }

    setLoading(true);
    // Don't clear error here - let it show alongside loading state

    try {
      const data = await alphaVantageService.getMarketSnapshot(symbol.trim().toUpperCase());
      
      if (data) {
        setMarketData(data);
        setError(null);
      } else {
        setError(`No market data found for symbol: ${symbol}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearMarketData = () => {
    setMarketData(null);
    setError(null);
  };

  return {
    marketData,
    loading,
    error,
    fetchMarketData,
    clearMarketData
  };
}