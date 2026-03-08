/**
 * SharePoint Connector
 *
 * Handles authentication, document enumeration, and download from SharePoint
 */

import {
  SharePointConfig,
  Document,
  DocumentMetadata,
  IngestionResult,
} from '../../types';

export interface ISharePointConnector {
  authenticate(config: SharePointConfig): Promise<void>;
  listDocuments(
    config: SharePointConfig,
    includePatterns?: string[],
    excludePatterns?: string[]
  ): Promise<SharePointDocument[]>;
  downloadDocument(
    config: SharePointConfig,
    documentId: string
  ): Promise<Document>;
  syncDocuments(
    config: SharePointConfig,
    lastSyncTime?: Date
  ): Promise<IngestionResult>;
}

export interface SharePointDocument {
  id: string;
  name: string;
  path: string;
  size: number;
  modifiedDate: Date;
  author: string;
  contentType: string;
}

/**
 * SharePoint connector implementation
 */
export class SharePointConnector implements ISharePointConnector {
  private accessToken?: string;
  private tokenExpiry?: Date;

  /**
   * Authenticate with SharePoint
   */
  async authenticate(config: SharePointConfig): Promise<void> {
    const { type, credentials } = config.authentication;

    if (type === 'OAUTH') {
      await this.authenticateOAuth(config.siteUrl, credentials);
    } else if (type === 'SERVICE_PRINCIPAL') {
      await this.authenticateServicePrincipal(config.siteUrl, credentials);
    } else {
      throw new Error(`Unsupported authentication type: ${type}`);
    }
  }

  /**
   * List documents in SharePoint library
   */
  async listDocuments(
    config: SharePointConfig,
    includePatterns?: string[],
    excludePatterns?: string[]
  ): Promise<SharePointDocument[]> {
    await this.ensureAuthenticated(config);

    const { siteUrl, libraryName, folderPath } = config;
    const documents: SharePointDocument[] = [];

    // Build SharePoint REST API URL
    const baseUrl = `${siteUrl}/_api/web/lists/getbytitle('${libraryName}')/items`;
    const folderFilter = folderPath
      ? `?$filter=FileDirRef eq '${folderPath}'`
      : '';

    // Simulate API call (placeholder for actual implementation)
    // In real implementation, would use Microsoft Graph API or SharePoint REST API
    const response = await this.callSharePointAPI(baseUrl + folderFilter);

    // Parse response and filter by patterns
    for (const item of response.items || []) {
      const doc: SharePointDocument = {
        id: item.Id,
        name: item.FileLeafRef,
        path: item.FileRef,
        size: item.File?.Length || 0,
        modifiedDate: new Date(item.Modified),
        author: item.Author?.Title || 'Unknown',
        contentType: item.File?.ContentType || 'application/octet-stream',
      };

      // Apply include/exclude patterns
      if (this.matchesPatterns(doc.name, includePatterns, excludePatterns)) {
        documents.push(doc);
      }
    }

    return documents;
  }

  /**
   * Download a specific document
   */
  async downloadDocument(
    config: SharePointConfig,
    documentId: string
  ): Promise<Document> {
    await this.ensureAuthenticated(config);

    const { siteUrl } = config;
    const fileUrl = `${siteUrl}/_api/web/GetFileById('${documentId}')/$value`;

    // Download file content
    const content = await this.downloadFile(fileUrl);

    // Get file metadata
    const metadataUrl = `${siteUrl}/_api/web/GetFileById('${documentId}')/ListItemAllFields`;
    const metadata = await this.callSharePointAPI(metadataUrl);

    return {
      id: documentId,
      title: metadata.Title || metadata.FileLeafRef,
      content,
      metadata: this.parseMetadata(metadata),
      source: 'SHAREPOINT',
    };
  }

