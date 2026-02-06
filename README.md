# Diageo AccountIQ Dashboard

A comprehensive CRM system for managing strategic business relationships, tracking interactions, and driving revenue growth with integrated Power Automate workflow automation.

## Features

### Core CRM Capabilities
- **Account Management**: Track strategic accounts with detailed information including market data, headquarters location, and business metrics
- **Contact Management**: Maintain relationships with key stakeholders and decision makers
- **Document Storage**: SharePoint-integrated document management system
- **Contact Hierarchy**: Visualize organizational structures and reporting relationships
- **Task Management**: Track tasks with due dates and priorities

### Alert System with Power Automate
- **Multiple Alert Types**: Birthday, next contact, task due, JBP, account events, and contact events
- **Automated Notifications**: Send email alerts automatically through Power Automate workflows
- **Configurable Lead Times**: Customize advance notification periods for each alert type (7-90 days)
- **Smart Email Resolution**: Intelligent email routing with multiple fallback strategies
- **Manual & Auto-Send**: Choose between manual sending or automatic workflow triggers
- **Snooze & Completion**: Snooze alerts temporarily or mark them as complete

### Advanced Features
- **Market Data Integration**: Auto-populate financial data from CSV files for publicly traded companies
- **Google Maps Integration**: Address autocomplete and map visualization for headquarters locations
- **Advanced Filtering**: Filter accounts and contacts by relationship owners and VPs
- **Dashboard Analytics**: Real-time KPIs including strategic accounts, key contacts, upcoming birthdays, and overdue contacts
- **SharePoint Sync**: Automated data synchronization with SharePoint document libraries

## Setup

### Prerequisites

- Node.js 18+ and pnpm
- Google Maps API Key (optional, for address autocomplete)
- Microsoft Power Automate account (for alert notifications)
- SharePoint access (for document management)

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

4. Add your configuration to `.env`:
   ```bash
   # Google Maps (optional)
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   
   # SharePoint Configuration
   VITE_SHAREPOINT_SITE=https://yourcompany.sharepoint.com/sites/CRM
   VITE_SHAREPOINT_LIBRARY=Strategic Accounts
   
   # Power Automate Webhook URLs (see Power Automate Setup below)
   VITE_PA_BIRTHDAY_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
   VITE_PA_NEXT_CONTACT_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
   VITE_PA_TASK_DUE_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
   VITE_PA_JBP_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
   VITE_PA_CONTACT_EVENT_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
   VITE_PA_ACCOUNT_EVENT_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
   ```

### Power Automate Setup

To enable automated alert notifications:

1. **Create Power Automate Workflows**:
   - Go to [Power Automate](https://make.powerautomate.com)
   - Create a new "Instant cloud flow" with HTTP trigger
   - Add "Send an email" action
   - Copy the HTTP POST URL

2. **Configure Webhooks**:
   - Create separate workflows for each alert type (birthday, next contact, task due, JBP, contact event, account event)
   - Add webhook URLs to your `.env` file
   - Restart the development server

3. **Test Integration**:
   - Navigate to Alert System in the CRM
   - Create a test alert
   - Click "Send to PA" to verify email delivery

For detailed setup instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#power-automate-configuration).

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

## Key Features Explained

### Alert System

The Alert System provides comprehensive notification management:

- **Alert Types**:
  - 🎂 Birthday alerts (7-90 days advance notice)
  - 📞 Next contact reminders (1-30 days advance notice)
  - ✅ Task due dates (1-14 days advance notice)
  - 📊 Strategic Engagement Plan reminders (7-90 days advance notice)
  - 👤 Contact event alerts (1-30 days advance notice)
  - 🏢 Account event alerts (1-30 days advance notice)

- **Email Resolution**:
  - **Contact Alerts**: Uses contact notification email → Primary Diageo owner → Relationship owner directory → Contact's relationship owner
  - **Account Alerts**: Uses relationship owner directory → Associated contact emails → Account email

- **Auto-Send**: Enable automatic sending to Power Automate when alerts are generated

- **Reminder Frequency**: Choose how often to be reminded (once, daily, every 3 days, weekly)

### Google Maps Address Autocomplete

The HQ Address field in the Account Form includes Google Places Autocomplete functionality:

- **With API Key**: Start typing an address and select from Google's suggestions
- **Without API Key**: The field works as a regular text input
- **Fallback**: If Google Maps fails to load, the address field remains fully functional for manual entry

The "View on Map" button opens the address in Google Maps regardless of whether the autocomplete is enabled.

To get a Google Maps API Key:
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select an existing one
- Enable the "Places API" and "Maps JavaScript API"
- Create credentials (API Key)
- Restrict the API key to your domain for security

### Market Data Integration

The system supports automatic market data loading from CSV files:

1. Place your market data CSV file in the `public` directory
2. The CSV should include columns for ticker symbols and financial metrics
3. When you enter a ticker symbol, click the refresh button to load data
4. Data auto-populates fields like current price, market cap, 52-week high/low, etc.

### SharePoint Integration

Integrate with SharePoint for document management:

1. Configure SharePoint site and library URLs in `.env`
2. Upload documents directly to SharePoint from the CRM
3. Sync account and contact data to Excel files in SharePoint
4. Organize documents by type (contracts, proposals, presentations, etc.)

## Data Storage

All CRM data is stored in the browser's localStorage:

- **Accounts**: `crm-accounts`
- **Contacts**: `crm-contacts`
- **Alerts**: `crm-alerts`
- **Tasks**: `crm-tasks`
- **Documents**: `crm-documents`
- **Relationship Owners**: `crm-relationship-owners`

To export or backup your data:
1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Copy the values for backup

## Documentation

- **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)**: Comprehensive technical documentation including architecture, components, and data models
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**: Complete API reference for all components and services
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**: Step-by-step deployment instructions for various environments
- **[POWER_AUTOMATE_SETUP_GUIDE.md](./POWER_AUTOMATE_SETUP_GUIDE.md)**: Detailed Power Automate workflow setup guide

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Integrations**: 
  - Google Maps JavaScript API (@react-google-maps/api)
  - Microsoft Power Automate
  - SharePoint Online
- **State Management**: React Hooks, localStorage
- **Build Tools**: Vite, ESLint, PostCSS

## Troubleshooting

### Power Automate Not Working
- Verify webhook URLs are correctly configured in `.env`
- Restart development server after adding URLs
- Check browser console for configuration errors
- Test webhook URLs with Postman

### Email Not Sending
- Ensure relationship owners have email addresses in the directory
- For contact alerts: Set Primary Diageo Relationship Owner email
- For account alerts: Associate contacts with accounts
- Use "Clean Email Data" button in Alert Settings

### Alerts Not Appearing
- Check that alert flags are enabled (birthdayAlert, nextContactAlert, etc.)
- Verify dates are within the configured lead time window
- Review alert settings for correct lead days configuration

For more troubleshooting help, see [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md#troubleshooting).

## Support

For issues, questions, or feature requests:
- Check the documentation files in this repository
- Review browser console for error messages
- Verify all environment variables are configured
- Test Power Automate workflows independently

## License

MIT

---

**Version**: 1.3.0  
**Last Updated**: December 2024  
**Features**: Account Management, Contact Management, Alert System with Power Automate, SharePoint Integration, Task Management, Document Storage