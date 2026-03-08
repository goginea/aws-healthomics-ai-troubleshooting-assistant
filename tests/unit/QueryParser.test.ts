import { describe, it, expect, beforeEach } from 'vitest';
import { QueryParser, QueryIntent } from '../../src/query/QueryParser';

describe('QueryParser', () => {
  let parser: QueryParser;

  beforeEach(() => {
    parser = new QueryParser();
  });

  describe('extractRunId', () => {
    it('should extract run ID with omics- prefix', () => {
      const runId = parser.extractRunId('Why did omics-abc123 fail?');
      expect(runId).toBe('abc123');
    });

    it('should extract run ID with "run" keyword', () => {
      const runId = parser.extractRunId('Show me run: xyz789');
      expect(runId).toBe('xyz789');
    });

    it('should extract run ID with "workflow" keyword', () => {
      const runId = parser.extractRunId('Analyze workflow abc123def');
      expect(runId).toBe('abc123def');
    });

    it('should return null if no run ID found', () => {
      const runId = parser.extractRunId('Show me recent runs');
      expect(runId).toBeNull();
    });
  });

  describe('extractTimeRange', () => {
    it('should extract "last run" time range', () => {
      const timeRange = parser.extractTimeRange('Show me the last run');
      expect(timeRange).toBeDefined();
      expect(timeRange?.description).toBe('last run');
    });

    it('should extract "past hour" time range', () => {
      const timeRange = parser.extractTimeRange('Failures in the past hour');
      expect(timeRange).toBeDefined();
      expect(timeRange?.description).toBe('past hour');
    });

    it('should extract "today" time range', () => {
      const timeRange = parser.extractTimeRange('Show me runs from today');
      expect(timeRange).toBeDefined();
      expect(timeRange?.description).toBe('today');
    });

    it('should extract "yesterday" time range', () => {
      const timeRange = parser.extractTimeRange('What failed yesterday?');
      expect(timeRange).toBeDefined();
      expect(timeRange?.description).toBe('yesterday');
    });

    it('should return null if no time range found', () => {
      const timeRange = parser.extractTimeRange('Show me run omics-abc123');
      expect(timeRange).toBeNull();
    });
  });

  describe('classifyIntent', () => {
    it('should classify ANALYZE_FAILURE intent', () => {
      expect(parser.classifyIntent('Why did the run fail?')).toBe(
        QueryIntent.ANALYZE_FAILURE
      );
      expect(parser.classifyIntent('What caused the error?')).toBe(
        QueryIntent.ANALYZE_FAILURE
      );
    });

    it('should classify GET_RECOMMENDATIONS intent', () => {
      expect(parser.classifyIntent('How do I fix this?')).toBe(
        QueryIntent.GET_RECOMMENDATIONS
      );
      expect(parser.classifyIntent('Recommend a solution')).toBe(
        QueryIntent.GET_RECOMMENDATIONS
      );
    });

    it('should classify ANALYZE_PERFORMANCE intent', () => {
      expect(parser.classifyIntent('Analyze performance')).toBe(
        QueryIntent.ANALYZE_PERFORMANCE
      );
      expect(parser.classifyIntent('Why is it slow?')).toBe(
        QueryIntent.ANALYZE_PERFORMANCE
      );
    });

    it('should classify GET_TASK_DETAILS intent', () => {
      expect(parser.classifyIntent('Show me task details')).toBe(
        QueryIntent.GET_TASK_DETAILS
      );
    });

    it('should classify LIST_RECENT_RUNS intent', () => {
      expect(parser.classifyIntent('List recent runs')).toBe(
        QueryIntent.LIST_RECENT_RUNS
      );
      expect(parser.classifyIntent('Show me latest workflows')).toBe(
        QueryIntent.LIST_RECENT_RUNS
      );
    });

    it('should classify GET_RUN_STATUS intent', () => {
      expect(parser.classifyIntent('What is the status?')).toBe(
        QueryIntent.GET_RUN_STATUS
      );
    });

    it('should return UNKNOWN for unclear queries', () => {
      expect(parser.classifyIntent('Hello')).toBe(QueryIntent.UNKNOWN);
    });
  });

  describe('detectAmbiguity', () => {
    it('should detect ambiguity when no run ID for specific query', () => {
      const result = parser.detectAmbiguity('Why did it fail?');
      expect(result.isAmbiguous).toBe(true);
      expect(result.clarificationPrompt).toBeDefined();
    });

    it('should detect ambiguity for unknown intent', () => {
      const result = parser.detectAmbiguity('Hello there');
      expect(result.isAmbiguous).toBe(true);
      expect(result.reason).toContain('intent');
    });

    it('should not detect ambiguity with clear run ID', () => {
      const result = parser.detectAmbiguity('Why did omics-abc123 fail?');
      expect(result.isAmbiguous).toBe(false);
    });

    it('should not detect ambiguity with time range', () => {
      const result = parser.detectAmbiguity('Show me failures from today');
      expect(result.isAmbiguous).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse complete query', () => {
      const parsed = parser.parse('Why did omics-abc123 fail?');

      expect(parsed.intent).toBe(QueryIntent.ANALYZE_FAILURE);
      expect(parsed.workflowRunId).toBe('abc123');
      expect(parsed.clarificationNeeded).toBe(false);
      expect(parsed.originalQuery).toBe('Why did omics-abc123 fail?');
    });

    it('should parse query with time range', () => {
      const parsed = parser.parse('Show me failures from today');

      expect(parsed.intent).toBe(QueryIntent.ANALYZE_FAILURE);
      expect(parsed.timeRange).toBeDefined();
      expect(parsed.timeRange?.description).toBe('today');
    });

    it('should detect ambiguity in parsed query', () => {
      const parsed = parser.parse('Why did it fail?');

      expect(parsed.clarificationNeeded).toBe(true);
      expect(parsed.clarificationPrompt).toBeDefined();
    });
  });
});
