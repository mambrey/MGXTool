# Strategic Accounts CRM Dashboard

A comprehensive CRM system for managing strategic business relationships, tracking interactions, and driving revenue growth.

## Features

- **Account Management**: Track strategic accounts with detailed information including market data, headquarters location, and business metrics
- **Contact Management**: Maintain relationships with key stakeholders and decision makers
- **Market Data Integration**: Auto-populate financial data from CSV files for publicly traded companies
- **Google Maps Integration**: Address autocomplete and map visualization for headquarters locations
- **Power Automate Integration**: Automated workflows for ticker symbol updates
- **Advanced Filtering**: Filter accounts and contacts by relationship owners
- **Dashboard Analytics**: Real-time KPIs including strategic accounts, key contacts, upcoming birthdays, and overdue connects

## Setup

### Prerequisites

- Node.js 16+ and pnpm
- Google Maps API Key (optional, for address autocomplete)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Add your Google Maps API Key to `.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

   To get a Google Maps API Key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Places API" and "Maps JavaScript API"
   - Create credentials (API Key)
   - Restrict the API key to your domain for security

### Running the Application

Development mode:
```bash
pnpm run dev
```

Build for production:
```bash
pnpm run build
```

Preview production build:
```bash
pnpm run preview
```

## Google Maps Address Autocomplete

The HQ Address field in the Account Form includes Google Places Autocomplete functionality:

- **With API Key**: Start typing an address and select from Google's suggestions
- **Without API Key**: The field works as a regular text input
- **Fallback**: If Google Maps fails to load, the address field remains fully functional for manual entry

The "View on Map" button opens the address in Google Maps regardless of whether the autocomplete is enabled.

## Market Data Integration

The system supports automatic market data loading from CSV files:

1. Place your market data CSV file in the `public` directory
2. The CSV should include columns for ticker symbols and financial metrics
3. When you enter a ticker symbol, click the refresh button to load data
4. Data auto-populates fields like current price, market cap, 52-week high/low, etc.

## Power Automate Integration

Configure Power Automate workflows to receive notifications when:
- New ticker symbols are added to accounts
- Account information is updated

See `src/services/power-automate.ts` for configuration details.

## Data Storage

All data is stored in the browser's localStorage. To export or backup your data:
1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Copy the values for backup

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Google Maps JavaScript API
- @react-google-maps/api

## License

MIT