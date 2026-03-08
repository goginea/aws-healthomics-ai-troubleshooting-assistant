/**
 * Historical Data Processor
 *
 * Transforms and normalizes historical troubleshooting data for storage in AgentCore Memory
 */

import {
  HistoricalTroubleshootingData,
  Document,
} from '../types';

export interface IHistoricalDataProcessor {
  transformToDocuments(
    data: HistoricalTroubleshootingData[]
  ): Promise<Document[]>;
  normalizeFailureType(failureType: string): string;
  extractPatterns(data: HistoricalTroubleshootingData[]): TroubleshootingPattern[];
  validateData(data: HistoricalTroubleshootingData[]): ValidationResult;
}

export interface TroubleshootingPattern {
  failureType: string;
  commonRootCauses: string[];
  typicalResolutions: string[];
  averageResolutionTime: number;
  occurrenceCount: number;
  workflowTypes: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Historical data processor implementation
 */
export class HistoricalDataProcessor implements IHistoricalDataProcessor {
  /**
   * Transform historical data into documents for knowledge base
   */
  async transformToDocuments(
    data: HistoricalTroubleshootingData[]
  ): Promise<Document[]> {
    const documents: Document[] = [];

    for (const entry of data) {
      const doc: Document = {
        id: `historical-${entry.workflowRunId}-${entry.timestamp.getTime()}`,
        title: `${entry.failureType} - ${entry.workflowRunId}`,
        content: this.formatAsDocument(entry),
        metadata: {
          createdDate: entry.timestamp,
          tags: [
            entry.failureType,
            entry.workflowType,
            `resolution-time-${Math.floor(entry.resolutionTime / 60)}h`,
          ],
          category: 'historical-troubleshooting',
          customFields: {
            workflowRunId: entry.workflowRunId,
            failureType: entry.failureType,
            rootCause: entry.rootCause,
            resolutionTime: entry.resolutionTime,
            workflowType: entry.workflowType,
            taskName: entry.taskName,
          },
        },
        source: 'HISTORICAL_LOGS',
      };

      documents.push(doc);
    }

    return documents;
  }

  /**
   * Normalize failure type to standard categories
   */
  normalizeFailureType(failureType: string): string {
    const normalized = failureType.toLowerCase().trim();

    // Map to standard categories
    if (normalized.includes('memory') || normalized.includes('oom')) {
      return 'MEMORY_EXHAUSTION';
    } else if (normalized.includes('permission') || normalized.includes('access denied')) {
      return 'IAM_PERMISSION_ERROR';
    } else if (normalized.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    } else if (normalized.includes('image') || normalized.includes('ecr')) {
      return 'CONTAINER_IMAGE_ERROR';
    } else if (normalized.includes('disk') || normalized.includes('storage')) {
      return 'DISK_SPACE_ERROR';
    } else if (normalized.includes('network') || normalized.includes('connection')) {
      return 'NETWORK_ERROR';
    } else if (normalized.includes('configuration') || normalized.includes('parameter')) {
      return 'CONFIGURATION_ERROR';
    } else {
      return 'OTHER';
    }
  }

  /**
   * Extract patterns from historical data
   */
  extractPatterns(
    data: HistoricalTroubleshootingData[]
  ): TroubleshootingPattern[] {
    const patternMap = new Map<string, TroubleshootingPattern>();

    // Group by normalized failure type
    for (const entry of data) {
      const normalizedType = this.normalizeFailureType(entry.failureType);

      if (!patternMap.has(normalizedType)) {
        patternMap.set(normalizedType, {
          failureType: normalizedType,
          commonRootCauses: [],
          typicalResolutions: [],
          averageResolutionTime: 0,
          occurrenceCount: 0,
          workflowTypes: [],
        });
      }

      const pattern = patternMap.get(normalizedType)!;
      pattern.occurrenceCount++;

      // Track root causes
      if (!pattern.commonRootCauses.includes(entry.rootCause)) {
        pattern.commonRootCauses.push(entry.rootCause);
      }

      // Track resolutions
      if (!pattern.typicalResolutions.includes(entry.resolution)) {
        pattern.typicalResolutions.push(entry.resolution);
      }

      // Track workflow types
      if (!pattern.workflowTypes.includes(entry.workflowType)) {
        pattern.workflowTypes.push(entry.workflowType);
      }

      // Update average resolution time
      pattern.averageResolutionTime =
        (pattern.averageResolutionTime * (pattern.occurrenceCount - 1) +
          entry.resolutionTime) /
        pattern.occurrenceCount;
    }

    return Array.from(patternMap.values());
  }

  /**
   * Validate historical data
   */
  validateData(data: HistoricalTroubleshootingData[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const entry = data[i];

      // Required fields
      if (!entry.workflowRunId) {
        errors.push(`Entry ${i}: Missing workflowRunId`);
      }
      if (!entry.failureType) {
        errors.push(`Entry ${i}: Missing failureType`);
      }
      if (!entry.rootCause) {
        errors.push(`Entry ${i}: Missing rootCause`);
      }
      if (!entry.resolution) {
        errors.push(`Entry ${i}: Missing resolution`);
      }
      if (!entry.timestamp) {
        errors.push(`Entry ${i}: Missing timestamp`);
      }

      // Warnings for optional fields
      if (!entry.taskName) {
        warnings.push(`Entry ${i}: Missing taskName (optional)`);
      }
      if (entry.resolutionTime <= 0) {
        warnings.push(`Entry ${i}: Invalid resolutionTime (${entry.resolutionTime})`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Format historical entry as document content
   */
  private formatAsDocument(entry: HistoricalTroubleshootingData): string {
    return `# Troubleshooting Case: ${entry.failureType}

## Workflow Information
- **Run ID**: ${entry.workflowRunId}
- **Workflow Type**: ${entry.workflowType}
- **Task**: ${entry.taskName || 'N/A'}
- **Timestamp**: ${entry.timestamp.toISOString()}

## Failure Details
**Failure Type**: ${entry.failureType}

**Root Cause**: ${entry.rootCause}

## Resolution
${entry.resolution}

**Resolution Time**: ${entry.resolutionTime} minutes

## Metadata
- Normalized Failure Type: ${this.normalizeFailureType(entry.failureType)}
- Resolution Time Category: ${this.categorizeResolutionTime(entry.resolutionTime)}
`;
  }

  /**
   * Categorize resolution time
   */
  private categorizeResolutionTime(minutes: number): string {
    if (minutes < 15) return 'Quick (< 15 min)';
    if (minutes < 60) return 'Moderate (15-60 min)';
    if (minutes < 240) return 'Extended (1-4 hours)';
    return 'Long (> 4 hours)';
  }
}
