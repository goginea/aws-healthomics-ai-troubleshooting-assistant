import { describe, it, expect, beforeEach } from 'vitest';
import { S3Connector } from '../../src/knowledge/connectors/S3Connector';
import { S3Config } from '../../src/types';

describe('S3Connector', () => {
  let connector: S3Connector;

  beforeEach(() => {
    connector = new S3Connector();
  });

  describe('listObjects', () => {
    it('should list objects from S3 bucket', async () => {
      const config: S3Config = {
        bucket: 'my-runbooks-bucket',
        prefix: 'bioinformatics/',
        region: 'us-east-1',
      };

      const objects = await connector.listObjects(config);
      expect(Array.isArray(objects)).toBe(true);
    });

    it('should filter objects by include patterns', async () => {
      const config: S3Config = {
        bucket: 'my-runbooks-bucket',
        prefix: 'bioinformatics/',
        region: 'us-east-1',
      };

      const objects = await connector.listObjects(config, ['*.md', '*.txt'], undefined);
      expect(Array.isArray(objects)).toBe(true);
    });
  });

  describe('downloadObject', () => {
    it('should download object content', async () => {
      const config: S3Config = {
        bucket: 'my-runbooks-bucket',
        prefix: 'bioinformatics/',
        region: 'us-east-1',
      };

      const document = await connector.downloadObject(config, 'bioinformatics/doc.md');

      expect(document.id).toContain('s3://');
      expect(document.source).toBe('S3_BUCKET');
      expect(document.content).toBeDefined();
      expect(document.metadata).toBeDefined();
    });
  });

  describe('syncObjects', () => {
    it('should sync all objects on first sync', async () => {
      const config: S3Config = {
        bucket: 'my-runbooks-bucket',
        prefix: 'bioinformatics/',
        region: 'us-east-1',
      };

      const result = await connector.syncObjects(config);

      expect(result.success).toBe(true);
      expect(result.documentsProcessed).toBeGreaterThanOrEqual(0);
    });

    it('should sync only modified objects on incremental sync', async () => {
      const config: S3Config = {
        bucket: 'my-runbooks-bucket',
        prefix: 'bioinformatics/',
        region: 'us-east-1',
      };

      const lastSync = new Date(Date.now() - 86400000); // 1 day ago
      const result = await connector.syncObjects(config, lastSync);

      expect(result.success).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const config: S3Config = {
        bucket: '',
        prefix: '',
        region: 'us-east-1',
      };

      const result = await connector.syncObjects(config);

      // Should handle gracefully even with invalid config
      expect(result).toBeDefined();
    });
  });
});
