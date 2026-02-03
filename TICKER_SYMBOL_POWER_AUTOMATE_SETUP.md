# Ticker Symbol Power Automate Integration Setup Guide

This guide explains how to set up Power Automate to automatically receive ticker symbol data when new ticker symbols are added to customer accounts in the Diageo AccountIQ Dashboard.

## Overview

When a user adds or updates a ticker symbol in the customer accounts section, the CRM Dashboard automatically sends the ticker symbol data to a Power Automate workflow. This enables you to:

- Track all ticker symbols added to customer accounts
- Automatically sync ticker data to other systems (Excel, SharePoint, Dataverse, etc.)
- Trigger financial data lookups or updates
- Send notifications when new publicly traded companies are added
- Create reports or dashboards based on ticker symbol data
- Integrate with financial APIs for real-time market data

## Data Sent to Power Automate

When a new ticker symbol is added, the following data is sent to your Power Automate workflow:

```json
{
  "dataType": "ticker-symbol",
  "accountId": "12345",
  "accountName": "Walmart Inc.",
  "tickerSymbol": "WMT",
  "publiclyTraded": true,
  "parentCompany": "Walmart Holdings",
  "industry": "Retail",
  "accountOwner": "John Smith",
  "currentPrice": "152.50",
  "percentChange": "+1.2%",
  "marketCap": "415.2B",
  "highPrice": "153.20",
  "lowPrice": "151.80",
  "openPrice": "152.00",
  "previousClose": "151.00",
  "pegRatio": "2.5",
  "annualSales": "611.3B",
  "dividendYield": "1.45%",
  "fiftyTwoWeekLow": "145.30",
  "fiftyTwoWeekHigh": "160.77",
  "timestamp": "2024-11-06T10:30:00Z",
  "action": "added"
}
```

**Note**: The `action` field will be either `"added"` (new ticker symbol) or `"updated"` (existing ticker symbol modified).

## Step 1: Create Power Automate Workflow

### 1.1 Navigate to Power Automate

1. Go to https://make.powerautomate.com
2. Sign in with your Microsoft 365 account

### 1.2 Create New Flow

1. Click **"Create"** in the left sidebar
2. Select **"Automated cloud flow"**
3. Name it: **"CRM Ticker Symbol Handler"**
4. Search for and select trigger: **"When a HTTP request is received"**
5. Click **"Create"**

### 1.3 Configure HTTP Request Trigger

1. In the trigger, click **"Generate from sample"**
2. Paste the following JSON schema:

```json
{
  "dataType": "ticker-symbol",
  "accountId": "12345",
  "accountName": "Example Company Inc.",
  "tickerSymbol": "EXMP",
  "publiclyTraded": true,
  "parentCompany": "Example Holdings",
  "industry": "Technology",
  "accountOwner": "Jane Doe",
  "currentPrice": "150.25",
  "percentChange": "+2.5%",
  "marketCap": "50B",
  "highPrice": "152.00",
  "lowPrice": "149.50",
  "openPrice": "150.00",
  "previousClose": "146.50",
  "pegRatio": "1.8",
  "annualSales": "25.5B",
  "dividendYield": "2.1%",
  "fiftyTwoWeekLow": "120.00",
  "fiftyTwoWeekHigh": "165.00",
  "timestamp": "2024-11-06T10:30:00Z",
  "action": "added"
}
```

3. Click **"Done"**

## Step 2: Add Actions to Your Workflow

Here are several example actions you can add to process ticker symbol data:

### Example 1: Log to Excel Online

Track all ticker symbols in an Excel spreadsheet:

1. Click **"+ New step"**
2. Search for **"Add a row into a table"** (Excel Online)
3. Configure:
   - **Location**: OneDrive for Business
   - **Document Library**: OneDrive
   - **File**: Select your Excel file (e.g., `Ticker_Symbols_Log.xlsx`)
   - **Table**: Select your table
   - **Map fields**:
     - Timestamp: `@{triggerBody()?['timestamp']}`
     - Account Name: `@{triggerBody()?['accountName']}`
     - Ticker Symbol: `@{triggerBody()?['tickerSymbol']}`
     - Account Owner: `@{triggerBody()?['accountOwner']}`
     - Market Cap: `@{triggerBody()?['marketCap']}`
     - Current Price: `@{triggerBody()?['currentPrice']}`
     - Action: `@{triggerBody()?['action']}`

### Example 2: Send Email Notification

Notify stakeholders when a new ticker symbol is added:

1. Click **"+ New step"**
2. Search for **"Send an email (V2)"**
3. Configure:
   - **To**: finance-team@company.com
   - **Subject**: `New Ticker Symbol Added: @{triggerBody()?['tickerSymbol']}`
   - **Body**:
     ```
     A new ticker symbol has been added to the CRM:
     
     Account: @{triggerBody()?['accountName']}
     Ticker Symbol: @{triggerBody()?['tickerSymbol']}
     Industry: @{triggerBody()?['industry']}
     Account Owner: @{triggerBody()?['accountOwner']}
     Publicly Traded: @{triggerBody()?['publiclyTraded']}
     
     Market Data:
     - Current Price: @{triggerBody()?['currentPrice']}
     - Market Cap: @{triggerBody()?['marketCap']}
     - 52-Week Range: @{triggerBody()?['fiftyTwoWeekLow']} - @{triggerBody()?['fiftyTwoWeekHigh']}
     
     Added: @{triggerBody()?['timestamp']}
     ```

