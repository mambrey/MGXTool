import { sharePointAuth } from './sharepoint-auth';

export interface SharePointUploadOptions {
  siteUrl: string;
  libraryName: string;
  folderPath: string;
  file: File;
  fileName?: string;
}

export interface SharePointFileInfo {
  name: string;
  serverRelativeUrl: string;
  timeCreated: string;
  timeLastModified: string;
  length: number;
  uniqueId: string;
}

interface SharePointFileResponse {
  Name: string;
  ServerRelativeUrl: string;
  TimeCreated: string;
  TimeLastModified: string;
  Length: number;
  UniqueId: string;
}

class SharePointAPIService {
  private async getHeaders(): Promise<HeadersInit> {
    const token = await sharePointAuth.getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json;odata=verbose',
    };
  }

  private extractSiteDetails(siteUrl: string): { hostname: string; sitePath: string } {
    const url = new URL(siteUrl);
    const hostname = url.hostname;
    const sitePath = url.pathname;
    return { hostname, sitePath };
  }

  async uploadFile(options: SharePointUploadOptions): Promise<SharePointFileInfo> {
    const { siteUrl, libraryName, folderPath, file, fileName } = options;
    const { hostname, sitePath } = this.extractSiteDetails(siteUrl);
    const uploadFileName = fileName || file.name;
    
    // Construct the REST API endpoint
    const apiUrl = `https://${hostname}${sitePath}/_api/web/GetFolderByServerRelativeUrl('${libraryName}/${folderPath}')/Files/add(url='${encodeURIComponent(uploadFileName)}',overwrite=true)`;

    const headers = await this.getHeaders();
    
    // Read file as array buffer
    const fileBuffer = await file.arrayBuffer();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/octet-stream',
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      name: data.d.Name,
      serverRelativeUrl: data.d.ServerRelativeUrl,
      timeCreated: data.d.TimeCreated,
      timeLastModified: data.d.TimeLastModified,
      length: data.d.Length,
      uniqueId: data.d.UniqueId,
    };
  }

  async downloadFile(siteUrl: string, fileServerRelativeUrl: string): Promise<Blob> {
    const { hostname, sitePath } = this.extractSiteDetails(siteUrl);
    const apiUrl = `https://${hostname}${sitePath}/_api/web/GetFileByServerRelativeUrl('${fileServerRelativeUrl}')/$value`;

    const headers = await this.getHeaders();

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    return await response.blob();
  }

  async deleteFile(siteUrl: string, fileServerRelativeUrl: string): Promise<void> {
    const { hostname, sitePath } = this.extractSiteDetails(siteUrl);
    const apiUrl = `https://${hostname}${sitePath}/_api/web/GetFileByServerRelativeUrl('${fileServerRelativeUrl}')`;

    const headers = await this.getHeaders();

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        ...headers,
        'IF-MATCH': '*',
        'X-HTTP-Method': 'DELETE',
      },
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }
  }

  async getFileInfo(siteUrl: string, fileServerRelativeUrl: string): Promise<SharePointFileInfo> {
    const { hostname, sitePath } = this.extractSiteDetails(siteUrl);
    const apiUrl = `https://${hostname}${sitePath}/_api/web/GetFileByServerRelativeUrl('${fileServerRelativeUrl}')`;

    const headers = await this.getHeaders();

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Get file info failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      name: data.d.Name,
      serverRelativeUrl: data.d.ServerRelativeUrl,
      timeCreated: data.d.TimeCreated,
      timeLastModified: data.d.TimeLastModified,
      length: data.d.Length,
      uniqueId: data.d.UniqueId,
    };
  }

  async listFiles(siteUrl: string, libraryName: string, folderPath: string = ''): Promise<SharePointFileInfo[]> {
    const { hostname, sitePath } = this.extractSiteDetails(siteUrl);
    const folderUrl = folderPath ? `${libraryName}/${folderPath}` : libraryName;
    const apiUrl = `https://${hostname}${sitePath}/_api/web/GetFolderByServerRelativeUrl('${folderUrl}')/Files`;

    const headers = await this.getHeaders();

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`List files failed: ${response.status}`);
    }

    const data = await response.json();
    return data.d.results.map((file: SharePointFileResponse) => ({
      name: file.Name,
      serverRelativeUrl: file.ServerRelativeUrl,
      timeCreated: file.TimeCreated,
      timeLastModified: file.TimeLastModified,
      length: file.Length,
      uniqueId: file.UniqueId,
    }));
  }
}

export const sharePointAPI = new SharePointAPIService();