# SharePoint Integration Setup Guide

This guide will walk you through setting up Azure AD App Registration to enable real SharePoint file uploads in the Strategic Accounts CRM Dashboard.

## Prerequisites

- Access to Azure Portal (https://portal.azure.com)
- SharePoint site administrator permissions
- Your SharePoint site URL: `https://diageo.sharepoint.com/sites/CommercialAnalytics314/Strategic%20Accounts%20Document`

## Step 1: Register Application in Azure AD

1. **Navigate to Azure Portal**
   - Go to https://portal.azure.com
   - Sign in with your organization account

2. **Open Azure Active Directory**
   - In the left sidebar, click "Azure Active Directory"
   - Or search for "Azure Active Directory" in the top search bar

3. **Register New Application**
   - Click "App registrations" in the left menu
   - Click "+ New registration" at the top
   - Fill in the registration form:
     - **Name**: `Strategic Accounts CRM - SharePoint Integration`
     - **Supported account types**: Select "Accounts in this organizational directory only (Diageo only - Single tenant)"
     - **Redirect URI**: 
       - Platform: `Single-page application (SPA)`
       - URI: `http://localhost:5173` (for development)
       - Add production URL when deploying (e.g., `https://your-domain.com`)
   - Click "Register"

4. **Note Your Application IDs**
   After registration, you'll see the Overview page. **Copy and save these values**:
   - **Application (client) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Directory (tenant) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

## Step 2: Configure API Permissions

1. **Add SharePoint Permissions**
   - In your app registration, click "API permissions" in the left menu
   - Click "+ Add a permission"
   - Select "SharePoint"
   - Choose "Delegated permissions"
   - Select the following permissions:
     - ✅ `AllSites.FullControl` - Full control of all site collections
     - ✅ `AllSites.Write` - Edit items in all site collections
     - ✅ `MyFiles.Write` - Edit user files
   - Click "Add permissions"

2. **Grant Admin Consent**
   - Click "Grant admin consent for [Your Organization]"
   - Click "Yes" to confirm
   - Wait for the status to show "Granted for [Your Organization]"

## Step 3: Configure Authentication

1. **Enable Implicit Grant Flow**
   - Click "Authentication" in the left menu
   - Under "Implicit grant and hybrid flows", check:
     - ✅ Access tokens (used for implicit flows)
     - ✅ ID tokens (used for implicit and hybrid flows)
   - Click "Save" at the bottom

2. **Add Additional Redirect URIs** (if needed)
   - In the same "Authentication" section
   - Under "Single-page application", click "+ Add URI"
   - Add your production URL when ready to deploy
   - Click "Save"

## Step 4: Configure Your Application

1. **Create Environment Configuration File**
   
   Create a file named `.env.local` in your project root (`/workspace/shadcn-ui/.env.local`):

   ```env
   # Azure AD Configuration
   VITE_AZURE_CLIENT_ID=your-client-id-here
   VITE_AZURE_TENANT_ID=your-tenant-id-here
   VITE_AZURE_REDIRECT_URI=http://localhost:5173

   # SharePoint Configuration
   VITE_SHAREPOINT_SITE_URL=https://diageo.sharepoint.com/sites/CommercialAnalytics314/Strategic%20Accounts%20Document
   VITE_SHAREPOINT_LIBRARY=Strategic Accounts Documents
   ```

2. **Replace the placeholder values**:
   - Replace `your-client-id-here` with your Application (client) ID from Step 1
   - Replace `your-tenant-id-here` with your Directory (tenant) ID from Step 1
   - Update the redirect URI if using a different port or domain

## Step 5: Update SharePoint Site Permissions

1. **Grant App Permissions to SharePoint Site**
   - Navigate to your SharePoint site: `https://diageo.sharepoint.com/sites/CommercialAnalytics314`
   - Click the gear icon (Settings) in the top right
   - Click "Site permissions"
   - Click "Advanced permissions settings"
   - In the ribbon, click "Grant Permissions"
   - Enter your app's Client ID: `your-client-id-here@your-tenant-id-here`
   - Select permission level: "Full Control"
   - Uncheck "Send an email invitation"
   - Click "Share"

## Step 6: Verify Document Library Structure

Ensure your SharePoint document library has the following folder structure:

```
Strategic Accounts Documents/
├── Contracts/
├── Proposals/
├── Presentations/
├── Meeting_Notes/
├── Reports/
├── Contact_Files/
└── General/
```

If these folders don't exist:
1. Navigate to your document library
2. Click "+ New" → "Folder"
3. Create each folder listed above

## Step 7: Test the Integration

1. **Start the Development Server**
   ```bash
   cd /workspace/shadcn-ui
   pnpm run dev
   ```

2. **Test Authentication**
   - Open the application in your browser
   - Navigate to Document Storage
   - Click "Upload to SharePoint"
   - You should see a Microsoft sign-in prompt
   - Sign in with your Diageo account
   - Grant the requested permissions

3. **Test File Upload**
   - After signing in, select a file to upload
   - Fill in the document details
   - Click "Upload to SharePoint"
   - Verify the file appears in your SharePoint library

## Troubleshooting

### Issue: "AADSTS50011: The reply URL specified in the request does not match"
**Solution**: Make sure the redirect URI in your `.env.local` file exactly matches one of the redirect URIs configured in Azure AD.

### Issue: "Access denied" when uploading
**Solution**: 
1. Verify API permissions are granted in Azure AD
2. Check that admin consent was granted
3. Ensure the app has permissions on the SharePoint site (Step 5)

### Issue: Files not appearing in SharePoint
**Solution**:
1. Check the folder structure exists (Step 6)
2. Verify the SharePoint site URL and library name in `.env.local`
3. Check browser console for error messages

### Issue: "Failed to acquire token silently"
**Solution**: Clear browser cache and cookies, then sign in again.

## Security Best Practices

1. **Never commit `.env.local` to version control**
   - Add `.env.local` to your `.gitignore` file
   - Use environment variables in production

2. **Use Least Privilege Principle**
   - Only grant necessary permissions
   - Consider using `AllSites.Write` instead of `AllSites.FullControl` if full control isn't needed

3. **Rotate Secrets Regularly**
   - If you use client secrets (not needed for SPA), rotate them every 90 days
   - Monitor app usage in Azure AD

4. **Enable Conditional Access**
   - Configure conditional access policies in Azure AD
   - Require MFA for sensitive operations

## Production Deployment

When deploying to production:

1. **Update Redirect URIs**
   - Add your production URL to Azure AD app registration
   - Update `VITE_AZURE_REDIRECT_URI` in production environment

2. **Use Environment Variables**
   - Configure environment variables in your hosting platform
   - Don't hardcode sensitive values in code

3. **Enable HTTPS**
   - Ensure your production site uses HTTPS
   - Azure AD requires HTTPS for redirect URIs (except localhost)

4. **Monitor Usage**
   - Check Azure AD sign-in logs regularly
   - Monitor SharePoint storage usage
   - Set up alerts for unusual activity

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Review Azure AD sign-in logs
3. Verify SharePoint site permissions
4. Contact your IT administrator for Azure AD access issues

## Next Steps

After completing this setup:
- ✅ Files will upload directly to SharePoint
- ✅ Users will authenticate with their Microsoft accounts
- ✅ Document versioning will work with SharePoint's built-in version control
- ✅ Files will be accessible through both the CRM and SharePoint

---

**Created**: 2024-11-05  
**Last Updated**: 2024-11-05  
**Version**: 1.0