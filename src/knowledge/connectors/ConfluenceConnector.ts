/**
 * Confluence Connector
 *
 * Handles authentication, page enumeration, and content extraction from Confluence
 */

import {
  ConfluenceConfig,
  Document,
  DocumentMetadata,
  IngestionResult,
} from '../../types';

export interface IConfluenceConnector {
  authenticate(config: ConfluenceConfig): Promise<void>;
  listPages(
    config: ConfluenceConfig,
    includePatterns?: string[],
    excludePatterns?: string[]
  ): Promise<ConfluencePage[]>;
  getPageContent(
    config: ConfluenceConfig,
    pageId: string
  ): Promise<Document>;
  downloadAttachment(
    config: ConfluenceConfig,
    attachmentId: string
  ): Promise<Document>;
  syncPages(
    config: ConfluenceConfig,
    lastSyncTime?: Date
  ): Promise<IngestionResult>;
}

export interface ConfluencePage {
  id: string;
  title: string;
  spaceKey: string;
  version: number;
  modifiedDate: Date;
  author: string;
  hasAttachments: boolean;
}

/**
 * Confluence connector implementation
 */
export class ConfluenceConnector implements IConfluenceConnector {
  private authHeader?: string;

  /**
   * Authenticate with Confluence
   */
  async authenticate(config: ConfluenceConfig): Promise<void> {
    const { type, credentials } = config.authentication;

    if (type === 'BASIC') {
      await this.authenticateBasic(credentials);
    } else if (type === 'OAUTH') {
      await this.authenticateOAuth(credentials);
    } else if (type === 'PAT') {
      await this.authenticatePAT(credentials);
    } else {
      throw new Error(`Unsupported authentication type: ${type}`);
    }
  }

  /**
   * List pages in Confluence space
   */
  async listPages(
    config: ConfluenceConfig,
    includePatterns?: string[],
    excludePatterns?: string[]
  ): Promise<ConfluencePage[]> {
    await this.ensureAuthenticated(config);

    const { baseUrl, spaceKey } = config;
    const pages: ConfluencePage[] = [];

    // Build Confluence REST API URL
    const apiUrl = `${baseUrl}/rest/api/content?spaceKey=${spaceKey}&type=page&expand=version,history`;

    // Simulate API call (placeholder for actual implementation)
    const response = await this.callConfluenceAPI(apiUrl);

    // Parse response and filter by patterns
    for (const page of response.results || []) {
      const confluencePage: ConfluencePage = {
        id: page.id,
        title: page.title,
        spaceKey: page.space?.key || spaceKey,
        version: page.version?.number || 1,
        modifiedDate: new Date(page.version?.when || page.history?.lastUpdated?.when),
        author: page.version?.by?.displayName || 'Unknown',
        hasAttachments: page.metadata?.labels?.results?.some(
          (l: any) => l.name === 'attachment'
        ),
      };

      // Apply include/exclude patterns
      if (this.matchesPatterns(confluencePage.title, includePatterns, excludePatterns)) {
        pages.push(confluencePage);
      }
    }

    return pages;
  }

  /**
   * Get page content
   */
  async getPageContent(
    config: ConfluenceConfig,
    pageId: string
  ): Promise<Document> {
    await this.ensureAuthenticated(config);

    const { baseUrl } = config;
    const apiUrl = `${baseUrl}/rest/api/content/${pageId}?expand=body.storage,version,history`;

    // Get page data
    const page = await this.callConfluenceAPI(apiUrl);

    // Extract content (Confluence uses XHTML storage format)
    const content = this.extractTextFromHTML(page.body?.storage?.value || '');

    return {
      id: pageId,
      title: page.title,
      content,
      metadata: this.parseMetadata(page),
      source: 'CONFLUENCE',
    };
  }

  /**
   * Download attachment
   */
  async downloadAttachment(
    config: ConfluenceConfig,
    attachmentId: string
  ): Promise<Document> {
    await this.ensureAuthenticated(config);

    const { baseUrl } = config;
    const apiUrl = `${baseUrl}/rest/api/content/${attachmentId}?expand=version,history`;

    // Get attachment metadata
    const attachment = await this.callConfluenceAPI(apiUrl);

    // Download attachment content
    const downloadUrl = `${baseUrl}${attachment._links?.download}`;
    const content = await this.downloadFile(downloadUrl);

    return {
      id: attachmentId,
      title: attachment.title,
      content,
      metadata: this.parseMetadata(attachment),
      source: 'CONFLUENCE',
    };
  }

