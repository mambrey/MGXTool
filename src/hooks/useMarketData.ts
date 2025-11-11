import { useState, useCallback } from 'react';
import { fetchMarketDataFromCSV, type MarketData } from '@/services/csv-market-data';

export function useMarketData() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async (tickerSymbol: string) => {
    if (!tickerSymbol || tickerSymbol.trim() === '') {
      setError('Please enter a ticker symbol');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchMarketDataFromCSV(tickerSymbol);
      
      if (data) {
        setMarketData(data);
        setError(null);
      } else {
        setMarketData(null);
        setError(`No market data found for ticker symbol: ${tickerSymbol}`);
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setMarketData(null);
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMarketData = useCallback(() => {
    setMarketData(null);
    setError(null);
  }, []);

  return {
    marketData,
    loading,
    error,
    fetchMarketData,
    clearMarketData
  };
}