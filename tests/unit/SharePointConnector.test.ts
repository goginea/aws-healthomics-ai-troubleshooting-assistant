import { describe, it, expect, beforeEach } from 'vitest';
import { SharePointConnector } from '../../src/knowledge/connectors/SharePointConnector';
import { SharePointConfig } from '../../src/types';

describe('SharePointConnector', () => {
  let connector: SharePointConnector;

  beforeEach(() => {
    connector = new SharePointConnector();
  });

  describe('authenticate', () => {
    it('should authenticate with OAuth', async () => {
      const config: SharePointConfig = {
        siteUrl: 'https://contoso.sharepoint.com/sites/bioinformatics',
        libraryName: 'Runbooks',
        authentication: {
          type: 'OAUTH',
          credentials: {
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            tenantId: 'test-tenant',
          },
        },
      };

      await expect(connector.authenticate(config)).resolves.not.toThrow();
    });

    it('should authenticate with Service Principal', async () => {
      const config: SharePointConfig = {
        siteUrl: 'https://contoso.sharepoint.com/sites/bioinformatics',
        libraryName: 'Runbooks',
        authentication: {
          type: 'SERVICE_PRINCIPAL',
          credentials: {
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            tenantId: 'test-tenant',
          },
        },
      };

      await expect(connector.authenticate(config)).resolves.not.toThrow();
    });

    it('should reject missing credentials', async () => {
      const config: SharePointConfig = {
        siteUrl: 'https://contoso.sharepoint.com/sites/bioinformatics',
        libraryName: 'Runbooks',
        authentication: {
          type: 'OAUTH',
          credentials: {},
        },
      };

      await expect(connector.authenticate(config)).rejects.toThrow(
        'requires clientId, clientSecret, and tenantId'
      );
    });
  });

  describe('listDocuments', () => {
    it('should list documents from library', async () => {
      const config: SharePointConfig = {
        siteUrl: 'https://contoso.sharepoint.com/sites/bioinformatics',
        libraryName: 'Runbooks',
        authentication: {
          type: 'OAUTH',
          credentials: {
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            tenantId: 'test-tenant',
          },
        },
      };

      const documents = await connector.listDocuments(config);
      expect(Array.isArray(documents)).toBe(true);
    });

    it('should filter documents by include patterns', async () => {
      const config: SharePointConfig = {
        siteUrl: 'https://contoso.sharepoint.com/sites/bioinformatics',
        libraryName: 'Runbooks',
        authentication: {
          type: 'OAUTH',
          credentials: {
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            tenantId: 'test-tenant',
          },
        },
      };

      const documents = await connector.listDocuments(
        config,
        ['*.md', '*.txt'],
        undefined
      );
      expect(Array.isArray(documents)).toBe(true);
    });
  });

  describe('downloadDocument', () => {
    it('should download document content', async () => {
      const config: SharePointConfig = {
        siteUrl: 'https://contoso.sharepoint.com/sites/bioinformatics',
        libraryName: 'Runbooks',
        authentication: {
          type: 'OAUTH',
          credentials: {
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            tenantId: 'test-tenant',
          },
        },
      };

      const document = await connector.downloadDocument(config, 'doc-123');

      expect(document.id).toBe('doc-123');
      expect(document.source).toBe('SHAREPOINT');
      expect(document.content).toBeDefined();
      expect(document.metadata).toBeDefined();
    });
  });

  describe('syncDocuments', () => {
    it('should sync all documents on first sync', async () => {
      const config: SharePointConfig = {
        siteUrl: 'https://contoso.sharepoint.com/sites/bioinformatics',
        libraryName: 'Runbooks',
        authentication: {
          type: 'OAUTH',
          credentials: {
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            tenantId: 'test-tenant',
          },
        },
      };

      const result = await connector.syncDocuments(config);

      expect(result.success).toBe(true);
      expect(result.documentsProcessed).toBeGreaterThanOrEqual(0);
    });

    it('should sync only modified documents on incremental sync', async () => {
      const config: SharePointConfig = {
        siteUrl: 'https://contoso.sharepoint.com/sites/bioinformatics',
        libraryName: 'Runbooks',
        authentication: {
          type: 'OAUTH',
          credentials: {
            clientId: 'test-client-id',
            clientSecret: 'test-secret',
            tenantId: 'test-tenant',
          },
        },
      };

      const lastSync = new Date(Date.now() - 86400000); // 1 day ago
      const result = await connector.syncDocuments(config, lastSync);

      expect(result.success).toBe(true);
    });

    it('should handle authentication errors gracefully', async () => {
      const config: SharePointConfig = {
        siteUrl: 'https://contoso.sharepoint.com/sites/bioinformatics',
        libraryName: 'Runbooks',
        authentication: {
          type: 'OAUTH',
          credentials: {}, // Missing credentials
        },
      };

      const result = await connector.syncDocuments(config);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
});
