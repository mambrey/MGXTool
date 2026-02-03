import { useState } from 'react';
import { financialModelingPrepService, type MarketSnapshot } from '@/services/financial-modeling-prep';

export function useFinancialModelingPrep() {
  const [marketData, setMarketData] = useState<MarketSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async (symbol: string) => {
    if (!symbol || symbol.trim() === '') {
      setError('Please provide a valid ticker symbol');
      return;
    }

    setLoading(true);
    console.log(`🔄 useFinancialModelingPrep: Starting fetch for ${symbol}`);

    try {
      const data = await financialModelingPrepService.getMarketSnapshot(symbol.trim().toUpperCase());
      
      if (data) {
        console.log('✅ useFinancialModelingPrep: Data received, updating state');
        setMarketData(data);
        setError(null);
      } else {
        const errorMsg = `No market data found for symbol: ${symbol}`;
        console.warn('⚠️ useFinancialModelingPrep:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data';
      console.error('❌ useFinancialModelingPrep: Error -', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('🏁 useFinancialModelingPrep: Fetch complete');
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