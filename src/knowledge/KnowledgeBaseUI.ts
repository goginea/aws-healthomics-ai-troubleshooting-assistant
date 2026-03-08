/**
 * Knowledge Base Management UI
 *
 * Provides interface for managing knowledge sources, viewing status, and testing search
 */

import {
  KnowledgeSource,
  KnowledgeSourceType,
  KnowledgeBaseMetrics,
  KnowledgeSearchResult,
} from '../types';
import { IKnowledgeBaseManager } from './KnowledgeBaseManager';

export interface IKnowledgeBaseUI {
  // Source management
  displaySources(sources: KnowledgeSource[]): string;
  displaySourceDetails(source: KnowledgeSource): string;
  promptAddSource(): Promise<KnowledgeSource>;
  confirmRemoveSource(sourceId: string): Promise<boolean>;

  // Status and metrics
  displayIndexingStatus(sources: KnowledgeSource[]): string;
  displayMetrics(metrics: KnowledgeBaseMetrics): string;

  // Search interface
  displaySearchResults(results: KnowledgeSearchResult[]): string;
  promptSearch(): Promise<string>;
}

/**
 * Knowledge base UI implementation
 */
export class KnowledgeBaseUI implements IKnowledgeBaseUI {
  constructor(private manager: IKnowledgeBaseManager) {}

  /**
   * Display list of knowledge sources
   */
  displaySources(sources: KnowledgeSource[]): string {
    if (sources.length === 0) {
      return 'No knowledge sources configured.';
    }

    let output = '# Knowledge Sources\n\n';
    for (const source of sources) {
      const statusIcon = this.getStatusIcon(source.status);
      output += `${statusIcon} **${source.name}** (${source.type})\n`;
      output += `  - Namespace: ${source.namespace}\n`;
      output += `  - Documents: ${source.documentCount}\n`;
      output += `  - Last Updated: ${source.lastUpdated.toLocaleString()}\n\n`;
    }

    return output;
  }

  /**
   * Display detailed information for a source
   */
  displaySourceDetails(source: KnowledgeSource): string {
    let output = `# ${source.name}\n\n`;
    output += `**Type**: ${source.type}\n`;
    output += `**Status**: ${source.status}\n`;
    output += `**Namespace**: ${source.namespace}\n`;
    output += `**Documents**: ${source.documentCount}\n`;
    output += `**Last Updated**: ${source.lastUpdated.toLocaleString()}\n\n`;

    output += '## Configuration\n\n';
    output += '```json\n';
    output += JSON.stringify(source.configuration, null, 2);
    output += '\n```\n';

    return output;
  }

  /**
   * Prompt user to add a new source (placeholder)
   */
  async promptAddSource(): Promise<KnowledgeSource> {
    // In real implementation, would show interactive form
    throw new Error('Interactive UI not implemented - use API directly');
  }

  /**
   * Confirm source removal (placeholder)
   */
  async confirmRemoveSource(sourceId: string): Promise<boolean> {
    // In real implementation, would show confirmation dialog
    return true;
  }

  /**
   * Display indexing status for all sources
   */
  displayIndexingStatus(sources: KnowledgeSource[]): string {
    const indexing = sources.filter((s) => s.status === 'INDEXING');
    const failed = sources.filter((s) => s.status === 'FAILED');
    const active = sources.filter((s) => s.status === 'ACTIVE');

    let output = '# Indexing Status\n\n';
    output += `✅ Active: ${active.length}\n`;
    output += `⏳ Indexing: ${indexing.length}\n`;
    output += `❌ Failed: ${failed.length}\n\n`;

    if (indexing.length > 0) {
      output += '## Currently Indexing\n\n';
      for (const source of indexing) {
        output += `- ${source.name}\n`;
      }
      output += '\n';
    }

    if (failed.length > 0) {
      output += '## Failed Sources\n\n';
      for (const source of failed) {
        output += `- ${source.name}\n`;
      }
      output += '\n';
    }

    return output;
  }

  /**
   * Display knowledge base metrics
   */
  displayMetrics(metrics: KnowledgeBaseMetrics): string {
    let output = '# Knowledge Base Metrics\n\n';
    output += `**Total Documents**: ${metrics.totalDocuments}\n`;
    output += `**Last Indexing**: ${metrics.lastIndexingTime.toLocaleString()}\n`;
    output += `**Queries Using Custom Knowledge**: ${metrics.queriesUsingCustomKnowledge}\n`;
    output += `**Average Relevance Score**: ${metrics.averageRelevanceScore.toFixed(2)}\n\n`;

    output += '## Documents by Source\n\n';
    for (const [source, count] of Object.entries(metrics.documentsBySource)) {
      output += `- ${source}: ${count}\n`;
    }
    output += '\n';

    output += '## Documents by Namespace\n\n';
    for (const [namespace, count] of Object.entries(metrics.documentsByNamespace)) {
      output += `- ${namespace}: ${count}\n`;
    }

    return output;
  }

  /**
   * Display search results
   */
  displaySearchResults(results: KnowledgeSearchResult[]): string {
    if (results.length === 0) {
      return 'No results found.';
    }

    let output = `# Search Results (${results.length})\n\n`;
    for (const result of results) {
      output += `## ${result.title}\n\n`;
      output += `**Source**: ${result.source} (${result.namespace})\n`;
      output += `**Relevance**: ${(result.relevanceScore * 100).toFixed(0)}%\n\n`;
      output += `${result.snippet}\n\n`;
      output += '---\n\n';
    }

    return output;
  }

  /**
   * Prompt user for search query (placeholder)
   */
  async promptSearch(): Promise<string> {
    // In real implementation, would show search input
    throw new Error('Interactive UI not implemented - use API directly');
  }

  /**
   * Get status icon for source status
   */
  private getStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return '✅';
      case 'INDEXING':
        return '⏳';
      case 'FAILED':
        return '❌';
      case 'DISABLED':
        return '⏸️';
      default:
        return '❓';
    }
  }
}
