import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { sharePointConfig } from '@/config/sharepoint';

class SharePointAuthService {
  private msalInstance: PublicClientApplication | null = null;
  private account: AccountInfo | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Only initialize if configuration is available
    if (!sharePointConfig.clientId || !sharePointConfig.tenantId) {
      console.warn('SharePoint configuration not found. Running in demo mode.');
      return;
    }

    const msalConfig = {
      auth: {
        clientId: sharePointConfig.clientId,
        authority: `https://login.microsoftonline.com/${sharePointConfig.tenantId}`,
        redirectUri: sharePointConfig.redirectUri,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
    };

    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  async login(): Promise<AccountInfo> {
    if (!this.msalInstance) {
      throw new Error('SharePoint not configured. Please set up Azure AD app registration.');
    }

    try {
      const loginResponse: AuthenticationResult = await this.msalInstance.loginPopup({
        scopes: sharePointConfig.scopes,
        prompt: 'select_account',
      });

      this.account = loginResponse.account;
      return loginResponse.account;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (!this.msalInstance) {
      return;
    }

    try {
      await this.msalInstance.logoutPopup();
      this.account = null;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string> {
    if (!this.msalInstance) {
      throw new Error('SharePoint not configured. Please set up Azure AD app registration.');
    }

    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please login first.');
    }

    const account = accounts[0];

    try {
      // Try to acquire token silently
      const response: AuthenticationResult = await this.msalInstance.acquireTokenSilent({
        scopes: sharePointConfig.scopes,
        account: account,
      });

      return response.accessToken;
    } catch (error) {
      console.warn('Silent token acquisition failed, trying interactive method');
      
      // If silent acquisition fails, try interactive method
      try {
        const response: AuthenticationResult = await this.msalInstance.acquireTokenPopup({
          scopes: sharePointConfig.scopes,
          account: account,
        });

        return response.accessToken;
      } catch (interactiveError) {
        console.error('Interactive token acquisition failed:', interactiveError);
        throw interactiveError;
      }
    }
  }

  isAuthenticated(): boolean {
    if (!this.msalInstance) {
      return false;
    }

    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0;
  }

  getCurrentAccount(): AccountInfo | null {
    if (!this.msalInstance) {
      return null;
    }

    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  isConfigured(): boolean {
    return this.msalInstance !== null;
  }
}

export const sharePointAuth = new SharePointAuthService();