import { describe, it, expect, beforeEach } from 'vitest';
import { HistoricalDataProcessor } from '../../src/knowledge/HistoricalDataProcessor';
import { HistoricalTroubleshootingData } from '../../src/types';

describe('HistoricalDataProcessor', () => {
  let processor: HistoricalDataProcessor;

  beforeEach(() => {
    processor = new HistoricalDataProcessor();
  });

  describe('transformToDocuments', () => {
    it('should transform historical data to documents', async () => {
      const data: HistoricalTroubleshootingData[] = [
        {
          workflowRunId: 'omics-abc123',
          failureType: 'Memory Exhaustion',
          rootCause: 'Insufficient memory allocation for GATK',
          resolution: 'Increased memory to 16 GB',
          resolutionTime: 45,
          timestamp: new Date('2026-03-01T10:00:00Z'),
          workflowType: 'WGS',
          taskName: 'gatk-haplotypecaller',
        },
      ];

      const documents = await processor.transformToDocuments(data);

      expect(documents).toHaveLength(1);
      expect(documents[0].title).toContain('Memory Exhaustion');
      expect(documents[0].content).toContain('omics-abc123');
      expect(documents[0].metadata.tags).toContain('Memory Exhaustion');
      expect(documents[0].source).toBe('HISTORICAL_LOGS');
    });
  });

  describe('normalizeFailureType', () => {
    it('should normalize memory errors', () => {
      expect(processor.normalizeFailureType('Out of Memory')).toBe(
        'MEMORY_EXHAUSTION'
      );
      expect(processor.normalizeFailureType('OOM Error')).toBe('MEMORY_EXHAUSTION');
    });

    it('should normalize permission errors', () => {
      expect(processor.normalizeFailureType('Access Denied')).toBe(
        'IAM_PERMISSION_ERROR'
      );
      expect(processor.normalizeFailureType('Permission Error')).toBe(
        'IAM_PERMISSION_ERROR'
      );
    });

    it('should normalize timeout errors', () => {
      expect(processor.normalizeFailureType('Task Timeout')).toBe('TIMEOUT_ERROR');
    });

    it('should normalize container errors', () => {
      expect(processor.normalizeFailureType('ECR Image Pull Failed')).toBe(
        'CONTAINER_IMAGE_ERROR'
      );
    });

    it('should return OTHER for unknown types', () => {
      expect(processor.normalizeFailureType('Unknown Error')).toBe('OTHER');
    });
  });

  describe('extractPatterns', () => {
    it('should extract patterns from historical data', () => {
      const data: HistoricalTroubleshootingData[] = [
        {
          workflowRunId: 'omics-1',
          failureType: 'Memory Exhaustion',
          rootCause: 'Insufficient memory for GATK',
          resolution: 'Increased memory to 16 GB',
          resolutionTime: 45,
          timestamp: new Date(),
          workflowType: 'WGS',
        },
        {
          workflowRunId: 'omics-2',
          failureType: 'Out of Memory',
          rootCause: 'Insufficient memory for BWA',
          resolution: 'Increased memory to 32 GB',
          resolutionTime: 30,
          timestamp: new Date(),
          workflowType: 'WGS',
        },
      ];

      const patterns = processor.extractPatterns(data);

      expect(patterns).toHaveLength(1); // Both normalize to MEMORY_EXHAUSTION
      expect(patterns[0].failureType).toBe('MEMORY_EXHAUSTION');
      expect(patterns[0].occurrenceCount).toBe(2);
      expect(patterns[0].commonRootCauses).toHaveLength(2);
      expect(patterns[0].averageResolutionTime).toBe(37.5);
    });
  });

  describe('validateData', () => {
    it('should validate complete data', () => {
      const data: HistoricalTroubleshootingData[] = [
        {
          workflowRunId: 'omics-abc123',
          failureType: 'Memory Exhaustion',
          rootCause: 'Insufficient memory',
          resolution: 'Increased memory',
          resolutionTime: 45,
          timestamp: new Date(),
          workflowType: 'WGS',
          taskName: 'gatk',
        },
      ];

      const result = processor.validateData(data);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const data: HistoricalTroubleshootingData[] = [
        {
          workflowRunId: '',
          failureType: '',
          rootCause: '',
          resolution: '',
          resolutionTime: 0,
          timestamp: new Date(),
          workflowType: 'WGS',
        },
      ];

      const result = processor.validateData(data);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn about missing optional fields', () => {
      const data: HistoricalTroubleshootingData[] = [
        {
          workflowRunId: 'omics-abc123',
          failureType: 'Memory Exhaustion',
          rootCause: 'Insufficient memory',
          resolution: 'Increased memory',
          resolutionTime: 45,
          timestamp: new Date(),
          workflowType: 'WGS',
          // taskName missing
        },
      ];

      const result = processor.validateData(data);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});
