# Diageo AccountIQ - Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the Diageo AccountIQ Dashboard to various environments, from development to production, including Power Automate integration setup.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Power Automate Configuration](#power-automate-configuration)
4. [Build Process](#build-process)
5. [Deployment Options](#deployment-options)
6. [SharePoint Configuration](#sharepoint-configuration)
7. [Security Considerations](#security-considerations)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **Package Manager**: pnpm (recommended) or npm
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **SharePoint**: SharePoint Online or SharePoint 2019+
- **Power Automate**: Microsoft Power Automate account with workflow creation permissions

### Development Tools
- **Code Editor**: VS Code (recommended)
- **Git**: Version control system
- **Terminal**: Command line interface

### Access Requirements
- **SharePoint Permissions**: Contribute access to target SharePoint site
- **Power Automate Permissions**: Ability to create and manage workflows
- **Domain Access**: Ability to deploy to target domain
- **SSL Certificate**: For HTTPS deployment (recommended)

## Environment Setup

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd strategic-accounts-crm

# Install dependencies
pnpm install

# Create .env file (see below for configuration)
cp .env.example .env

# Start development server
pnpm run dev

# Access application
# http://localhost:5173
```

### Environment Variables

Create environment-specific configuration files:

#### .env.development
```bash
# Application Configuration
VITE_APP_TITLE="Diageo AccountIQ - Development"
VITE_DEBUG_MODE="true"

# SharePoint Configuration
VITE_SHAREPOINT_SITE="https://yourcompany.sharepoint.com/sites/CRM-Dev"
VITE_SHAREPOINT_LIBRARY="Documents"

# Power Automate Webhook URLs (Development)
VITE_PA_BIRTHDAY_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?..."
VITE_PA_NEXT_CONTACT_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?..."
VITE_PA_TASK_DUE_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?..."
VITE_PA_JBP_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?..."
VITE_PA_CONTACT_EVENT_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?..."
VITE_PA_ACCOUNT_EVENT_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?..."
```

#### .env.production
```bash
# Application Configuration
VITE_APP_TITLE="Diageo AccountIQ"
VITE_DEBUG_MODE="false"

# SharePoint Configuration
VITE_SHAREPOINT_SITE="https://yourcompany.sharepoint.com/sites/CRM"
VITE_SHAREPOINT_LIBRARY="Strategic Accounts"

# Power Automate Webhook URLs (Production)
VITE_PA_BIRTHDAY_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?..."
VITE_PA_NEXT_CONTACT_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?..."
VITE_PA_TASK_DUE_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?..."
VITE_PA_JBP_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?..."
VITE_PA_CONTACT_EVENT_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?..."
VITE_PA_ACCOUNT_EVENT_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?..."
```

#### .env.example
```bash
# Application Configuration
VITE_APP_TITLE="Diageo AccountIQ"
VITE_DEBUG_MODE="false"

# SharePoint Configuration
VITE_SHAREPOINT_SITE="https://yourcompany.sharepoint.com/sites/CRM"
VITE_SHAREPOINT_LIBRARY="Strategic Accounts"

# Power Automate Webhook URLs
# Get these URLs from your Power Automate workflows
VITE_PA_BIRTHDAY_WORKFLOW_URL=""
VITE_PA_NEXT_CONTACT_WORKFLOW_URL=""
VITE_PA_TASK_DUE_WORKFLOW_URL=""
VITE_PA_JBP_WORKFLOW_URL=""
VITE_PA_CONTACT_EVENT_WORKFLOW_URL=""
VITE_PA_ACCOUNT_EVENT_WORKFLOW_URL=""
```

### Configuration Updates

Update SharePoint configuration in components:

#### src/components/SharePointSync.tsx
```typescript
const sharePointSite = import.meta.env.VITE_SHAREPOINT_SITE || 
  "https://yourcompany.sharepoint.com/sites/CRM";
const sharePointLibrary = import.meta.env.VITE_SHAREPOINT_LIBRARY || 
  "Strategic Accounts";
```

#### src/components/DocumentStorage.tsx
```typescript
const sharePointSite = import.meta.env.VITE_SHAREPOINT_SITE || 
  "https://yourcompany.sharepoint.com/sites/CRM";
const sharePointLibrary = import.meta.env.VITE_SHAREPOINT_LIBRARY || 
  "Strategic Accounts";
```

## Power Automate Configuration

### Overview
Power Automate integration enables automated email notifications for various alert types. Each alert type requires a separate workflow with an HTTP trigger.

### Step 1: Create Power Automate Workflows

For each alert type (birthday, next contact, task due, JBP, contact event, account event), create a workflow:

#### 1.1 Navigate to Power Automate
1. Go to [https://make.powerautomate.com](https://make.powerautomate.com)
2. Sign in with your Microsoft account
3. Select your environment

#### 1.2 Create New Flow
1. Click **+ Create** → **Instant cloud flow**
2. Name: "CRM - Birthday Alert Notification" (or appropriate name)
3. Choose trigger: **When an HTTP request is received**
4. Click **Create**

#### 1.3 Configure HTTP Trigger
1. Click on the trigger step
2. Click **Use sample payload to generate schema**
3. Paste the following JSON schema:

```json
{
  "alertType": "birthday",
  "contactName": "John Doe",
  "contactEmail": "john.doe@example.com",
  "accountName": "Acme Corporation",
  "dueDate": "2024-12-15T00:00:00.000Z",
  "daysUntil": 7,
  "priority": "medium",
  "relationshipOwner": "Jane Smith",
  "relationshipOwnerEmail": "jane.smith@company.com",
  "relationshipOwnerTeamsChannel": "channel-id-123",
  "vicePresident": "Bob Johnson",
  "description": "John Doe's birthday is in 7 days at Acme Corporation",
  "additionalData": {
    "alertId": "birthday-contact123",
    "contactId": "contact123",
    "accountId": "account456",
    "contactPhone": "+1-555-0123",
    "contactTitle": "CEO",
    "autoSent": false
  }
}
```

4. Click **Done**

#### 1.4 Add Email Action
1. Click **+ New step**
2. Search for **Send an email (V2)** (Office 365 Outlook)
3. Configure email:
   - **To**: Use dynamic content `relationshipOwnerEmail`
   - **Subject**: `🎂 Birthday Alert: [contactName]`
   - **Body**: Create a formatted email using dynamic content

**Example Email Template:**
```html
<h2>Birthday Reminder</h2>
<p><strong>Contact:</strong> [contactName]</p>
<p><strong>Account:</strong> [accountName]</p>
<p><strong>Birthday:</strong> [dueDate] ([daysUntil] days)</p>
<p><strong>Priority:</strong> [priority]</p>
<p><strong>Description:</strong> [description]</p>

<h3>Contact Details</h3>
<p><strong>Email:</strong> [contactEmail]</p>
<p><strong>Phone:</strong> [additionalData.contactPhone]</p>
<p><strong>Title:</strong> [additionalData.contactTitle]</p>

<p><em>This is an automated notification from the Diageo AccountIQ system.</em></p>
```

#### 1.5 Save and Get Webhook URL
1. Click **Save**
2. Expand the HTTP trigger step
3. Copy the **HTTP POST URL**
4. Save this URL - you'll need it for the .env file

### Step 2: Create Workflows for All Alert Types

Repeat Step 1 for each alert type with appropriate naming and email templates:

| Alert Type | Workflow Name | Subject Line |
|-----------|---------------|--------------|
| Birthday | CRM - Birthday Alert | 🎂 Birthday Alert: [contactName] |
| Next Contact | CRM - Next Contact Alert | 📞 Follow-up Due: [contactName] |
| Task Due | CRM - Task Due Alert | ✅ Task Due: [description] |
| JBP | CRM - JBP Alert | 📊 JBP Due: [accountName] |
| Contact Event | CRM - Contact Event Alert | 👤 Contact Event: [description] |
| Account Event | CRM - Account Event Alert | 🏢 Account Event: [description] |

### Step 3: Configure Environment Variables

Add all webhook URLs to your `.env` file:

```bash
VITE_PA_BIRTHDAY_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/abc123.../triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xyz789..."

VITE_PA_NEXT_CONTACT_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/def456.../triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=abc123..."

VITE_PA_TASK_DUE_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/ghi789.../triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=def456..."

VITE_PA_JBP_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/jkl012.../triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ghi789..."

VITE_PA_CONTACT_EVENT_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/mno345.../triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=jkl012..."

VITE_PA_ACCOUNT_EVENT_WORKFLOW_URL="https://prod-xx.eastus.logic.azure.com:443/workflows/pqr678.../triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mno345..."
```

### Step 4: Restart Development Server

After adding webhook URLs, restart the development server:

```bash
# Stop the current server (Ctrl+C)
# Start again
pnpm run dev
```

### Step 5: Test Power Automate Integration

1. Navigate to the Alert System in the CRM
2. Create a test alert (e.g., add a contact with a birthday)
3. Click "Send to PA" button
4. Check if email is received
5. Verify email content and formatting

### Advanced Power Automate Features

#### Add Teams Notification
```
1. Add action: "Post message in a chat or channel"
2. Configure:
   - Post as: Flow bot
   - Post in: Channel
   - Team: Your team
   - Channel: Use dynamic content `relationshipOwnerTeamsChannel`
   - Message: Alert details
```

#### Add Conditional Logic
```
1. Add action: "Condition"
2. Configure:
   - If priority equals "critical"
   - Yes: Send urgent email + Teams notification
   - No: Send standard email
```

#### Add Approval Workflow
```
1. Add action: "Start and wait for an approval"
2. Configure:
   - Approval type: Approve/Reject - First to respond
   - Title: Alert approval request
   - Assigned to: Manager email
```

### Power Automate Troubleshooting

#### Workflow Not Triggering
1. Check webhook URL is correctly copied
2. Verify .env file is loaded (restart dev server)
3. Check browser console for errors
4. Test webhook URL with Postman

#### Email Not Received
1. Check spam/junk folder
2. Verify email address is correct
3. Check Power Automate run history for errors
4. Ensure Office 365 connection is authorized

#### Invalid Schema Errors
1. Verify JSON schema matches payload structure
2. Check for required fields
3. Test with sample payload in Power Automate

## Build Process

### Development Build
```bash
# Run linting
pnpm run lint

# Type checking
pnpm run type-check

# Development build with hot reload
pnpm run dev
```

### Production Build
```bash
# Clean previous builds
rm -rf dist/

# Install dependencies
pnpm install --frozen-lockfile

# Run linting and type checking
pnpm run lint
pnpm run type-check

# Create production build
pnpm run build

# Preview production build locally
pnpm run preview
```

### Build Optimization
```bash
# Analyze bundle size
pnpm run build:analyze

# Build with source maps (for debugging)
pnpm run build:debug
```

### Build Output Structure
```
dist/
├── index.html              # Main HTML file
├── assets/
│   ├── index-[hash].js     # Main JavaScript bundle
│   ├── index-[hash].css    # Compiled CSS
│   └── vendor-[hash].js    # Vendor libraries
├── favicon.svg             # Application icon
└── robots.txt             # SEO configuration
```

### Pre-Deployment Checklist
- [ ] All environment variables configured (including Power Automate URLs)
- [ ] SharePoint URLs updated for target environment
- [ ] Power Automate workflows tested and working
- [ ] Build completes without errors or warnings
- [ ] Lint check passes
- [ ] Type checking passes
- [ ] All alert types tested with Power Automate
- [ ] Email resolution tested for both contact and account alerts
- [ ] Relationship Owner Directory populated with emails

## Deployment Options

### 1. Static Site Hosting

#### Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
pnpm run build
netlify deploy --prod --dir=dist

# Or use drag-and-drop deployment
# Upload dist/ folder to Netlify dashboard
```

**netlify.toml Configuration:**
```toml
[build]
  publish = "dist"
  command = "pnpm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
  
  # Power Automate URLs (use Netlify environment variables UI for sensitive data)
  # VITE_PA_BIRTHDAY_WORKFLOW_URL = ""
  # VITE_PA_NEXT_CONTACT_WORKFLOW_URL = ""
  # etc.
```

#### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
pnpm run build
vercel --prod

# Or connect GitHub repository for automatic deployments
```

**vercel.json Configuration:**
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_PA_BIRTHDAY_WORKFLOW_URL": "@pa_birthday_url",
    "VITE_PA_NEXT_CONTACT_WORKFLOW_URL": "@pa_next_contact_url"
  }
}
```

**Note**: Add Power Automate URLs as environment variables in Vercel dashboard.

#### GitHub Pages Deployment
```bash
# Install gh-pages
pnpm add -D gh-pages

# Add deployment script to package.json
"scripts": {
  "deploy": "gh-pages -d dist"
}

# Build and deploy
pnpm run build
pnpm run deploy
```

**Important**: GitHub Pages doesn't support environment variables. Consider using GitHub Secrets with GitHub Actions.

### 2. CDN Deployment

#### AWS CloudFront
1. **S3 Bucket Setup:**
   ```bash
   # Create S3 bucket
   aws s3 mb s3://your-crm-bucket
   
   # Upload build files
   aws s3 sync dist/ s3://your-crm-bucket --delete
   ```

2. **CloudFront Distribution:**
   - Origin: S3 bucket
   - Default Root Object: index.html
   - Error Pages: 404 → /index.html (for SPA routing)

3. **Environment Variables:**
   - Store Power Automate URLs in AWS Systems Manager Parameter Store
   - Inject during build process

#### Azure CDN
1. **Storage Account Setup:**
   ```bash
   # Create storage account
   az storage account create --name crmstorageaccount --resource-group myResourceGroup
   
   # Upload files
   az storage blob upload-batch --source dist --destination '$web' --account-name crmstorageaccount
   ```

2. **CDN Profile Configuration:**
   - Origin: Storage account static website endpoint
   - Caching rules: Cache static assets, bypass for index.html

3. **Environment Variables:**
   - Store in Azure Key Vault
   - Reference during build

### 3. Corporate/Internal Hosting

#### IIS Deployment
1. **Build Application:**
   ```bash
   pnpm run build
   ```

2. **IIS Configuration:**
   ```xml
   <!-- web.config -->
   <?xml version="1.0"?>
   <configuration>
     <system.webServer>
       <rewrite>
         <rules>
           <rule name="React Routes" stopProcessing="true">
             <match url=".*" />
             <conditions logicalGrouping="MatchAll">
               <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
               <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
             </conditions>
             <action type="Rewrite" url="/" />
           </rule>
         </rules>
       </rewrite>
     </system.webServer>
   </configuration>
   ```

#### Apache Deployment
1. **Upload Files:**
   ```bash
   # Copy dist contents to web root
   cp -r dist/* /var/www/html/
   ```

2. **Apache Configuration:**
   ```apache
   # .htaccess
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]
   ```

#### Nginx Deployment
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/crm/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. SharePoint App Deployment

#### SharePoint Framework (SPFx) Integration
1. **Create SPFx Project:**
   ```bash
   npm install -g @microsoft/generator-sharepoint
   yo @microsoft/sharepoint
   ```

2. **Integrate React App:**
   - Copy built assets to SPFx project
   - Configure as SharePoint web part
   - Deploy to SharePoint App Catalog

#### SharePoint Online Deployment
1. **Document Library Setup:**
   - Create "Apps" document library
   - Upload dist/ contents
   - Configure as default page

2. **Permissions Configuration:**
   - Site Collection permissions
   - Document library access
   - SharePoint API permissions

## SharePoint Configuration

### Site Preparation
1. **Create SharePoint Site:**
   ```powershell
   # PowerShell with SharePoint Online Management Shell
   Connect-SPOService -Url https://yourtenant-admin.sharepoint.com
   New-SPOSite -Url https://yourtenant.sharepoint.com/sites/CRM -Title "Diageo AccountIQ" -Owner admin@yourtenant.com
   ```

2. **Document Library Setup:**
   ```powershell
   # Create document library
   New-PnPList -Title "Strategic Accounts" -Template DocumentLibrary
   
   # Create folders
   Add-PnPFolder -Name "Contracts" -Folder "Strategic Accounts"
   Add-PnPFolder -Name "Proposals" -Folder "Strategic Accounts"
   Add-PnPFolder -Name "Presentations" -Folder "Strategic Accounts"
   Add-PnPFolder -Name "Meeting_Notes" -Folder "Strategic Accounts"
   Add-PnPFolder -Name "Contact_Files" -Folder "Strategic Accounts"
   Add-PnPFolder -Name "CRM_Data_Sync" -Folder "Strategic Accounts"
   ```

### Permissions Setup
```powershell
# Grant permissions to CRM users
Set-PnPListPermission -Identity "Strategic Accounts" -User "CRM-Users" -AddRole "Contribute"

# Grant read access to executives
Set-PnPListPermission -Identity "Strategic Accounts" -User "Executives" -AddRole "Read"
```

### API Permissions
Required SharePoint permissions for full functionality:
- **Sites.Read.All**: Read site information
- **Files.ReadWrite.All**: Read and write files
- **User.Read**: Read user profile information

## Security Considerations

### HTTPS Configuration
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
}
```

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sharepoint.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.sharepoint.com https://*.logic.azure.com;
  font-src 'self' data:;
">
```

**Note**: Add `https://*.logic.azure.com` to `connect-src` for Power Automate webhooks.

### Environment Variable Security

**Best Practices:**
1. **Never commit .env files to version control**
   ```gitignore
   # .gitignore
   .env
   .env.local
   .env.production
   .env.development
   ```

2. **Use platform-specific secret management:**
   - **Netlify**: Environment Variables in dashboard
   - **Vercel**: Environment Variables in project settings
   - **AWS**: Systems Manager Parameter Store or Secrets Manager
   - **Azure**: Key Vault

3. **Rotate webhook URLs periodically:**
   - Regenerate Power Automate webhook URLs every 90 days
   - Update .env files across all environments

### Data Protection
- **Local Storage Encryption**: Consider encrypting sensitive data
- **Session Management**: Implement proper session timeouts
- **Access Control**: Integrate with corporate authentication
- **Audit Logging**: Log user actions for compliance
- **Power Automate Security**: Restrict workflow access to authorized users only

## Performance Optimization

### Build Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### Caching Strategy
```nginx
# Static assets caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, no-transform";
}

# HTML files - no cache
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### CDN Configuration
```javascript
// Configure CDN for static assets
const CDN_URL = 'https://cdn.yourcompany.com/crm/';

// Update asset paths in production
if (process.env.NODE_ENV === 'production') {
  __webpack_public_path__ = CDN_URL;
}
```

## Monitoring & Maintenance

### Health Monitoring
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    powerAutomate: {
      configured: powerAutomateService.isEnabled(),
      webhooks: {
        birthday: !!import.meta.env.VITE_PA_BIRTHDAY_WORKFLOW_URL,
        nextContact: !!import.meta.env.VITE_PA_NEXT_CONTACT_WORKFLOW_URL,
        taskDue: !!import.meta.env.VITE_PA_TASK_DUE_WORKFLOW_URL,
        jbp: !!import.meta.env.VITE_PA_JBP_WORKFLOW_URL,
        contactEvent: !!import.meta.env.VITE_PA_CONTACT_EVENT_WORKFLOW_URL,
        accountEvent: !!import.meta.env.VITE_PA_ACCOUNT_EVENT_WORKFLOW_URL,
      }
    }
  });
});
```

### Analytics Integration
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Monitoring
```javascript
// Sentry integration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring
```javascript
// Web Vitals monitoring
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Power Automate Monitoring

Monitor Power Automate workflow health:

1. **Run History:**
   - Check Power Automate portal for failed runs
   - Review error messages
   - Monitor success rate

2. **Email Delivery:**
   - Track email delivery rates
   - Monitor bounce rates
   - Check spam reports

3. **Performance Metrics:**
   - Workflow execution time
   - API call latency
   - Throttling issues

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
pnpm install

# Check Node.js version
node --version  # Should be 18+

# Run with verbose logging
pnpm run build --verbose
```

#### Power Automate Issues

**Problem**: "Power Automate Not Configured" error
**Solution**:
1. Verify webhook URLs are in .env file
2. Check URLs don't have extra spaces or line breaks
3. Ensure .env file is in project root
4. Restart development server after adding URLs
5. Check browser console for specific missing variables

**Problem**: Alerts not sending to Power Automate
**Solution**:
1. Test webhook URL with Postman or curl:
   ```bash
   curl -X POST "YOUR_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"alertType":"birthday","contactName":"Test",...}'
   ```
2. Check Power Automate run history for errors
3. Verify workflow is enabled (not suspended)
4. Check email address format in Relationship Owner Directory

**Problem**: "No notification email configured" error
**Solution**:
1. Add email to Relationship Owner Directory
2. For contact alerts: Set Primary Diageo Relationship Owner email
3. For account alerts: Ensure contacts are associated with account
4. Use "Clean Email Data" button in Alert Settings
5. Check browser console for email resolution logs

**Problem**: Invalid email format errors
**Solution**:
1. Click "Clean Email Data" in Alert System Settings
2. Check for newlines, tabs, or spaces in email fields
3. Validate email format: `user@domain.com`
4. Review all email sources (contact, account, relationship owner)

#### SharePoint Connection Issues
1. **CORS Errors:**
   - Configure SharePoint CORS settings
   - Use SharePoint REST API properly
   - Implement proper authentication

2. **Permission Denied:**
   - Verify SharePoint site permissions
   - Check API permissions in Azure AD
   - Validate user access levels

#### Performance Issues
1. **Large Bundle Size:**
   ```bash
   # Analyze bundle
   pnpm run build:analyze
   
   # Implement code splitting
   const LazyComponent = React.lazy(() => import('./Component'));
   ```

2. **Slow Loading:**
   - Enable compression (gzip/brotli)
   - Implement proper caching headers
   - Use CDN for static assets

### Deployment Checklist

#### Pre-Deployment
- [ ] Environment variables configured (including all 6 Power Automate URLs)
- [ ] SharePoint URLs updated for target environment
- [ ] Power Automate workflows created and tested
- [ ] Webhook URLs copied to .env file
- [ ] Build successful without warnings
- [ ] Lint check passes
- [ ] Type checking passes

#### Security
- [ ] HTTPS certificate installed
- [ ] Security headers configured
- [ ] Content Security Policy includes Power Automate domains
- [ ] Environment variables secured (not in version control)
- [ ] Power Automate workflows restricted to authorized users

#### Functionality
- [ ] All alert types tested with Power Automate
- [ ] Email resolution tested for contact alerts
- [ ] Email resolution tested for account alerts
- [ ] Relationship Owner Directory populated
- [ ] Contact emails validated
- [ ] Account-contact associations verified

#### Performance
- [ ] Performance optimization applied
- [ ] Caching strategy implemented
- [ ] CDN configured (if applicable)
- [ ] Bundle size optimized

#### Monitoring
- [ ] Monitoring tools configured
- [ ] Error tracking enabled
- [ ] Analytics integrated
- [ ] Health check endpoint working
- [ ] Power Automate run history monitored

#### Documentation
- [ ] Deployment documentation updated
- [ ] User access documented
- [ ] Backup strategy implemented
- [ ] Support contacts listed

### Support Resources
- **Build Issues**: Check Vite documentation
- **SharePoint Problems**: Microsoft SharePoint documentation
- **Power Automate**: Microsoft Power Automate documentation
- **Performance**: Web.dev performance guides
- **Security**: OWASP security guidelines

### Emergency Contacts
- **Technical Support**: [Your IT Support Email]
- **Power Automate Admin**: [Power Automate Administrator]
- **SharePoint Admin**: [SharePoint Administrator]
- **Security Team**: [Security Team Contact]

---

**Deployment Guide Version**: 1.3.0  
**Last Updated**: December 2024  
**Supported Environments**: Production, Staging, Development