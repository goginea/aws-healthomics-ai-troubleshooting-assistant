/**
 * Natural Language Query Parser
 *
 * Parses user queries to extract intent, workflow identifiers, and time ranges
 */

export interface IQueryParser {
  parse(query: string): ParsedQuery;
  extractRunId(query: string): string | null;
  extractTimeRange(query: string): TimeRange | null;
  classifyIntent(query: string): QueryIntent;
  detectAmbiguity(query: string): AmbiguityResult;
}

export interface ParsedQuery {
  intent: QueryIntent;
  workflowRunId?: string;
  timeRange?: TimeRange;
  taskName?: string;
  clarificationNeeded: boolean;
  clarificationPrompt?: string;
  originalQuery: string;
}

export enum QueryIntent {
  GET_RUN_STATUS = 'GET_RUN_STATUS',
  ANALYZE_FAILURE = 'ANALYZE_FAILURE',
  GET_TASK_DETAILS = 'GET_TASK_DETAILS',
  LIST_RECENT_RUNS = 'LIST_RECENT_RUNS',
  GET_RECOMMENDATIONS = 'GET_RECOMMENDATIONS',
  ANALYZE_PERFORMANCE = 'ANALYZE_PERFORMANCE',
  UNKNOWN = 'UNKNOWN',
}

export interface TimeRange {
  start: Date;
  end: Date;
  description: string;
}

export interface AmbiguityResult {
  isAmbiguous: boolean;
  reason?: string;
  clarificationPrompt?: string;
  possibleInterpretations?: string[];
}

/**
 * Query parser implementation
 */
export class QueryParser implements IQueryParser {
  private readonly RUN_ID_PATTERNS = [
    /omics-([a-z0-9]+)/i,
    /run[:\s]+([a-z0-9]+)/i,
    /workflow[:\s]+([a-z0-9]+)/i,
    /([a-z0-9]{8,})/i, // Generic alphanumeric ID
  ];

  /**
   * Parse a natural language query
   */
  parse(query: string): ParsedQuery {
    const runId = this.extractRunId(query);
    const timeRange = this.extractTimeRange(query);
    const intent = this.classifyIntent(query);
    const ambiguity = this.detectAmbiguity(query);
    const taskName = this.extractTaskName(query);

    return {
      intent,
      workflowRunId: runId || undefined,
      timeRange: timeRange || undefined,
      taskName,
      clarificationNeeded: ambiguity.isAmbiguous,
      clarificationPrompt: ambiguity.clarificationPrompt,
      originalQuery: query,
    };
  }

  /**
   * Extract workflow run ID from query
   */
  extractRunId(query: string): string | null {
    for (const pattern of this.RUN_ID_PATTERNS) {
      const match = query.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    return null;
  }

  /**
   * Extract time range from query
   */
  extractTimeRange(query: string): TimeRange | null {
    const queryLower = query.toLowerCase();
    const now = new Date();

    // "last run" or "latest run"
    if (queryLower.includes('last run') || queryLower.includes('latest run')) {
      return {
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24 hours ago
        end: now,
        description: 'last run',
      };
    }

    // "past hour"
    if (queryLower.includes('past hour') || queryLower.includes('last hour')) {
      return {
        start: new Date(now.getTime() - 60 * 60 * 1000),
        end: now,
        description: 'past hour',
      };
    }

    // "today"
    if (queryLower.includes('today')) {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      return {
        start: startOfDay,
        end: now,
        description: 'today',
      };
    }

    // "yesterday"
    if (queryLower.includes('yesterday')) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      return {
        start: yesterday,
        end: endOfYesterday,
        description: 'yesterday',
      };
    }

    // "past week"
    if (queryLower.includes('past week') || queryLower.includes('last week')) {
      return {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now,
        description: 'past week',
      };
    }

    return null;
  }

  /**
   * Classify query intent
   */
  classifyIntent(query: string): QueryIntent {
    const queryLower = query.toLowerCase();

    // Analyze performance (check before failure since "slow" is more specific)
    if (
      queryLower.includes('performance') ||
      queryLower.includes('slow') ||
      queryLower.includes('optimize') ||
      queryLower.includes('resource')
    ) {
      return QueryIntent.ANALYZE_PERFORMANCE;
    }

    // Analyze failure
    if (
      queryLower.includes('why') ||
      queryLower.includes('failed') ||
      queryLower.includes('failure') ||
      queryLower.includes('error')
    ) {
      return QueryIntent.ANALYZE_FAILURE;
    }

    // Get recommendations
    if (
      queryLower.includes('recommend') ||
      queryLower.includes('fix') ||
      queryLower.includes('resolve') ||
      queryLower.includes('how to')
    ) {
      return QueryIntent.GET_RECOMMENDATIONS;
    }

    // Get task details
    if (queryLower.includes('task') && !queryLower.includes('list')) {
      return QueryIntent.GET_TASK_DETAILS;
    }

    // List recent runs
    if (
      queryLower.includes('list') ||
      queryLower.includes('recent') ||
      queryLower.includes('latest')
    ) {
      return QueryIntent.LIST_RECENT_RUNS;
    }

    // Get run status
    if (queryLower.includes('status') || queryLower.includes('state')) {
      return QueryIntent.GET_RUN_STATUS;
    }

    return QueryIntent.UNKNOWN;
  }

  /**
   * Detect ambiguity in query
   */
  detectAmbiguity(query: string): AmbiguityResult {
    const runId = this.extractRunId(query);
    const timeRange = this.extractTimeRange(query);
    const intent = this.classifyIntent(query);

    // Ambiguous if no run ID and no time range for specific queries
    if (
      !runId &&
      !timeRange &&
      (intent === QueryIntent.GET_RUN_STATUS ||
        intent === QueryIntent.ANALYZE_FAILURE ||
        intent === QueryIntent.GET_TASK_DETAILS)
    ) {
      return {
        isAmbiguous: true,
        reason: 'No workflow run identifier or time range specified',
        clarificationPrompt:
          'Which workflow run would you like to analyze? Please provide a run ID or time range (e.g., "last run", "today").',
        possibleInterpretations: [
          'Analyze the most recent run',
          'Analyze a specific run by ID',
          'Analyze runs from a time range',
        ],
      };
    }

    // Ambiguous if intent is unknown
    if (intent === QueryIntent.UNKNOWN) {
      return {
        isAmbiguous: true,
        reason: 'Unable to determine query intent',
        clarificationPrompt:
          'What would you like to know? For example: "Why did run X fail?", "Show me recent runs", "Analyze performance of run Y"',
        possibleInterpretations: [
          'Get run status',
          'Analyze failure',
          'Get recommendations',
          'List recent runs',
        ],
      };
    }

    return {
      isAmbiguous: false,
    };
  }

  /**
   * Extract task name from query
   */
  private extractTaskName(query: string): string | undefined {
    const taskMatch = query.match(/task[:\s]+([a-zA-Z0-9-_]+)/i);
    if (taskMatch) {
      return taskMatch[1];
    }

    // Look for quoted task names
    const quotedMatch = query.match(/"([^"]+)"/);
    if (quotedMatch && query.toLowerCase().includes('task')) {
      return quotedMatch[1];
    }

    return undefined;
  }
}
