import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgeBaseMetricsTracker } from '../../src/knowledge/KnowledgeBaseMetricsTracker';

describe('KnowledgeBaseMetricsTracker', () => {
  let tracker: KnowledgeBaseMetricsTracker;

  beforeEach(() => {
    tracker = new KnowledgeBaseMetricsTracker();
  });

  describe('recordQuery', () => {
    it('should track total queries', () => {
      tracker.recordQuery('test query 1', false);
      tracker.recordQuery('test query 2', true);

      const metrics = tracker.getQueryMetrics();
      expect(metrics.totalQueries).toBe(2);
      expect(metrics.queriesUsingCustomKnowledge).toBe(1);
    });

    it('should calculate custom knowledge usage rate', () => {
      tracker.recordQuery('query 1', true);
      tracker.recordQuery('query 2', true);
      tracker.recordQuery('query 3', false);

      const metrics = tracker.getQueryMetrics();
      expect(metrics.customKnowledgeUsageRate).toBeCloseTo(66.67, 1);
    });
  });

  describe('recordSearchResult', () => {
    it('should track search result metrics', () => {
      tracker.recordSearchResult('query 1', 5, 0.8);
      tracker.recordSearchResult('query 2', 3, 0.6);

      const metrics = tracker.getQueryMetrics();
      expect(metrics.averageResultCount).toBe(4);
      expect(metrics.averageRelevanceScore).toBe(0.7);
    });
  });

  describe('recordSourceRelevance', () => {
    it('should track relevance by source', () => {
      tracker.recordSourceRelevance('SHAREPOINT', 0.9);
      tracker.recordSourceRelevance('SHAREPOINT', 0.7);
      tracker.recordSourceRelevance('CONFLUENCE', 0.5);

      const metrics = tracker.getSourceMetrics();
      expect(metrics.relevanceBySource['SHAREPOINT'].queryCount).toBe(2);
      expect(metrics.relevanceBySource['SHAREPOINT'].averageRelevance).toBe(0.8);
      expect(metrics.mostRelevantSource).toBe('SHAREPOINT');
      expect(metrics.leastRelevantSource).toBe('CONFLUENCE');
    });
  });

  describe('recordIndexingPerformance', () => {
    it('should track indexing performance', () => {
      tracker.recordIndexingPerformance('source-1', 100, 5000); // 100 docs in 5 seconds
      tracker.recordIndexingPerformance('source-1', 50, 2500); // 50 docs in 2.5 seconds

      const metrics = tracker.getIndexingMetrics();
      expect(metrics.indexingBySource['source-1'].documentsProcessed).toBe(150);
      expect(metrics.indexingBySource['source-1'].averageSpeed).toBeCloseTo(20, 0); // 20 docs/sec
      expect(metrics.totalDocumentsIndexed).toBe(150);
    });
  });

  describe('resetMetrics', () => {
    it('should reset all metrics', () => {
      tracker.recordQuery('query', true);
      tracker.recordSourceRelevance('SHAREPOINT', 0.8);
      tracker.recordIndexingPerformance('source-1', 100, 5000);

      tracker.resetMetrics();

      const queryMetrics = tracker.getQueryMetrics();
      const sourceMetrics = tracker.getSourceMetrics();
      const indexingMetrics = tracker.getIndexingMetrics();

      expect(queryMetrics.totalQueries).toBe(0);
      expect(Object.keys(sourceMetrics.relevanceBySource)).toHaveLength(0);
      expect(indexingMetrics.totalDocumentsIndexed).toBe(0);
    });
  });
});
