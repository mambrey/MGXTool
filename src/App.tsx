import { useEffect } from 'react';
import CRMTool from './components/CRMTool';
import { initializeMarketDataWebhook } from './services/market-data-webhook';
import './App.css';

function App() {
  // Initialize the market data webhook listener when the app starts
  useEffect(() => {
    initializeMarketDataWebhook();
  }, []);

  return (
    <div className="App">
      <CRMTool />
    </div>
  );
}

export default App;