### Example 3: Add to SharePoint List

Store ticker symbols in a SharePoint list:

1. Click **"+ New step"**
2. Search for **"Create item"** (SharePoint)
3. Configure:
   - **Site Address**: Select your SharePoint site
   - **List Name**: Select your list (e.g., "Ticker Symbols")
   - **Map fields**:
     - Title: `@{triggerBody()?['tickerSymbol']}`
     - Account Name: `@{triggerBody()?['accountName']}`
     - Account Owner: `@{triggerBody()?['accountOwner']}`
     - Market Cap: `@{triggerBody()?['marketCap']}`
     - Current Price: `@{triggerBody()?['currentPrice']}`
     - Date Added: `@{triggerBody()?['timestamp']}`

### Example 4: Post to Microsoft Teams

Notify your team via Teams:

1. Click **"+ New step"**
2. Search for **"Post message in a chat or channel"**
3. Configure:
   - **Post as**: Flow bot
   - **Post in**: Channel
   - **Team**: Select your team
   - **Channel**: Select your channel
   - **Message**:
     ```
     📊 **New Ticker Symbol Added**
     
     **Account**: @{triggerBody()?['accountName']}
     **Ticker**: @{triggerBody()?['tickerSymbol']}
     **Industry**: @{triggerBody()?['industry']}
     **Owner**: @{triggerBody()?['accountOwner']}
     
     💰 **Market Data**:
     - Price: @{triggerBody()?['currentPrice']} (@{triggerBody()?['percentChange']})
     - Market Cap: @{triggerBody()?['marketCap']}
     
     🕐 Added: @{triggerBody()?['timestamp']}
     ```

### Example 5: Create Task in Planner

Create a task to review the new ticker symbol:

1. Click **"+ New step"**
2. Search for **"Create a task"** (Planner)
3. Configure:
   - **Group Id**: Select your group
   - **Plan Id**: Select your plan
   - **Title**: `Review Ticker: @{triggerBody()?['tickerSymbol']} - @{triggerBody()?['accountName']}`
   - **Description**: 
     ```
     New ticker symbol added to CRM:
     
     Account: @{triggerBody()?['accountName']}
     Ticker: @{triggerBody()?['tickerSymbol']}
     Owner: @{triggerBody()?['accountOwner']}
     Market Cap: @{triggerBody()?['marketCap']}
     ```
   - **Assigned User Ids**: Select team members

### Example 6: Conditional Logic - Only Process New Additions

Add a condition to only process when action is "added" (not "updated"):

1. Click **"+ New step"**
2. Search for **"Condition"**
3. Configure:
   - **Choose a value**: `@{triggerBody()?['action']}`
   - **is equal to**: `added`
4. Add actions in the **"If yes"** branch

### Example 7: Store in Dataverse

Save ticker data to Dataverse for reporting:

1. Click **"+ New step"**
2. Search for **"Add a new row"** (Microsoft Dataverse)
3. Configure:
   - **Table name**: Select your custom table
   - **Map fields** to your table columns

## Step 3: Save and Get Workflow URL

1. Click **"Save"** at the top of the flow
2. Go back to the **"When a HTTP request is received"** trigger
3. Copy the **"HTTP POST URL"** - it will look like:
   ```
   https://prod-XX.region.logic.azure.com:443/workflows/xxxxx/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxx
   ```
4. **Important**: Keep this URL secure - it contains authentication tokens

## Step 4: Configure CRM Dashboard

### 4.1 Update Environment Variables

1. In your project root (`/workspace/shadcn-ui/`), create or update `.env.local`:

```env
# Power Automate Ticker Symbol Workflow URL
VITE_PA_TICKER_SYMBOL_WORKFLOW_URL=https://prod-XX.region.logic.azure.com:443/workflows/xxxxx/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxx
```

2. Replace the URL with your actual Power Automate workflow URL from Step 3

### 4.2 Restart Development Server

```bash
cd /workspace/shadcn-ui
pnpm run dev
```

## Step 5: Test the Integration

### Test from CRM Dashboard

1. Open your CRM Dashboard
2. Navigate to **Accounts** section
3. Create a new account or edit an existing one
4. Add a ticker symbol (e.g., "AAPL", "MSFT", "WMT")
5. Mark the account as "Publicly Traded" (optional)
6. Save the account
7. Check your Power Automate flow run history
8. Verify the data was received and processed correctly

### Test from Power Automate

1. Go to your **"CRM Ticker Symbol Handler"** flow
2. Click **"Test"** → **"Manually"**
3. Click **"Test"** again
4. The test payload will be sent
5. Verify all actions execute successfully
6. Check the outputs of each action

