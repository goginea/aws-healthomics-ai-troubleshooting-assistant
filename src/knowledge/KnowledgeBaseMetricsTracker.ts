/**
 * Knowledge Base Metrics Tracker
 *
 * Tracks usage metrics for knowledge base queries and relevance
 */

export interface IKnowledgeBaseMetricsTracker {
  // Query tracking
  recordQuery(query: string, usedCustomKnowledge: boolean): void;
  recordSearchResult(
    query: string,
    resultCount: number,
    averageRelevance: number
  ): void;

  // Source tracking
  recordSourceRelevance(source: string, relevanceScore: number): void;
  recordIndexingPerformance(
    sourceId: string,
    documentsProcessed: number,
    durationMs: number
  ): void;

  // Metrics retrieval
  getQueryMetrics(): QueryMetrics;
  getSourceMetrics(): SourceMetrics;
  getIndexingMetrics(): IndexingMetrics;
  resetMetrics(): void;
}

export interface QueryMetrics {
  totalQueries: number;
  queriesUsingCustomKnowledge: number;
  averageResultCount: number;
  averageRelevanceScore: number;
  customKnowledgeUsageRate: number; // Percentage
}

export interface SourceMetrics {
  relevanceBySource: Record<string, SourceRelevanceMetrics>;
  mostRelevantSource: string;
  leastRelevantSource: string;
}

export interface SourceRelevanceMetrics {
  source: string;
  queryCount: number;
  averageRelevance: number;
  totalRelevance: number;
}

export interface IndexingMetrics {
  indexingBySource: Record<string, IndexingPerformanceMetrics>;
  averageIndexingSpeed: number; // Documents per second
  totalDocumentsIndexed: number;
}

export interface IndexingPerformanceMetrics {
  sourceId: string;
  documentsProcessed: number;
  totalDurationMs: number;
  averageSpeed: number; // Documents per second
  indexingCount: number;
}

/**
 * Metrics tracker implementation
 */
export class KnowledgeBaseMetricsTracker
  implements IKnowledgeBaseMetricsTracker
{
  private queryCount = 0;
  private customKnowledgeQueryCount = 0;
  private totalResultCount = 0;
  private totalRelevanceScore = 0;
  private relevanceScoreCount = 0;

  private sourceRelevance: Map<string, SourceRelevanceMetrics> = new Map();
  private indexingPerformance: Map<string, IndexingPerformanceMetrics> =
    new Map();

  /**
   * Record a query
   */
  recordQuery(query: string, usedCustomKnowledge: boolean): void {
    this.queryCount++;
    if (usedCustomKnowledge) {
      this.customKnowledgeQueryCount++;
    }
  }

  /**
   * Record search result metrics
   */
  recordSearchResult(
    query: string,
    resultCount: number,
    averageRelevance: number
  ): void {
    this.totalResultCount += resultCount;
    this.totalRelevanceScore += averageRelevance;
    this.relevanceScoreCount++;
  }

  /**
   * Record source relevance
   */
  recordSourceRelevance(source: string, relevanceScore: number): void {
    if (!this.sourceRelevance.has(source)) {
      this.sourceRelevance.set(source, {
        source,
        queryCount: 0,
        averageRelevance: 0,
        totalRelevance: 0,
      });
    }

    const metrics = this.sourceRelevance.get(source)!;
    metrics.queryCount++;
    metrics.totalRelevance += relevanceScore;
    metrics.averageRelevance = metrics.totalRelevance / metrics.queryCount;
  }

  /**
   * Record indexing performance
   */
  recordIndexingPerformance(
    sourceId: string,
    documentsProcessed: number,
    durationMs: number
  ): void {
    if (!this.indexingPerformance.has(sourceId)) {
      this.indexingPerformance.set(sourceId, {
        sourceId,
        documentsProcessed: 0,
        totalDurationMs: 0,
        averageSpeed: 0,
        indexingCount: 0,
      });
    }

    const metrics = this.indexingPerformance.get(sourceId)!;
    metrics.documentsProcessed += documentsProcessed;
    metrics.totalDurationMs += durationMs;
    metrics.indexingCount++;
    metrics.averageSpeed =
      (metrics.documentsProcessed / metrics.totalDurationMs) * 1000; // Docs per second
  }

  /**
   * Get query metrics
   */
  getQueryMetrics(): QueryMetrics {
    return {
      totalQueries: this.queryCount,
      queriesUsingCustomKnowledge: this.customKnowledgeQueryCount,
      averageResultCount:
        this.relevanceScoreCount > 0
          ? this.totalResultCount / this.relevanceScoreCount
          : 0,
      averageRelevanceScore:
        this.relevanceScoreCount > 0
          ? this.totalRelevanceScore / this.relevanceScoreCount
          : 0,
      customKnowledgeUsageRate:
        this.queryCount > 0
          ? (this.customKnowledgeQueryCount / this.queryCount) * 100
          : 0,
    };
  }

  /**
   * Get source metrics
   */
  getSourceMetrics(): SourceMetrics {
    const relevanceBySource: Record<string, SourceRelevanceMetrics> = {};
    let mostRelevant = '';
    let leastRelevant = '';
    let maxRelevance = 0;
    let minRelevance = 1;

    for (const [source, metrics] of this.sourceRelevance) {
      relevanceBySource[source] = metrics;

      if (metrics.averageRelevance > maxRelevance) {
        maxRelevance = metrics.averageRelevance;
        mostRelevant = source;
      }

      if (metrics.averageRelevance < minRelevance) {
        minRelevance = metrics.averageRelevance;
        leastRelevant = source;
      }
    }

    return {
      relevanceBySource,
      mostRelevantSource: mostRelevant,
      leastRelevantSource: leastRelevant,
    };
  }

  /**
   * Get indexing metrics
   */
  getIndexingMetrics(): IndexingMetrics {
    const indexingBySource: Record<string, IndexingPerformanceMetrics> = {};
    let totalDocs = 0;
    let totalDuration = 0;

    for (const [sourceId, metrics] of this.indexingPerformance) {
      indexingBySource[sourceId] = metrics;
      totalDocs += metrics.documentsProcessed;
      totalDuration += metrics.totalDurationMs;
    }

    return {
      indexingBySource,
      averageIndexingSpeed:
        totalDuration > 0 ? (totalDocs / totalDuration) * 1000 : 0,
      totalDocumentsIndexed: totalDocs,
    };
  }

  /**
   * Reset all metrics
   */
  resetMetrics(): void {
    this.queryCount = 0;
    this.customKnowledgeQueryCount = 0;
    this.totalResultCount = 0;
    this.totalRelevanceScore = 0;
    this.relevanceScoreCount = 0;
    this.sourceRelevance.clear();
    this.indexingPerformance.clear();
  }
}
