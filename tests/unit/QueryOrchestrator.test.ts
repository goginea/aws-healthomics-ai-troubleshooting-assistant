import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryOrchestrator } from '../../src/query/QueryOrchestrator';
import { QueryParser, QueryIntent } from '../../src/query/QueryParser';
import { PowerClient } from '../../src/orchestration/PowerClient';

describe('QueryOrchestrator', () => {
  let orchestrator: QueryOrchestrator;
  let powerClient: PowerClient;
  let parser: QueryParser;

  beforeEach(() => {
    powerClient = new PowerClient();
    orchestrator = new QueryOrchestrator(powerClient);
    parser = new QueryParser();
  });

  describe('orchestrate', () => {
    it('should create plan for GET_RUN_STATUS', async () => {
      const parsed = parser.parse('What is the status of omics-abc123?');
      const plan = await orchestrator.orchestrate(parsed);

      expect(plan.queryIntent).toBe(QueryIntent.GET_RUN_STATUS);
      expect(plan.toolCalls).toHaveLength(1);
      expect(plan.toolCalls[0].toolName).toBe('GetAHORun');
    });

    it('should create plan for ANALYZE_FAILURE', async () => {
      const parsed = parser.parse('Why did omics-abc123 fail?');
      const plan = await orchestrator.orchestrate(parsed);

      expect(plan.queryIntent).toBe(QueryIntent.ANALYZE_FAILURE);
      expect(plan.toolCalls).toHaveLength(2);
      expect(plan.toolCalls[0].toolName).toBe('GetAHORun');
      expect(plan.toolCalls[1].toolName).toBe('DiagnoseAHORunFailure');
    });

    it('should create plan for ANALYZE_PERFORMANCE', async () => {
      const parsed = parser.parse('Analyze performance of omics-abc123');
      const plan = await orchestrator.orchestrate(parsed);

      expect(plan.queryIntent).toBe(QueryIntent.ANALYZE_PERFORMANCE);
      expect(plan.toolCalls).toHaveLength(1);
      expect(plan.toolCalls[0].toolName).toBe('AnalyzeAHORunPerformance');
    });

    it('should create plan for LIST_RECENT_RUNS', async () => {
      const parsed = parser.parse('List runs from today');
      const plan = await orchestrator.orchestrate(parsed);

      expect(plan.queryIntent).toBe(QueryIntent.LIST_RECENT_RUNS);
      expect(plan.toolCalls).toHaveLength(1);
      expect(plan.toolCalls[0].toolName).toBe('ListAHORuns');
    });

    it('should generate cache key', async () => {
      const parsed = parser.parse('Status of omics-abc123');
      const plan = await orchestrator.orchestrate(parsed);

      expect(plan.cacheKey).toBeDefined();
      expect(plan.cacheKey).toContain('GET_RUN_STATUS');
    });
  });

  describe('execute', () => {
    it('should execute orchestration plan', async () => {
      const parsed = parser.parse('Status of omics-abc123');
      const plan = await orchestrator.orchestrate(parsed);

      // Mock power client response
      vi.spyOn(powerClient, 'callTool').mockResolvedValue({
        data: { status: 'COMPLETED' },
        metadata: { executionTime: 100 },
      });

      const result = await orchestrator.execute(plan);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
    });

    it('should use cached results', async () => {
      const parsed = parser.parse('Status of omics-abc123');
      const plan = await orchestrator.orchestrate(parsed);

      // Mock power client
      const mockCall = vi.spyOn(powerClient, 'callTool').mockResolvedValue({
        data: { status: 'COMPLETED' },
        metadata: { executionTime: 100 },
      });

      // First execution
      await orchestrator.execute(plan);

      // Second execution should use cache
      const result2 = await orchestrator.execute(plan);

      expect(result2.results[0].cached).toBe(true);
      expect(mockCall).toHaveBeenCalledTimes(1); // Only called once
    });
  });

  describe('synthesizeResponse', () => {
    it('should synthesize response from results', async () => {
      const results = [
        {
          toolName: 'GetAHORun',
          powerName: 'aws-healthomics',
          result: { status: 'FAILED' },
          executionTime: 100,
          cached: false,
        },
      ];

      const response = await orchestrator.synthesizeResponse(results);

      expect(response).toContain('GetAHORun');
      expect(response).toContain('FAILED');
    });

    it('should handle empty results', async () => {
      const response = await orchestrator.synthesizeResponse([]);

      expect(response).toContain('No results');
    });
  });

  describe('caching', () => {
    it('should clear expired cache entries', () => {
      orchestrator.clearExpiredCache();
      const stats = orchestrator.getCacheStats();

      expect(stats.size).toBeGreaterThanOrEqual(0);
      expect(stats.ttlMs).toBe(5 * 60 * 1000);
    });
  });
});
