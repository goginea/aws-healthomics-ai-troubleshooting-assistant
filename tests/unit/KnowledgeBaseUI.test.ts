import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KnowledgeBaseUI } from '../../src/knowledge/KnowledgeBaseUI';
import { KnowledgeBaseManager } from '../../src/knowledge/KnowledgeBaseManager';
import {
  KnowledgeSource,
  KnowledgeSourceType,
  KnowledgeBaseMetrics,
  KnowledgeSearchResult,
} from '../../src/types';

describe('KnowledgeBaseUI', () => {
  let ui: KnowledgeBaseUI;
  let manager: KnowledgeBaseManager;

  beforeEach(() => {
    manager = new KnowledgeBaseManager();
    ui = new KnowledgeBaseUI(manager);
  });

  describe('displaySources', () => {
    it('should display empty message when no sources', () => {
      const output = ui.displaySources([]);
      expect(output).toContain('No knowledge sources');
    });

    it('should display list of sources', () => {
      const sources: KnowledgeSource[] = [
        {
          id: 'source-1',
          name: 'Runbooks',
          type: KnowledgeSourceType.FILE_SYSTEM,
          namespace: '/org/runbooks/',
          configuration: {},
          status: 'ACTIVE',
          lastUpdated: new Date(),
          documentCount: 10,
        },
      ];

      const output = ui.displaySources(sources);
      expect(output).toContain('Runbooks');
      expect(output).toContain('FILE_SYSTEM');
      expect(output).toContain('10');
    });
  });

  describe('displaySourceDetails', () => {
    it('should display detailed source information', () => {
      const source: KnowledgeSource = {
        id: 'source-1',
        name: 'Runbooks',
        type: KnowledgeSourceType.SHAREPOINT,
        namespace: '/org/runbooks/',
        configuration: {
          sharePoint: {
            siteUrl: 'https://contoso.sharepoint.com',
            libraryName: 'Documents',
            authentication: {
              type: 'OAUTH',
              credentials: {},
            },
          },
        },
        status: 'ACTIVE',
        lastUpdated: new Date(),
        documentCount: 25,
      };

      const output = ui.displaySourceDetails(source);
      expect(output).toContain('Runbooks');
      expect(output).toContain('SHAREPOINT');
      expect(output).toContain('25');
      expect(output).toContain('Configuration');
    });
  });

  describe('displayIndexingStatus', () => {
    it('should display status summary', () => {
      const sources: KnowledgeSource[] = [
        {
          id: 'source-1',
          name: 'Active Source',
          type: KnowledgeSourceType.FILE_SYSTEM,
          namespace: '/org/docs/',
          configuration: {},
          status: 'ACTIVE',
          lastUpdated: new Date(),
          documentCount: 10,
        },
        {
          id: 'source-2',
          name: 'Indexing Source',
          type: KnowledgeSourceType.S3_BUCKET,
          namespace: '/org/logs/',
          configuration: {},
          status: 'INDEXING',
          lastUpdated: new Date(),
          documentCount: 0,
        },
      ];

      const output = ui.displayIndexingStatus(sources);
      expect(output).toContain('Active: 1');
      expect(output).toContain('Indexing: 1');
    });
  });

  describe('displayMetrics', () => {
    it('should display knowledge base metrics', () => {
      const metrics: KnowledgeBaseMetrics = {
        totalDocuments: 50,
        documentsBySource: {
          Runbooks: 25,
          'Historical Data': 25,
        },
        documentsByNamespace: {
          '/org/runbooks/': 25,
          '/org/history/': 25,
        },
        lastIndexingTime: new Date(),
        queriesUsingCustomKnowledge: 100,
        averageRelevanceScore: 0.85,
      };

      const output = ui.displayMetrics(metrics);
      expect(output).toContain('50');
      expect(output).toContain('Runbooks: 25');
      expect(output).toContain('0.85');
    });
  });

  describe('displaySearchResults', () => {
    it('should display empty message when no results', () => {
      const output = ui.displaySearchResults([]);
      expect(output).toContain('No results found');
    });

    it('should display search results', () => {
      const results: KnowledgeSearchResult[] = [
        {
          documentId: 'doc-1',
          title: 'Memory Troubleshooting Guide',
          snippet: 'How to fix memory exhaustion...',
          relevanceScore: 0.85,
          namespace: '/org/runbooks/',
          source: 'SHAREPOINT',
        },
      ];

      const output = ui.displaySearchResults(results);
      expect(output).toContain('Memory Troubleshooting Guide');
      expect(output).toContain('85%');
      expect(output).toContain('SHAREPOINT');
    });
  });
});