  /**
   * Sync documents with incremental update support
   */
  async syncDocuments(
    config: SharePointConfig,
    lastSyncTime?: Date
  ): Promise<IngestionResult> {
    try {
      await this.authenticate(config);

      // List documents modified since last sync
      const documents = await this.listDocuments(config);
      const documentsToSync = lastSyncTime
        ? documents.filter((doc) => doc.modifiedDate > lastSyncTime)
        : documents;

      const processedDocs: Document[] = [];
      const errors: string[] = [];

      // Download and process each document
      for (const doc of documentsToSync) {
        try {
          const fullDoc = await this.downloadDocument(config, doc.id);
          processedDocs.push(fullDoc);
        } catch (error) {
          errors.push(
            `Failed to download ${doc.name}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      return {
        success: errors.length === 0,
        documentsProcessed: processedDocs.length,
        documentsFailed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        documentsProcessed: 0,
        documentsFailed: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Authenticate using OAuth
   */
  private async authenticateOAuth(
    _siteUrl: string,
    credentials: Record<string, string>
  ): Promise<void> {
    const { clientId, clientSecret, tenantId } = credentials;

    if (!clientId || !clientSecret || !tenantId) {
      throw new Error(
        'OAuth authentication requires clientId, clientSecret, and tenantId'
      );
    }

    // Placeholder for OAuth flow
    // In real implementation, would use MSAL library
    this.accessToken = 'mock-oauth-token';
    this.tokenExpiry = new Date(Date.now() + 3600000); // 1 hour
  }

  /**
   * Authenticate using Service Principal
   */
  private async authenticateServicePrincipal(
    _siteUrl: string,
    credentials: Record<string, string>
  ): Promise<void> {
    const { clientId, clientSecret, tenantId } = credentials;

    if (!clientId || !clientSecret || !tenantId) {
      throw new Error(
        'Service Principal authentication requires clientId, clientSecret, and tenantId'
      );
    }

    // Placeholder for Service Principal flow
    this.accessToken = 'mock-sp-token';
    this.tokenExpiry = new Date(Date.now() + 3600000);
  }

  /**
   * Ensure authentication is valid
   */
  private async ensureAuthenticated(config: SharePointConfig): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry) {
      await this.authenticate(config);
      return;
    }

    // Refresh token if expired
    if (this.tokenExpiry < new Date()) {
      await this.authenticate(config);
    }
  }

  /**
   * Call SharePoint REST API
   */
  private async callSharePointAPI(_url: string): Promise<any> {
    // Placeholder for actual API call
    // In real implementation, would use fetch with authorization header
    return {
      items: [],
    };
  }

  /**
   * Download file content
   */
  private async downloadFile(_url: string): Promise<string> {
    // Placeholder for actual file download
    // In real implementation, would use fetch and parse based on content type
    return 'Document content placeholder';
  }

  /**
   * Parse SharePoint metadata to Document metadata
   */
  private parseMetadata(spMetadata: any): DocumentMetadata {
    return {
      author: spMetadata.Author?.Title,
      createdDate: spMetadata.Created ? new Date(spMetadata.Created) : undefined,
      modifiedDate: spMetadata.Modified
        ? new Date(spMetadata.Modified)
        : undefined,
      tags: spMetadata.TaxKeyword?.results || [],
      category: spMetadata.ContentType?.Name,
      customFields: {
        fileSize: spMetadata.File?.Length,
        fileType: spMetadata.File?.Name?.split('.').pop(),
      },
    };
  }

  /**
   * Check if filename matches include/exclude patterns
   */
  private matchesPatterns(
    filename: string,
    includePatterns?: string[],
    excludePatterns?: string[]
  ): boolean {
    // If no patterns specified, include everything
    if (!includePatterns && !excludePatterns) {
      return true;
    }

    // Check exclude patterns first
    if (excludePatterns) {
      for (const pattern of excludePatterns) {
        if (this.matchesPattern(filename, pattern)) {
          return false;
        }
      }
    }

    // Check include patterns
    if (includePatterns) {
      for (const pattern of includePatterns) {
        if (this.matchesPattern(filename, pattern)) {
          return true;
        }
      }
      return false; // Didn't match any include pattern
    }

    return true;
  }

  /**
   * Simple pattern matching (supports * wildcard)
   */
  private matchesPattern(filename: string, pattern: string): boolean {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
      'i'
    );
    return regex.test(filename);
  }
}
