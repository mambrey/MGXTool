# Strategic Accounts CRM - Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the Strategic Accounts CRM Dashboard to various environments, from development to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Build Process](#build-process)
4. [Deployment Options](#deployment-options)
5. [SharePoint Configuration](#sharepoint-configuration)
6. [Security Considerations](#security-considerations)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **Package Manager**: pnpm (recommended) or npm
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **SharePoint**: SharePoint Online or SharePoint 2019+

### Development Tools
- **Code Editor**: VS Code (recommended)
- **Git**: Version control system
- **Terminal**: Command line interface

### Access Requirements
- **SharePoint Permissions**: Contribute access to target SharePoint site
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

# Start development server
pnpm run dev

# Access application
# http://localhost:5173
```

### Environment Variables
Create environment-specific configuration files:

#### .env.development
```bash
VITE_APP_TITLE="Strategic Accounts CRM - Development"
VITE_SHAREPOINT_SITE="https://yourcompany.sharepoint.com/sites/CRM-Dev"
VITE_SHAREPOINT_LIBRARY="Documents"
VITE_DEBUG_MODE="true"
```

#### .env.production
```bash
VITE_APP_TITLE="Strategic Accounts CRM"
VITE_SHAREPOINT_SITE="https://yourcompany.sharepoint.com/sites/CRM"
VITE_SHAREPOINT_LIBRARY="Strategic Accounts"
VITE_DEBUG_MODE="false"
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
  ]
}
```

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
   New-SPOSite -Url https://yourtenant.sharepoint.com/sites/CRM -Title "Strategic Accounts CRM" -Owner admin@yourtenant.com
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
  connect-src 'self' https://*.sharepoint.com;
  font-src 'self' data:;
">
```

### Data Protection
- **Local Storage Encryption**: Consider encrypting sensitive data
- **Session Management**: Implement proper session timeouts
- **Access Control**: Integrate with corporate authentication
- **Audit Logging**: Log user actions for compliance

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
- [ ] Environment variables configured
- [ ] SharePoint URLs updated
- [ ] Build successful without warnings
- [ ] HTTPS certificate installed
- [ ] Security headers configured
- [ ] Performance optimization applied
- [ ] Monitoring tools configured
- [ ] Backup strategy implemented
- [ ] User access tested
- [ ] SharePoint integration verified

### Support Resources
- **Build Issues**: Check Vite documentation
- **SharePoint Problems**: Microsoft SharePoint documentation
- **Performance**: Web.dev performance guides
- **Security**: OWASP security guidelines

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: November 2024  
**Supported Environments**: Production, Staging, Development