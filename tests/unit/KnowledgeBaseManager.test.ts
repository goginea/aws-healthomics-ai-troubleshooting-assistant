import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgeBaseManager } from '../../src/knowledge/KnowledgeBaseManager';
import {
  KnowledgeSource,
  KnowledgeSourceType,
  Document,
} from '../../src/types';

describe('KnowledgeBaseManager', () => {
  let manager: KnowledgeBaseManager;

  beforeEach(() => {
    manager = new KnowledgeBaseManager();
  });

  describe('addKnowledgeSource', () => {
    it('should add a new knowledge source successfully', async () => {
      const source: KnowledgeSource = {
        id: 'test-source-1',
        name: 'Test Runbooks',
        type: KnowledgeSourceType.FILE_SYSTEM,
        namespace: '/org/runbooks/',
        configuration: {
          fileSystem: {
            basePath: '/path/to/runbooks',
            fileExtensions: ['.md', '.txt'],
            recursive: true,
          },
        },
        status: 'ACTIVE',
        lastUpdated: new Date(),
        documentCount: 0,
      };

      const result = await manager.addKnowledgeSource(source);

      expect(result.sourceId).toBe('test-source-1');
      expect(result.status).toBe('SUCCESS');
      expect(result.message).toContain('Test Runbooks');
    });

    it('should reject duplicate knowledge source IDs', async () => {
      const source: KnowledgeSource = {
        id: 'duplicate-id',
        name: 'Source 1',
        type: KnowledgeSourceType.S3_BUCKET,
        namespace: '/org/docs/',
        configuration: {},
        status: 'ACTIVE',
        lastUpdated: new Date(),
        documentCount: 0,
      };

      await manager.addKnowledgeSource(source);

      await expect(manager.addKnowledgeSource(source)).rejects.toThrow(
        'already exists'
      );
    });

    it('should reject invalid knowledge sources', async () => {
      const invalidSource = {
        id: '',
        name: '',
        type: KnowledgeSourceType.CONFLUENCE,
      } as KnowledgeSource;

      await expect(manager.addKnowledgeSource(invalidSource)).rejects.toThrow(
        'Invalid knowledge source'
      );
    });
  });

  describe('updateKnowledgeSource', () => {
    it('should update an existing knowledge source', async () => {
      const source: KnowledgeSource = {
        id: 'update-test',
        name: 'Original Name',
        type: KnowledgeSourceType.CONFLUENCE,
        namespace: '/org/wiki/',
        configuration: {},
        status: 'ACTIVE',
        lastUpdated: new Date(),
        documentCount: 0,
      };

      await manager.addKnowledgeSource(source);
      await manager.updateKnowledgeSource('update-test', {
        name: 'Updated Name',
      });

      const sources = await manager.listKnowledgeSources();
      const updated = sources.find((s) => s.id === 'update-test');

      expect(updated?.name).toBe('Updated Name');
    });

    it('should throw error for non-existent source', async () => {
      await expect(
        manager.updateKnowledgeSource('non-existent', { name: 'New Name' })
      ).rejects.toThrow('not found');
    });
  });

  describe('removeKnowledgeSource', () => {
    it('should remove an existing knowledge source', async () => {
      const source: KnowledgeSource = {
        id: 'remove-test',
        name: 'To Be Removed',
        type: KnowledgeSourceType.WIKI,
        namespace: '/org/temp/',
        configuration: {},
        status: 'ACTIVE',
        lastUpdated: new Date(),
        documentCount: 0,
      };

      await manager.addKnowledgeSource(source);
      await manager.removeKnowledgeSource('remove-test');

      const sources = await manager.listKnowledgeSources();
      expect(sources.find((s) => s.id === 'remove-test')).toBeUndefined();
    });

    it('should throw error for non-existent source', async () => {
      await expect(
        manager.removeKnowledgeSource('non-existent')
      ).rejects.toThrow('not found');
    });
  });

  describe('listKnowledgeSources', () => {
    it('should return empty array when no sources exist', async () => {
      const sources = await manager.listKnowledgeSources();
      expect(sources).toEqual([]);
    });

    it('should return all added knowledge sources', async () => {
      const source1: KnowledgeSource = {
        id: 'source-1',
        name: 'Source 1',
        type: KnowledgeSourceType.FILE_SYSTEM,
        namespace: '/org/docs/',
        configuration: {},
        status: 'ACTIVE',
        lastUpdated: new Date(),
        documentCount: 0,
      };

      const source2: KnowledgeSource = {
        id: 'source-2',
        name: 'Source 2',
        type: KnowledgeSourceType.S3_BUCKET,
        namespace: '/org/logs/',
        configuration: {},
        status: 'ACTIVE',
        lastUpdated: new Date(),
        documentCount: 0,
      };

      await manager.addKnowledgeSource(source1);
      await manager.addKnowledgeSource(source2);

      const sources = await manager.listKnowledgeSources();
      expect(sources).toHaveLength(2);
      expect(sources.map((s) => s.id)).toContain('source-1');
      expect(sources.map((s) => s.id)).toContain('source-2');
    });
  });

  describe('ingestDocuments', () => {
    it('should ingest documents successfully', async () => {
      const source: KnowledgeSource = {
        id: 'ingest-test',
        name: 'Test Source',
        type: KnowledgeSourceType.FILE_SYSTEM,
        namespace: '/org/docs/',
        configuration: {},
        status: 'ACTIVE',
        lastUpdated: new Date(),
        documentCount: 0,
      };

      await manager.addKnowledgeSource(source);

      const documents: Document[] = [
        {
          id: 'doc-1',
          title: 'Troubleshooting Guide',
          content: 'Content here',
          metadata: {},
          source: 'ingest-test',
        },
        {
          id: 'doc-2',
          title: 'Best Practices',
          content: 'More content',
          metadata: {},
          source: 'ingest-test',
        },
      ];

      const result = await manager.ingestDocuments('ingest-test', documents);

      expect(result.success).toBe(true);
      expect(result.documentsProcessed).toBe(2);
      expect(result.documentsFailed).toBe(0);

      const sources = await manager.listKnowledgeSources();
      const updated = sources.find((s) => s.id === 'ingest-test');
      expect(updated?.documentCount).toBe(2);
    });

    it('should throw error for non-existent source', async () => {
      await expect(
        manager.ingestDocuments('non-existent', [])
      ).rejects.toThrow('not found');
    });
  });

  describe('validateKnowledgeBase', () => {
    it('should return valid when no failed sources', async () => {
      const source: KnowledgeSource = {
        id: 'valid-source',
        name: 'Valid Source',
        type: KnowledgeSourceType.S3_BUCKET,
        namespace: '/org/docs/',
        configuration: {},
        status: 'ACTIVE',
        lastUpdated: new Date(),
        documentCount: 10,
      };

      await manager.addKnowledgeSource(source);

      const result = await manager.validateKnowledgeBase();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid when sources are in FAILED state', async () => {
      const source: KnowledgeSource = {
        id: 'failed-source',
        name: 'Failed Source',
        type: KnowledgeSourceType.SHAREPOINT,
        namespace: '/org/docs/',
        configuration: {},
        status: 'FAILED',
        lastUpdated: new Date(),
        documentCount: 0,
      };

      await manager.addKnowledgeSource(source);

      const result = await manager.validateKnowledgeBase();
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getKnowledgeBaseMetrics', () => {
    it('should return correct metrics', async () => {
      const source1: KnowledgeSource = {
        id: 'metrics-1',
        name: 'Runbooks',
        type: KnowledgeSourceType.FILE_SYSTEM,
        namespace: '/org/runbooks/',
        configuration: {},
        status: 'ACTIVE',
        lastUpdated: new Date(),
        documentCount: 15,
      };

      const source2: KnowledgeSource = {
        id: 'metrics-2',
        name: 'Historical Data',
        type: KnowledgeSourceType.HISTORICAL_LOGS,
        namespace: '/org/history/',
        configuration: {},
        status: 'ACTIVE',
        lastUpdated: new Date(),
        documentCount: 25,
      };

      await manager.addKnowledgeSource(source1);
      await manager.addKnowledgeSource(source2);

      const metrics = await manager.getKnowledgeBaseMetrics();

      expect(metrics.totalDocuments).toBe(40);
      expect(metrics.documentsBySource['Runbooks']).toBe(15);
      expect(metrics.documentsBySource['Historical Data']).toBe(25);
      expect(metrics.documentsByNamespace['/org/runbooks/']).toBe(15);
      expect(metrics.documentsByNamespace['/org/history/']).toBe(25);
    });
  });

  describe('configureSemanticExtraction', () => {
    it('should update semantic extraction configuration', async () => {
      const config = {
        enabled: true,
        extractionModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        chunkSize: 2000,
        chunkOverlap: 400,
        embeddingModel: 'amazon.titan-embed-text-v2:0',
      };

      await manager.configureSemanticExtraction(config);

      const currentConfig = manager.getSemanticConfig();
      expect(currentConfig?.chunkSize).toBe(2000);
      expect(currentConfig?.chunkOverlap).toBe(400);
    });
  });
});
