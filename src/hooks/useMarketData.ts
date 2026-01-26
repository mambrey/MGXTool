import { useState } from 'react';
import { marketDataService, type MarketSnapshot } from '@/services/market-data';

export function useMarketData() {
  const [marketData, setMarketData] = useState<MarketSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async (symbol: string) => {
    if (!symbol || symbol.trim() === '') {
      setError('Please provide a valid ticker symbol');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await marketDataService.getMarketSnapshot(symbol.trim().toUpperCase());
      
      if (data) {
        setMarketData(data);
        setError(null);
      } else {
        setError(`No market data found for symbol: ${symbol}`);
        setMarketData(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data';
      setError(errorMessage);
      setMarketData(null);
      console.error('Error in useMarketData:', err);
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