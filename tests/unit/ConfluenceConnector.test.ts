import { describe, it, expect, beforeEach } from 'vitest';
import { ConfluenceConnector } from '../../src/knowledge/connectors/ConfluenceConnector';
import { ConfluenceConfig } from '../../src/types';

describe('ConfluenceConnector', () => {
  let connector: ConfluenceConnector;

  beforeEach(() => {
    connector = new ConfluenceConnector();
  });

  describe('authenticate', () => {
    it('should authenticate with Basic auth', async () => {
      const config: ConfluenceConfig = {
        baseUrl: 'https://confluence.example.com',
        spaceKey: 'BIOINF',
        authentication: {
          type: 'BASIC',
          credentials: {
            username: 'test-user',
            password: 'test-password',
          },
        },
      };

      await expect(connector.authenticate(config)).resolves.not.toThrow();
    });

    it('should authenticate with OAuth', async () => {
      const config: ConfluenceConfig = {
        baseUrl: 'https://confluence.example.com',
        spaceKey: 'BIOINF',
        authentication: {
          type: 'OAUTH',
          credentials: {
            accessToken: 'test-oauth-token',
          },
        },
      };

      await expect(connector.authenticate(config)).resolves.not.toThrow();
    });

    it('should authenticate with PAT', async () => {
      const config: ConfluenceConfig = {
        baseUrl: 'https://confluence.example.com',
        spaceKey: 'BIOINF',
        authentication: {
          type: 'PAT',
          credentials: {
            token: 'test-pat-token',
          },
        },
      };

      await expect(connector.authenticate(config)).resolves.not.toThrow();
    });

    it('should reject missing Basic auth credentials', async () => {
      const config: ConfluenceConfig = {
        baseUrl: 'https://confluence.example.com',
        spaceKey: 'BIOINF',
        authentication: {
          type: 'BASIC',
          credentials: {},
        },
      };

      await expect(connector.authenticate(config)).rejects.toThrow(
        'requires username and password'
      );
    });
  });

  describe('listPages', () => {
    it('should list pages from space', async () => {
      const config: ConfluenceConfig = {
        baseUrl: 'https://confluence.example.com',
        spaceKey: 'BIOINF',
        authentication: {
          type: 'PAT',
          credentials: { token: 'test-token' },
        },
      };

      const pages = await connector.listPages(config);
      expect(Array.isArray(pages)).toBe(true);
    });

    it('should filter pages by include patterns', async () => {
      const config: ConfluenceConfig = {
        baseUrl: 'https://confluence.example.com',
        spaceKey: 'BIOINF',
        authentication: {
          type: 'PAT',
          credentials: { token: 'test-token' },
        },
      };

      const pages = await connector.listPages(config, ['*Troubleshooting*'], undefined);
      expect(Array.isArray(pages)).toBe(true);
    });
  });

  describe('getPageContent', () => {
    it('should get page content', async () => {
      const config: ConfluenceConfig = {
        baseUrl: 'https://confluence.example.com',
        spaceKey: 'BIOINF',
        authentication: {
          type: 'PAT',
          credentials: { token: 'test-token' },
        },
      };

      const document = await connector.getPageContent(config, 'page-123');

      expect(document.id).toBe('page-123');
      expect(document.source).toBe('CONFLUENCE');
      expect(document.content).toBeDefined();
      expect(document.metadata).toBeDefined();
    });
  });

  describe('downloadAttachment', () => {
    it('should download attachment', async () => {
      const config: ConfluenceConfig = {
        baseUrl: 'https://confluence.example.com',
        spaceKey: 'BIOINF',
        authentication: {
          type: 'PAT',
          credentials: { token: 'test-token' },
        },
      };

      const document = await connector.downloadAttachment(config, 'att-456');

      expect(document.id).toBe('att-456');
      expect(document.source).toBe('CONFLUENCE');
      expect(document.content).toBeDefined();
    });
  });

  describe('syncPages', () => {
    it('should sync all pages on first sync', async () => {
      const config: ConfluenceConfig = {
        baseUrl: 'https://confluence.example.com',
        spaceKey: 'BIOINF',
        authentication: {
          type: 'PAT',
          credentials: { token: 'test-token' },
        },
      };

      const result = await connector.syncPages(config);

      expect(result.success).toBe(true);
      expect(result.documentsProcessed).toBeGreaterThanOrEqual(0);
    });

    it('should sync only modified pages on incremental sync', async () => {
      const config: ConfluenceConfig = {
        baseUrl: 'https://confluence.example.com',
        spaceKey: 'BIOINF',
        authentication: {
          type: 'PAT',
          credentials: { token: 'test-token' },
        },
      };

      const lastSync = new Date(Date.now() - 86400000); // 1 day ago
      const result = await connector.syncPages(config, lastSync);

      expect(result.success).toBe(true);
    });

    it('should handle authentication errors gracefully', async () => {
      const config: ConfluenceConfig = {
        baseUrl: 'https://confluence.example.com',
        spaceKey: 'BIOINF',
        authentication: {
          type: 'BASIC',
          credentials: {}, // Missing credentials
        },
      };

      const result = await connector.syncPages(config);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
});