  /**
   * Sync pages with incremental update support
   */
  async syncPages(
    config: ConfluenceConfig,
    lastSyncTime?: Date
  ): Promise<IngestionResult> {
    try {
      await this.authenticate(config);

      // List pages modified since last sync
      const pages = await this.listPages(config);
      const pagesToSync = lastSyncTime
        ? pages.filter((page) => page.modifiedDate > lastSyncTime)
        : pages;

      const processedDocs: Document[] = [];
      const errors: string[] = [];

      // Download and process each page
      for (const page of pagesToSync) {
        try {
          const fullDoc = await this.getPageContent(config, page.id);
          processedDocs.push(fullDoc);

          // Download attachments if present
          if (page.hasAttachments) {
            // Placeholder for attachment handling
          }
        } catch (error) {
          errors.push(
            `Failed to download ${page.title}: ${error instanceof Error ? error.message : String(error)}`
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
   * Authenticate using Basic Auth
   */
  private async authenticateBasic(
    credentials: Record<string, string>
  ): Promise<void> {
    const { username, password } = credentials;

    if (!username || !password) {
      throw new Error('Basic authentication requires username and password');
    }

    const encoded = Buffer.from(`${username}:${password}`).toString('base64');
    this.authHeader = `Basic ${encoded}`;
  }

  /**
   * Authenticate using OAuth
   */
  private async authenticateOAuth(
    credentials: Record<string, string>
  ): Promise<void> {
    const { accessToken } = credentials;

    if (!accessToken) {
      throw new Error('OAuth authentication requires accessToken');
    }

    this.authHeader = `Bearer ${accessToken}`;
  }

  /**
   * Authenticate using Personal Access Token
   */
  private async authenticatePAT(
    credentials: Record<string, string>
  ): Promise<void> {
    const { token } = credentials;

    if (!token) {
      throw new Error('PAT authentication requires token');
    }

    this.authHeader = `Bearer ${token}`;
  }

  /**
   * Ensure authentication is valid
   */
  private async ensureAuthenticated(config: ConfluenceConfig): Promise<void> {
    if (!this.authHeader) {
      await this.authenticate(config);
    }
  }

  /**
   * Call Confluence REST API
   */
  private async callConfluenceAPI(url: string): Promise<any> {
    // Placeholder for actual API call
    return {
      results: [],
    };
  }

  /**
   * Download file content
   */
  private async downloadFile(url: string): Promise<string> {
    // Placeholder for actual file download
    return 'Attachment content placeholder';
  }

  /**
   * Extract text from Confluence HTML storage format
   */
  private extractTextFromHTML(html: string): string {
    // Simple HTML tag removal (in real implementation, use proper HTML parser)
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Parse Confluence metadata to Document metadata
   */
  private parseMetadata(confluencePage: any): DocumentMetadata {
    return {
      author: confluencePage.version?.by?.displayName,
      createdDate: confluencePage.history?.createdDate
        ? new Date(confluencePage.history.createdDate)
        : undefined,
      modifiedDate: confluencePage.version?.when
        ? new Date(confluencePage.version.when)
        : undefined,
      tags: confluencePage.metadata?.labels?.results?.map((l: any) => l.name) || [],
      category: confluencePage.type,
      customFields: {
        spaceKey: confluencePage.space?.key,
        version: confluencePage.version?.number,
      },
    };
  }

  /**
   * Check if title matches include/exclude patterns
   */
  private matchesPatterns(
    title: string,
    includePatterns?: string[],
    excludePatterns?: string[]
  ): boolean {
    if (!includePatterns && !excludePatterns) {
      return true;
    }

    if (excludePatterns) {
      for (const pattern of excludePatterns) {
        if (this.matchesPattern(title, pattern)) {
          return false;
        }
      }
    }

    if (includePatterns) {
      for (const pattern of includePatterns) {
        if (this.matchesPattern(title, pattern)) {
          return true;
        }
      }
      return false;
    }

    return true;
  }

  /**
   * Simple pattern matching (supports * wildcard)
   */
  private matchesPattern(text: string, pattern: string): boolean {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
      'i'
    );
    return regex.test(text);
  }
}
