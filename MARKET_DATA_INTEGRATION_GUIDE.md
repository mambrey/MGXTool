# Market Data Integration Guide

This guide explains how to set up the two-way integration between your CRM and Power Automate for automatic market data population from Google Sheets.

## Overview

The system works in two steps:

1. **CRM → Power Automate**: When you click the refresh button next to a ticker symbol, the CRM sends a request to Power Automate
2. **Power Automate → CRM**: Power Automate looks up the ticker in Google Sheets and sends the market data back to the CRM

## Prerequisites

- Google Sheet with market data (see structure below)
- Power Automate account with access to Google Sheets connector
- Your existing ticker symbol workflow URL configured in `.env.local`

## Google Sheets Structure

Your Google Sheet should have the following columns:

| Column Name | Description | Example |
|------------|-------------|---------|
| ticker_symbol | Stock ticker symbol | AAPL |
| current_price | Current stock price | $150.25 |
| percent_change | Percentage change | +2.5% |
| market_cap | Market capitalization | $2.5T |
| high_price | Day high price | $152.00 |
| low_price | Day low price | $148.50 |
| open_price | Opening price | $149.00 |
| previous_close | Previous closing price | $147.50 |
| peg_ratio | PEG ratio | 2.15 |
| annual_sales | Annual sales | $394.3B |
| dividend_yield | Dividend yield | 0.52% |
| fifty_two_week_low | 52-week low | $124.17 |
| fifty_two_week_high | 52-week high | $199.62 |
| percent_of_general_market | Market share percentage | 2.8% |
| sales_52_weeks | 52-week sales | $394.3B |

## Power Automate Workflow Setup

### Step 1: Create the Workflow

