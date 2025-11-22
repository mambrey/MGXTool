# Market Snapshot Feature Guide

This guide explains how the Market Snapshot feature works and how to use it to display real-time market data for publicly traded companies in your CRM.

## Overview

The Market Snapshot feature allows you to:
1. Upload market data via CSV file for accounts with ticker symbols
2. Automatically display financial metrics in account summaries
3. Keep track of stock performance for publicly traded customers

## How It Works

### Data Flow

```
CSV File Upload → MarketSnapshotUpload Component → Account Object → AccountDetails Display
```

1. **Upload**: Admin uploads a CSV file with market data
2. **Match**: System matches ticker symbols to existing accounts
3. **Update**: Account records are updated with market data
4. **Display**: Market snapshot appears in account details

## Step-by-Step Usage

### Step 1: Add Ticker Symbol to Account

Before market data can be displayed, the account must have a ticker symbol:

1. Go to **Accounts** → Select an account or create a new one
2. In the "Customer Overview" section, enter the **Ticker Symbol** (e.g., "COST" for Costco)
3. The "Publicly Traded" checkbox will be automatically checked
4. Click "Save Account"

**Important**: The ticker symbol must match the symbol used in your CSV file.

### Step 2: Prepare Market Data CSV

Create a CSV file with the following columns:

#### Required Column:
- **Ticker Symbol** - Must match the ticker symbol in your account

#### Optional Columns (all market data fields):
- Current Price
- Percent Change
- Market Cap
- High Price
- Low Price
- Open Price
- Previous Close
- Annual Sales
- Dividend Yield
- 52 Week High
- 52 Week Low
- PEG Ratio

#### Example CSV Format:

```csv
Ticker Symbol,Current Price,Percent Change,Market Cap,High Price,Low Price,Open Price,Previous Close,Annual Sales,Dividend Yield,52 Week High,52 Week Low,PEG Ratio
COST,$789.50,+1.2%,350.2B,$795.00,$785.00,$787.00,$780.00,242.3B,0.62%,$612.27,$440.14,2.85
WMT,$165.25,+0.8%,445.8B,$167.00,$164.50,$165.00,$164.00,611.3B,1.45%,$180.48,$117.27,3.12
TGT,$142.75,-0.5%,65.4B,$145.00,$141.00,$143.50,$143.50,107.6B,2.95%,$181.86,$102.93,2.45
```

**Tips:**
- Include the `$` symbol for prices (e.g., "$789.50")
- Include the `%` symbol for percentages (e.g., "+1.2%")
- Use standard abbreviations for large numbers (B for billion, M for million)
- Leave cells blank to keep existing values unchanged

### Step 3: Upload Market Data

1. Go to **Settings** (or wherever MarketSnapshotUpload component is located)
2. Click **"Download Template"** to get a CSV with your current accounts
3. Open the downloaded CSV in Excel or Google Sheets
4. Update the market data columns with current values
5. Save the file as CSV
6. Click **"Upload CSV"** and select your updated file
7. Review the preview showing which accounts will be updated
8. Click **"Confirm Import"**

### Step 4: View Market Snapshot

1. Go to **Accounts** → Select an account with a ticker symbol
2. Scroll to the **"Market Snapshot"** section
3. The section will display all available market data:

```
Market Snapshot
├── Current Price: $789.50
├── Percent Change: +1.2%
├── Market Cap: 350.2B
├── High Price: $795.00
├── Low Price: $785.00
├── Open Price: $787.00
├── Previous Close: $780.00
├── Annual Sales: 242.3B
├── Revenue: (if available)
├── Dividend Yield: 0.62%
├── 52-Week High: $612.27
├── 52-Week Low: $440.14
└── PEG Ratio: 2.85
```

## Understanding the Display

### When Market Data Shows:

✅ **Account has ticker symbol** AND **Market data has been uploaded**
- All available fields are displayed
- Empty fields are hidden

### When Market Data Doesn't Show:

❌ **No ticker symbol** → Market Snapshot section shows "No ticker symbol"
❌ **Ticker symbol but no data uploaded** → Fields show as empty or "N/A"

## Best Practices

### 1. Regular Updates

Market data should be updated regularly to stay current:
- **Daily**: For actively traded stocks
- **Weekly**: For stable, large-cap stocks
- **Monthly**: For long-term tracking

### 2. Data Sources

Reliable sources for market data:
- Yahoo Finance
- Google Finance
- Bloomberg
- Your company's financial data provider
- Stock exchange websites

### 3. Automation (Advanced)

For automatic updates, you can:
1. Set up a scheduled task to fetch market data from an API
2. Generate the CSV file automatically
3. Use the MarketSnapshotUpload component programmatically
4. Or integrate with Power Automate to fetch data on a schedule

### 4. Data Validation

Before uploading:
- ✅ Verify ticker symbols match exactly (case-insensitive)
- ✅ Check for typos in numerical values
- ✅ Ensure proper formatting ($ for prices, % for percentages)
- ✅ Remove any extra spaces or special characters

## Troubleshooting

### Problem: Market Snapshot section is empty

**Possible causes:**
1. No ticker symbol assigned to the account
2. Market data CSV hasn't been uploaded
3. Ticker symbol in CSV doesn't match account

**Solutions:**
1. Add ticker symbol to the account
2. Upload market data CSV
3. Verify ticker symbols match exactly

### Problem: Some fields are missing

**Cause:** Those fields weren't included in the CSV upload

**Solution:** 
- Re-upload CSV with all desired fields filled in
- Empty fields in CSV will keep existing values

### Problem: Upload fails with "Ticker Symbol not found"

**Cause:** CSV contains ticker symbols that don't match any accounts

**Solution:**
1. Check the error message for specific ticker symbols
2. Either add accounts with those ticker symbols
3. Or remove those rows from the CSV

### Problem: Wrong data appears

**Cause:** Ticker symbol mismatch or data entry error

**Solution:**
1. Verify the ticker symbol is correct in the account
2. Check the CSV data for that ticker symbol
3. Re-upload with corrected data

## CSV Template Download

The system provides a convenient template download feature:

1. Click **"Download Template"**
2. The CSV includes:
   - All accounts that have ticker symbols
   - Current market data (if any)
   - All required column headers
3. Update the values in Excel/Google Sheets
4. Save and re-upload

**Benefits:**
- ✅ Correct column headers
- ✅ Existing ticker symbols pre-filled
- ✅ Current data as starting point
- ✅ No manual CSV creation needed

## Advanced: API Integration

For real-time market data, consider integrating with financial APIs:

### Popular Financial APIs:
- **Alpha Vantage** (Free tier available)
- **IEX Cloud** (Free and paid tiers)
- **Finnhub** (Free tier available)
- **Yahoo Finance API** (Unofficial)

### Integration Approach:
1. Set up API credentials
2. Create a scheduled task (daily/hourly)
3. Fetch data for all ticker symbols
4. Generate CSV automatically
5. Import via MarketSnapshotUpload component

## Data Privacy & Compliance

**Important Notes:**
- Market data is stored locally in browser storage
- No data is sent to external servers (unless you configure it)
- Ensure compliance with your data provider's terms of service
- Some financial data may be subject to licensing restrictions

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Verify your CSV format matches the template
3. Ensure ticker symbols are correct
4. Review browser console for error messages