## Advanced Scenarios

### Scenario 1: Integrate with Financial API

Automatically fetch additional financial data when a ticker is added:

1. Add **"HTTP"** action after the trigger
2. Configure:
   - **Method**: GET
   - **URI**: `https://financialapi.com/quote/@{triggerBody()?['tickerSymbol']}`
   - **Headers**: Add your API key
3. Parse the JSON response
4. Use the data in subsequent actions

### Scenario 2: Update Existing Records

Check if ticker already exists and update instead of creating new:

1. Add **"Get items"** action (SharePoint/Dataverse)
2. Filter by ticker symbol
3. Add **"Condition"** to check if item exists
4. **If yes**: Update the existing item
5. **If no**: Create a new item

### Scenario 3: Multi-System Sync

Sync ticker data to multiple systems:

1. Add parallel branches after the trigger
2. Each branch syncs to a different system:
   - Branch 1: Excel Online
   - Branch 2: SharePoint List
   - Branch 3: Dataverse
   - Branch 4: External API

### Scenario 4: Approval Workflow

Require approval before processing certain tickers:

1. Add **"Condition"** to check market cap or other criteria
2. If criteria met, add **"Start and wait for an approval"**
3. Route to different actions based on approval result

## Troubleshooting

### Issue: Workflow URL not working

**Solution**:
- Verify the URL is complete and includes the signature parameter
- Check that the workflow is turned **ON** in Power Automate
- Ensure there are no typos in the `.env.local` file
- Restart your development server after updating `.env.local`

### Issue: Data not being sent

**Solution**:
- Check browser console for error messages
- Verify the ticker symbol field is not empty
- Ensure you're saving a new ticker (not just editing other fields)
- Check that the workflow URL is configured in `.env.local`

### Issue: Workflow receives data but actions fail

**Solution**:
- Check Power Automate run history for specific error messages
- Verify all connections (Excel, SharePoint, etc.) are authenticated
- Ensure target lists/tables have the correct columns
- Check for data type mismatches

### Issue: CORS errors

**Solution**:
- Power Automate HTTP triggers should allow CORS by default
- If issues persist, check your browser's security settings
- Try testing from a different browser

## Security Best Practices

1. **Protect Workflow URLs**
   - Never commit `.env.local` to version control
   - Add `.env.local` to your `.gitignore` file
   - Workflow URLs contain security tokens - treat them as passwords
   - Rotate workflow URLs periodically by regenerating them

2. **Validate Input**
   - Add conditions in Power Automate to validate required fields
   - Check for reasonable data values (e.g., market cap > 0)
   - Implement error handling for malformed data

3. **Monitor Usage**
   - Check Power Automate run history regularly
   - Set up alerts for workflow failures
   - Monitor for unusual activity or high volumes

4. **Access Control**
   - Limit who can edit Power Automate workflows
   - Use Azure AD groups for team access
   - Implement approval processes for sensitive actions

## Production Deployment

When deploying to production:

1. **Environment Variables**
   - Configure workflow URLs in your hosting platform's environment variables
   - Use different workflows for dev/staging/production environments
   - Never hardcode URLs in the application

2. **Monitoring**
   - Enable Application Insights for Power Automate
   - Set up alerts for workflow failures
   - Monitor API call volumes and success rates

3. **Rate Limiting**
   - Power Automate has usage limits based on your license
   - Implement batching for high-volume scenarios
   - Consider queueing mechanisms if needed

4. **Documentation**
   - Document all workflows and their purposes
   - Keep this guide updated with any changes
   - Train team members on the system

## Example Use Cases

### Use Case 1: Financial Compliance Tracking

Track all publicly traded companies for compliance purposes:
- Log all ticker symbols to a compliance database
- Send notifications to compliance team
- Generate quarterly reports
- Flag accounts requiring additional review

### Use Case 2: Market Intelligence

Build a market intelligence dashboard:
- Collect ticker data in a centralized database
- Integrate with financial APIs for real-time updates
- Create Power BI dashboards
- Track portfolio of customer companies

### Use Case 3: Sales Enablement

Provide sales team with market insights:
- Send Teams notifications with market data
- Create tasks for account managers
- Update CRM with latest financial information
- Generate talking points for customer meetings

### Use Case 4: Risk Management

Monitor customer financial health:
- Track stock price changes
- Alert on significant market cap changes
- Monitor for financial distress signals
- Update risk scores automatically

## Support

If you encounter issues:

1. Check Power Automate run history for error details
2. Review browser console for client-side errors
3. Verify environment variables are set correctly
4. Test workflows manually before troubleshooting integration
5. Consult the main Power Automate setup guide for general issues

## Related Documentation

- [Power Automate Setup Guide](./POWER_AUTOMATE_SETUP_GUIDE.md) - General Power Automate integration
- [Technical Documentation](./TECHNICAL_DOCUMENTATION.md) - Complete technical overview
- [API Documentation](./API_DOCUMENTATION.md) - API reference

---

**Created**: 2024-11-06  
**Last Updated**: 2024-11-06  
**Version**: 1.0