1. Go to Power Automate (https://make.powerautomate.com)
2. Click **Create** → **Automated cloud flow**
3. Name it "CRM Market Data Lookup"
4. Choose **When an HTTP request is received** as the trigger

### Step 2: Configure the HTTP Trigger

1. In the HTTP trigger, use this JSON schema:

```json
{
    "type": "object",
    "properties": {
        "accountId": {
            "type": "string"
        },
        "tickerSymbol": {
            "type": "string"
        },
        "action": {
            "type": "string"
        },
        "timestamp": {
            "type": "string"
        }
    }
}
```

2. Save the workflow to generate the HTTP POST URL
3. Copy this URL and add it to your `.env.local` as `VITE_PA_TICKER_SYMBOL_WORKFLOW_URL`

### Step 3: Add Google Sheets Lookup

1. Click **+ New step**
2. Search for "Google Sheets"
3. Select **Get rows** action
4. Configure:
   - **Location**: Your Google Drive location
   - **Document Library**: Your document library
   - **File**: Select your market data spreadsheet
   - **Table**: Select your data table
   - **Filter Query**: `ticker_symbol eq '@{triggerBody()?['tickerSymbol']}'`

### Step 4: Parse the Results

1. Add a **Compose** action
2. In the **Inputs** field, use:

```
@{first(body('Get_rows')?['value'])}
```

This gets the first matching row from Google Sheets.

### Step 5: Send Data Back to CRM

Add an **HTTP** action with these settings:

**Method**: POST

**URI**: `https://your-crm-domain.com` (or use postMessage - see below)

**Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Body**:
```json
{
  "type": "market-data-update",
  "payload": {
    "accountId": "@{triggerBody()?['accountId']}",
    "tickerSymbol": "@{triggerBody()?['tickerSymbol']}",
    "currentPrice": "@{outputs('Compose')?['current_price']}",
    "percentChange": "@{outputs('Compose')?['percent_change']}",
    "marketCap": "@{outputs('Compose')?['market_cap']}",
    "highPrice": "@{outputs('Compose')?['high_price']}",
    "lowPrice": "@{outputs('Compose')?['low_price']}",
    "openPrice": "@{outputs('Compose')?['open_price']}",
    "previousClose": "@{outputs('Compose')?['previous_close']}",
    "pegRatio": "@{outputs('Compose')?['peg_ratio']}",
    "annualSales": "@{outputs('Compose')?['annual_sales']}",
    "dividendYield": "@{outputs('Compose')?['dividend_yield']}",
    "fiftyTwoWeekLow": "@{outputs('Compose')?['fifty_two_week_low']}",
    "fiftyTwoWeekHigh": "@{outputs('Compose')?['fifty_two_week_high']}",
    "percentOfGeneralMarket": "@{outputs('Compose')?['percent_of_general_market']}",
    "sales52Weeks": "@{outputs('Compose')?['sales_52_weeks']}",
    "timestamp": "@{utcNow()}",
    "source": "google-sheets"
  }
}
```

### Alternative: Using postMessage (Recommended)

If you're running the CRM in an iframe or want to avoid CORS issues, use this JavaScript code in a **Compose** action instead:

```javascript
<script>
window.parent.postMessage({
  type: 'market-data-update',
  payload: @{outputs('Compose')}
}, '*');
</script>
```

Then use an **HTTP** action to return this HTML:

**Method**: POST  
**URI**: `https://your-crm-domain.com/callback` (any URL that returns 200 OK)  
**Body**: `@{outputs('Compose_2')}`

## How to Use

### In the CRM:

1. Open an account with a ticker symbol (or add one)
2. Click the **refresh icon** (🔄) next to the ticker symbol field
3. Wait for the loading indicator
4. Market data will automatically populate from your Google Sheets

### Visual Indicators:

- 🔄 **Blue text**: "Fetching market data from Google Sheets..." (loading)
- ✓ **Green text**: "Market data updated from Google Sheets at [time]" (success)
- ⚠️ **Red text**: Error message (if something went wrong)

## Troubleshooting

### Data Not Updating

1. **Check the workflow URL**: Make sure `VITE_PA_TICKER_SYMBOL_WORKFLOW_URL` in `.env.local` is correct
2. **Check Power Automate run history**: Go to your workflow and check if it's receiving the request
3. **Check Google Sheets**: Make sure the ticker symbol exists in your sheet with exact matching (case-sensitive)
4. **Check browser console**: Open DevTools (F12) and look for any error messages

### Workflow Not Triggering

1. Verify the HTTP trigger URL is correct
2. Make sure the workflow is turned ON in Power Automate
3. Check if there are any connection issues with Google Sheets

### Data Format Issues

1. Make sure column names in Google Sheets match exactly (use underscores, not spaces)
2. Check that the filter query in the "Get rows" action is correct
3. Verify the Compose action is getting the first row correctly

## Advanced: Automatic Updates

You can modify the workflow to automatically update market data on a schedule:

1. Add a **Recurrence** trigger (runs every hour, day, etc.)
2. Get all rows from Google Sheets
3. For each row, send an update to the CRM

This keeps your CRM market data fresh without manual refreshes.

## Testing

### Test with Sample Data

1. Add a test ticker to your Google Sheets (e.g., "TEST")
2. Fill in sample market data
3. In the CRM, create an account with ticker symbol "TEST"
4. Click the refresh button
5. Verify the data populates correctly

### Test the Workflow Directly

1. Go to your Power Automate workflow
2. Click **Test** → **Manually**
3. Use this test payload:

```json
{
  "accountId": "test-123",
  "tickerSymbol": "AAPL",
  "action": "request-market-data",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

4. Check if it successfully retrieves data from Google Sheets

## Security Considerations

1. **Validate ticker symbols**: Add validation in Power Automate to only accept valid ticker formats
2. **Rate limiting**: Consider adding rate limiting to prevent abuse
3. **Authentication**: In production, use proper authentication instead of `*` in postMessage origin
4. **Data privacy**: Ensure your Google Sheets access is properly secured

## Support

If you encounter issues:

1. Check the browser console for errors (F12)
2. Review Power Automate run history
3. Verify your Google Sheets structure matches the expected format
4. Ensure all environment variables are set correctly

---

**Next Steps:**

1. Set up your Google Sheet with market data
2. Create the Power Automate workflow following the steps above
3. Test with a sample ticker symbol
4. Start using automatic market data updates in your CRM!