import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgePrioritizer } from '../../src/knowledge/KnowledgePrioritizer';
import { KnowledgeSearchResult } from '../../src/types';

describe('KnowledgePrioritizer', () => {
  let prioritizer: KnowledgePrioritizer;

  beforeEach(() => {
    prioritizer = new KnowledgePrioritizer();
  });

  describe('prioritizeResults', () => {
    it('should prioritize custom knowledge over generic', () => {
      const results: KnowledgeSearchResult[] = [
        {
          documentId: 'generic-1',
          title: 'Generic Genomics Guide',
          snippet: 'General information',
          relevanceScore: 0.8,
          namespace: '/base/genomics/',
          source: 'GENERIC_GENOMICS',
        },
        {
          documentId: 'custom-1',
          title: 'Our Team Runbook',
          snippet: 'Organization-specific guide',
          relevanceScore: 0.7,
          namespace: '/org/runbooks/',
          source: 'SHAREPOINT',
        },
      ];

      const customNamespaces = ['/org/'];
      const prioritized = prioritizer.prioritizeResults(results, customNamespaces);

      // Custom knowledge should be first despite lower base relevance
      expect(prioritized[0].documentId).toBe('custom-1');
      expect(prioritized[0].priorityScore).toBeGreaterThan(
        prioritized[1].priorityScore
      );
    });

    it('should boost historical troubleshooting data', () => {
      const results: KnowledgeSearchResult[] = [
        {
          documentId: 'doc-1',
          title: 'Regular Document',
          snippet: 'Content',
          relevanceScore: 0.5,
          namespace: '/org/docs/',
          source: 'FILE_SYSTEM',
        },
        {
          documentId: 'historical-1',
          title: 'Past Troubleshooting Case',
          snippet: 'Historical resolution',
          relevanceScore: 0.5,
          namespace: '/org/history/',
          source: 'HISTORICAL_LOGS',
        },
      ];

      const customNamespaces = ['/org/'];
      const prioritized = prioritizer.prioritizeResults(results, customNamespaces);

      // Historical data should get extra boost (1.5 * 1.4 * 1.2 vs 1.5 * 1.2)
      expect(prioritized[0].documentId).toBe('historical-1');
      expect(prioritized[0].priorityScore).toBeGreaterThan(
        prioritized[1].priorityScore
      );
    });
  });

  describe('calculatePriorityScore', () => {
    it('should boost custom knowledge', () => {
      const result: KnowledgeSearchResult = {
        documentId: 'custom-1',
        title: 'Custom Doc',
        snippet: 'Content',
        relevanceScore: 0.6,
        namespace: '/org/runbooks/',
        source: 'SHAREPOINT',
      };

      const customNamespaces = ['/org/'];
      const score = prioritizer.calculatePriorityScore(result, customNamespaces);

      expect(score).toBeGreaterThan(0.6);
    });

    it('should not boost generic knowledge', () => {
      const result: KnowledgeSearchResult = {
        documentId: 'generic-1',
        title: 'Generic Doc',
        snippet: 'Content',
        relevanceScore: 0.6,
        namespace: '/base/genomics/',
        source: 'GENERIC_GENOMICS',
      };

      const customNamespaces = ['/org/'];
      const score = prioritizer.calculatePriorityScore(result, customNamespaces);

      expect(score).toBe(0.6); // No boost
    });

    it('should cap score at 1.0', () => {
      const result: KnowledgeSearchResult = {
        documentId: 'custom-1',
        title: 'Custom Doc',
        snippet: 'Content',
        relevanceScore: 0.9,
        namespace: '/org/runbooks/',
        source: 'HISTORICAL_LOGS',
      };

      const customNamespaces = ['/org/'];
      const score = prioritizer.calculatePriorityScore(result, customNamespaces);

      expect(score).toBeLessThanOrEqual(1.0);
    });
  });

  describe('boostCustomKnowledge', () => {
    it('should boost non-generic sources', () => {
      const results: KnowledgeSearchResult[] = [
        {
          documentId: 'custom-1',
          title: 'Custom Doc',
          snippet: 'Content',
          relevanceScore: 0.6,
          namespace: '/org/docs/',
          source: 'SHAREPOINT',
        },
      ];

      const boosted = prioritizer.boostCustomKnowledge(results, 1.5);

      expect(boosted[0].relevanceScore).toBeGreaterThan(0.6);
    });

    it('should not boost generic sources', () => {
      const results: KnowledgeSearchResult[] = [
        {
          documentId: 'generic-1',
          title: 'Generic Doc',
          snippet: 'Content',
          relevanceScore: 0.6,
          namespace: '/base/genomics/',
          source: 'GENERIC_GENOMICS',
        },
      ];

      const boosted = prioritizer.boostCustomKnowledge(results, 1.5);

      expect(boosted[0].relevanceScore).toBe(0.6); // No boost
    });
  });
});
