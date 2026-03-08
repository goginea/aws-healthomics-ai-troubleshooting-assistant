import { describe, it, expect, beforeEach } from 'vitest';
import { AgentCoreMemoryClient } from '../../src/knowledge/AgentCoreMemoryClient';
import { Document, MemoryStrategy } from '../../src/types';

describe('AgentCoreMemoryClient', () => {
  let client: AgentCoreMemoryClient;

  beforeEach(() => {
    client = new AgentCoreMemoryClient();
  });

  describe('createNamespace', () => {
    it('should create a new memory namespace', async () => {
      const strategy: MemoryStrategy = {
        type: 'SEMANTIC',
        name: 'custom-knowledge',
        namespaces: ['/org/runbooks/'],
      };

      const namespaceId = await client.createNamespace('/org/runbooks/', strategy);

      expect(namespaceId).toContain('memory-namespace');
    });

    it('should reject duplicate namespace', async () => {
      const strategy: MemoryStrategy = {
        type: 'SEMANTIC',
        name: 'custom-knowledge',
        namespaces: ['/org/runbooks/'],
      };

      await client.createNamespace('/org/runbooks/', strategy);

      await expect(
        client.createNamespace('/org/runbooks/', strategy)
      ).rejects.toThrow('already exists');
    });
  });

  describe('storeDocuments', () => {
    it('should store documents in namespace', async () => {
      const strategy: MemoryStrategy = {
        type: 'SEMANTIC',
        name: 'custom-knowledge',
        namespaces: ['/org/docs/'],
      };

      await client.createNamespace('/org/docs/', strategy);

      const documents: Document[] = [
        {
          id: 'doc-1',
          title: 'Troubleshooting Guide',
          content: 'How to fix memory issues',
          metadata: {},
          source: 'FILE_SYSTEM',
        },
      ];

      const result = await client.storeDocuments('/org/docs/', documents);

      expect(result.success).toBe(true);
      expect(result.documentsStored).toBe(1);
    });

    it('should throw error for non-existent namespace', async () => {
      const documents: Document[] = [];

      await expect(
        client.storeDocuments('/non-existent/', documents)
      ).rejects.toThrow('not found');
    });
  });

  describe('searchMemory', () => {
    it('should search across all namespaces', async () => {
      const strategy: MemoryStrategy = {
        type: 'SEMANTIC',
        name: 'custom-knowledge',
        namespaces: ['/org/docs/'],
      };

      await client.createNamespace('/org/docs/', strategy);

      const documents: Document[] = [
        {
          id: 'doc-1',
          title: 'Memory Troubleshooting',
          content: 'How to fix memory exhaustion issues in GATK workflows',
          metadata: {},
          source: 'FILE_SYSTEM',
        },
      ];

      await client.storeDocuments('/org/docs/', documents);

      const results = await client.searchMemory('memory');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].relevanceScore).toBeGreaterThan(0);
    });

    it('should limit results to maxResults', async () => {
      const strategy: MemoryStrategy = {
        type: 'SEMANTIC',
        name: 'custom-knowledge',
        namespaces: ['/org/docs/'],
      };

      await client.createNamespace('/org/docs/', strategy);

      const documents: Document[] = Array.from({ length: 20 }, (_, i) => ({
        id: `doc-${i}`,
        title: `Document ${i}`,
        content: 'memory troubleshooting content',
        metadata: {},
        source: 'FILE_SYSTEM',
      }));

      await client.storeDocuments('/org/docs/', documents);

      const results = await client.searchMemory('memory', undefined, 5);

      expect(results.length).toBeLessThanOrEqual(5);
    });
  });

  describe('configureSemanticExtraction', () => {
    it('should configure semantic extraction for namespace', async () => {
      const strategy: MemoryStrategy = {
        type: 'SEMANTIC',
        name: 'custom-knowledge',
        namespaces: ['/org/docs/'],
      };

      await client.createNamespace('/org/docs/', strategy);

      const config = {
        enabled: true,
        extractionModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        chunkSize: 2000,
        chunkOverlap: 400,
        embeddingModel: 'amazon.titan-embed-text-v2:0',
      };

      await expect(
        client.configureSemanticExtraction('/org/docs/', config)
      ).resolves.not.toThrow();
    });
  });

  describe('getMemoryStats', () => {
    it('should return memory statistics', async () => {
      const strategy: MemoryStrategy = {
        type: 'SEMANTIC',
        name: 'custom-knowledge',
        namespaces: ['/org/docs/'],
      };

      await client.createNamespace('/org/docs/', strategy);

      const documents: Document[] = [
        {
          id: 'doc-1',
          title: 'Guide',
          content: 'Content here',
          metadata: {},
          source: 'FILE_SYSTEM',
        },
      ];

      await client.storeDocuments('/org/docs/', documents);

      const stats = await client.getMemoryStats('/org/docs/');

      expect(stats.namespace).toBe('/org/docs/');
      expect(stats.documentCount).toBe(1);
      expect(stats.totalSize).toBeGreaterThan(0);
    });
  });

  describe('updateDocument', () => {
    it('should update existing document', async () => {
      const strategy: MemoryStrategy = {
        type: 'SEMANTIC',
        name: 'custom-knowledge',
        namespaces: ['/org/docs/'],
      };

      await client.createNamespace('/org/docs/', strategy);

      const documents: Document[] = [
        {
          id: 'doc-1',
          title: 'Original Title',
          content: 'Original content',
          metadata: {},
          source: 'FILE_SYSTEM',
        },
      ];

      await client.storeDocuments('/org/docs/', documents);
      await client.updateDocument('/org/docs/', 'doc-1', {
        title: 'Updated Title',
      });

      const results = await client.searchMemory('Updated Title');
      expect(results[0]?.title).toBe('Updated Title');
    });
  });

  describe('deleteDocument', () => {
    it('should delete document from namespace', async () => {
      const strategy: MemoryStrategy = {
        type: 'SEMANTIC',
        name: 'custom-knowledge',
        namespaces: ['/org/docs/'],
      };

      await client.createNamespace('/org/docs/', strategy);

      const documents: Document[] = [
        {
          id: 'doc-1',
          title: 'To Delete',
          content: 'Content',
          metadata: {},
          source: 'FILE_SYSTEM',
        },
      ];

      await client.storeDocuments('/org/docs/', documents);
      await client.deleteDocument('/org/docs/', 'doc-1');

      const stats = await client.getMemoryStats('/org/docs/');
      expect(stats.documentCount).toBe(0);
    });
  });
});
