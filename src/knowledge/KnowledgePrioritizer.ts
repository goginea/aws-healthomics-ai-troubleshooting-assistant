/**
 * Knowledge Prioritizer
 *
 * Implements relevance scoring that prioritizes organization-specific knowledge
 * over generic genomics knowledge
 */

import { KnowledgeSearchResult } from '../types';

export interface IKnowledgePrioritizer {
  prioritizeResults(
    results: KnowledgeSearchResult[],
    customNamespaces: string[]
  ): KnowledgeSearchResult[];
  calculatePriorityScore(
    result: KnowledgeSearchResult,
    customNamespaces: string[]
  ): number;
  boostCustomKnowledge(
    results: KnowledgeSearchResult[],
    boostFactor: number
  ): KnowledgeSearchResult[];
}

/**
 * Knowledge prioritizer implementation
 */
export class KnowledgePrioritizer implements IKnowledgePrioritizer {
  private readonly CUSTOM_KNOWLEDGE_BOOST = 1.5; // 50% boost for custom knowledge
  private readonly HISTORICAL_DATA_BOOST = 1.4; // 40% boost for historical troubleshooting

  /**
   * Prioritize search results to favor custom knowledge
   */
  prioritizeResults(
    results: KnowledgeSearchResult[],
    customNamespaces: string[]
  ): KnowledgeSearchResult[] {
    // Calculate priority scores
    const scoredResults = results.map((result) => ({
      ...result,
      priorityScore: this.calculatePriorityScore(result, customNamespaces),
    }));

    // Sort by priority score (descending)
    return scoredResults.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  /**
   * Calculate priority score for a search result
   */
  calculatePriorityScore(
    result: KnowledgeSearchResult,
    customNamespaces: string[]
  ): number {
    let score = result.relevanceScore;
    let boostMultiplier = 1.0;

    // Accumulate boost multipliers
    if (this.isCustomKnowledge(result.namespace, customNamespaces)) {
      boostMultiplier *= this.CUSTOM_KNOWLEDGE_BOOST;
    }

    if (result.source === 'HISTORICAL_LOGS') {
      boostMultiplier *= this.HISTORICAL_DATA_BOOST;
    }

    if (this.isOrganizationSpecific(result.source)) {
      boostMultiplier *= 1.2;
    }

    // Apply boost and cap at 1.0
    return Math.min(score * boostMultiplier, 1.0);
  }

  /**
   * Boost custom knowledge results by a factor
   */
  boostCustomKnowledge(
    results: KnowledgeSearchResult[],
    boostFactor: number
  ): KnowledgeSearchResult[] {
    return results.map((result) => {
      if (result.source !== 'GENERIC_GENOMICS') {
        return {
          ...result,
          relevanceScore: Math.min(result.relevanceScore * boostFactor, 1.0),
        };
      }
      return result;
    });
  }

  /**
   * Check if namespace is custom knowledge
   */
  private isCustomKnowledge(
    namespace: string,
    customNamespaces: string[]
  ): boolean {
    return customNamespaces.some((custom) => namespace.startsWith(custom));
  }

  /**
   * Check if source is organization-specific
   */
  private isOrganizationSpecific(source: string): boolean {
    const orgSources = [
      'SHAREPOINT',
      'CONFLUENCE',
      'WIKI',
      'HISTORICAL_LOGS',
      'FILE_SYSTEM',
      'S3_BUCKET',
    ];
    return orgSources.includes(source);
  }
}
