// SharePoint configuration
export const sharePointConfig = {
  clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
  tenantId: import.meta.env.VITE_AZURE_TENANT_ID || '',
  redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin,
  siteUrl: import.meta.env.VITE_SHAREPOINT_SITE_URL || 'https://diageo.sharepoint.com/sites/CommercialAnalytics314/Strategic%20Accounts%20Document',
  libraryName: import.meta.env.VITE_SHAREPOINT_LIBRARY || 'Strategic Accounts Documents',
  scopes: [
    'https://graph.microsoft.com/User.Read',
    'https://graph.microsoft.com/Files.ReadWrite.All',
    `${import.meta.env.VITE_SHAREPOINT_SITE_URL || 'https://diageo.sharepoint.com'}/.default`
  ]
};

// Check if SharePoint is configured
export const isSharePointConfigured = (): boolean => {
  return !!(sharePointConfig.clientId && sharePointConfig.tenantId);
};

// Get demo mode status
export const isDemoMode = (): boolean => {
  return !isSharePointConfigured();
};