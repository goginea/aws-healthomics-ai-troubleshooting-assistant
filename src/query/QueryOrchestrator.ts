/**
 * Query Orchestrator
 *
 * Determines which Power tools to call based on query intent and coordinates execution
 */

import { ParsedQuery, QueryIntent } from './QueryParser';
import { IPowerClient, PowerToolCall } from '../orchestration/PowerClient';

export interface IQueryOrchestrator {
  orchestrate(parsedQuery: ParsedQuery): Promise<OrchestrationPlan>;
  execute(plan: OrchestrationPlan): Promise<OrchestrationResult>;
  synthesizeResponse(results: PowerToolResult[]): Promise<string>;
}

export interface OrchestrationPlan {
  queryIntent: QueryIntent;
  toolCalls: PowerToolCall[];
  executionMode: 'SEQUENTIAL' | 'PARALLEL';
  cacheKey?: string;
}

export interface PowerToolResult {
  toolName: string;
  powerName: string;
  result: any;
  executionTime: number;
  cached: boolean;
}

export interface OrchestrationResult {
  success: boolean;
  results: PowerToolResult[];
  synthesizedResponse?: string;
  errors?: string[];
}

/**
 * Query orchestrator implementation
 */
export class QueryOrchestrator implements IQueryOrchestrator {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private powerClient: IPowerClient) {}

  /**
   * Create orchestration plan based on parsed query
   */
  async orchestrate(parsedQuery: ParsedQuery): Promise<OrchestrationPlan> {
    const toolCalls: PowerToolCall[] = [];
    let executionMode: 'SEQUENTIAL' | 'PARALLEL' = 'SEQUENTIAL';

    switch (parsedQuery.intent) {
      case QueryIntent.GET_RUN_STATUS:
        toolCalls.push({
          powerName: 'aws-healthomics',
          serverName: 'aws-healthomics',
          toolName: 'GetAHORun',
          arguments: { run_id: parsedQuery.workflowRunId },
        });
        break;

      case QueryIntent.ANALYZE_FAILURE:
        // Sequential: Get run info, then diagnose failure
        toolCalls.push(
          {
            powerName: 'aws-healthomics',
            serverName: 'aws-healthomics',
            toolName: 'GetAHORun',
            arguments: { run_id: parsedQuery.workflowRunId },
          },
          {
            powerName: 'aws-healthomics',
            serverName: 'aws-healthomics',
            toolName: 'DiagnoseAHORunFailure',
            arguments: { run_id: parsedQuery.workflowRunId, detailed: true },
          }
        );
        break;

      case QueryIntent.ANALYZE_PERFORMANCE:
        toolCalls.push({
          powerName: 'aws-healthomics',
          serverName: 'aws-healthomics',
          toolName: 'AnalyzeAHORunPerformance',
          arguments: { run_id: parsedQuery.workflowRunId },
        });
        break;

      case QueryIntent.GET_TASK_DETAILS:
        toolCalls.push({
          powerName: 'aws-healthomics',
          serverName: 'aws-healthomics',
          toolName: 'ListAHORunTasks',
          arguments: { run_id: parsedQuery.workflowRunId },
        });
        break;

      case QueryIntent.LIST_RECENT_RUNS:
        toolCalls.push({
          powerName: 'aws-healthomics',
          serverName: 'aws-healthomics',
          toolName: 'ListAHORuns',
          arguments: {
            start_time: parsedQuery.timeRange?.start.toISOString(),
            end_time: parsedQuery.timeRange?.end.toISOString(),
          },
        });
        break;

      case QueryIntent.GET_RECOMMENDATIONS:
        // Sequential: Diagnose first, then get recommendations
        toolCalls.push(
          {
            powerName: 'aws-healthomics',
            serverName: 'aws-healthomics',
            toolName: 'DiagnoseAHORunFailure',
            arguments: { run_id: parsedQuery.workflowRunId, detailed: true },
          }
        );
        break;
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(parsedQuery);

    return {
      queryIntent: parsedQuery.intent,
      toolCalls,
      executionMode,
      cacheKey,
    };
  }

  /**
   * Execute orchestration plan
   */
  async execute(plan: OrchestrationPlan): Promise<OrchestrationResult> {
    // Check cache first
    if (plan.cacheKey) {
      const cached = this.getFromCache(plan.cacheKey);
      if (cached) {
        return {
          success: true,
          results: cached.results.map((r) => ({ ...r, cached: true })),
          synthesizedResponse: cached.synthesizedResponse,
        };
      }
    }

    const results: PowerToolResult[] = [];
    const errors: string[] = [];

    try {
      // Execute tool calls
      for (const toolCall of plan.toolCalls) {
        const startTime = Date.now();
        try {
          const result = await this.powerClient.callTool(toolCall);
          results.push({
            toolName: toolCall.toolName,
            powerName: toolCall.powerName,
            result: result.data,
            executionTime: Date.now() - startTime,
            cached: false,
          });
        } catch (error) {
          errors.push(
            `Failed to call ${toolCall.toolName}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      // Synthesize response
      const synthesizedResponse = await this.synthesizeResponse(results);

      // Cache result
      if (plan.cacheKey && errors.length === 0) {
        this.addToCache(plan.cacheKey, results, synthesizedResponse);
      }

      return {
        success: errors.length === 0,
        results,
        synthesizedResponse,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        results,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Synthesize response from Power tool results
   */
  async synthesizeResponse(results: PowerToolResult[]): Promise<string> {
    if (results.length === 0) {
      return 'No results available.';
    }

    let response = '';

    for (const result of results) {
      response += `\n## ${result.toolName} Results\n\n`;
      response += JSON.stringify(result.result, null, 2);
      response += '\n';
    }

    return response;
  }

  /**
   * Generate cache key for query
   */
  private generateCacheKey(parsedQuery: ParsedQuery): string {
    return `${parsedQuery.intent}-${parsedQuery.workflowRunId || 'no-id'}-${parsedQuery.timeRange?.description || 'no-time'}`;
  }

  /**
   * Get result from cache
   */
  private getFromCache(cacheKey: string): CacheEntry | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.CACHE_TTL_MS) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry;
  }

  /**
   * Add result to cache
   */
  private addToCache(
    cacheKey: string,
    results: PowerToolResult[],
    synthesizedResponse: string
  ): void {
    this.cache.set(cacheKey, {
      results,
      synthesizedResponse,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL_MS) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    return {
      size: this.cache.size,
      ttlMs: this.CACHE_TTL_MS,
    };
  }
}

interface CacheEntry {
  results: PowerToolResult[];
  synthesizedResponse: string;
  timestamp: number;
}

interface CacheStats {
  size: number;
  ttlMs: number;
}
