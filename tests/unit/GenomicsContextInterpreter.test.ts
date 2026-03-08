import { describe, it, expect } from 'vitest';
import { GenomicsContextInterpreter } from '../../src/knowledge/GenomicsContextInterpreter';
import type { DiagnoseRunFailureResponse } from '../../src/types/power-tools';

describe('GenomicsContextInterpreter', () => {
  describe('enhanceDiagnosis', () => {
    it('should enhance diagnosis with genomics context', () => {
      const diagnosis: DiagnoseRunFailureResponse = {
        runId: 'omics-test-123',
        status: 'FAILED',
        failureReason: 'Task failed with exit code 137',
        engineLogs: 'java.lang.OutOfMemoryError: Java heap space at org.broadinstitute.gatk.HaplotypeCaller',
        failedTasks: [
          {
            taskId: 'task-1',
            taskName: 'gatk-haplotype-caller',
            exitCode: 137,
            logs: 'java.lang.OutOfMemoryError',
          },
        ],
      };

      const enhanced = GenomicsContextInterpreter.enhanceDiagnosis(diagnosis, 'wgs-pipeline');

      expect(enhanced.genomicsContext.workflowType).toBe('WGS');
      expect(enhanced.genomicsContext.bioinformaticsTool).toBe('GATK');
      expect(enhanced.genomicsContext.commonPattern).toContain('heap memory exhaustion');
      expect(enhanced.enhancedRootCauses.length).toBeGreaterThan(0);
      expect(enhanced.bioinformaticsInsights.length).toBeGreaterThan(0);
    });

    it('should identify BWA-MEM2 errors', () => {
      const diagnosis: DiagnoseRunFailureResponse = {
        runId: 'omics-test-456',
        status: 'FAILED',
        engineLogs: 'bwa-mem2: Segmentation fault during alignment',
        failedTasks: [
          {
            taskId: 'task-2',
            taskName: 'bwa-alignment',
            exitCode: 139,
          },
        ],
      };

      const enhanced = GenomicsContextInterpreter.enhanceDiagnosis(diagnosis);

      expect(enhanced.genomicsContext.bioinformaticsTool).toBe('BWA-MEM2');
      expect(enhanced.enhancedRootCauses.length).toBeGreaterThan(0);
    });

    it('should handle diagnosis without genomics context', () => {
      const diagnosis: DiagnoseRunFailureResponse = {
        runId: 'omics-test-789',
        status: 'FAILED',
        failureReason: 'Generic error',
      };

      const enhanced = GenomicsContextInterpreter.enhanceDiagnosis(diagnosis);

      expect(enhanced.genomicsContext.workflowType).toBeUndefined();
      expect(enhanced.genomicsContext.bioinformaticsTool).toBeUndefined();
    });
  });

  describe('enhancePerformanceAnalysis', () => {
    it('should enhance performance analysis with workflow-specific recommendations', () => {
      const analysis = {
        runId: 'omics-test-123',
        tasks: [
          {
            taskId: 'task-1',
            taskName: 'gatk-haplotype-caller',
            cpuUtilization: { allocated: 4, peak: 3.2, average: 2.8, unit: 'vCPUs' },
            memoryUtilization: { allocated: 8, peak: 14.2, average: 12.5, unit: 'GB' },
            duration: 7200,
          },
        ],
        recommendations: [
          {
            taskName: 'gatk-haplotype-caller',
            resourceType: 'MEMORY' as const,
            currentValue: 8,
            recommendedValue: 16,
            reason: 'Peak usage exceeded allocation',
          },
        ],
      };

      const enhanced = GenomicsContextInterpreter.enhancePerformanceAnalysis(
        analysis,
        'wgs-pipeline',
      );

      expect(enhanced.genomicsContext.workflowType).toBe('WGS');
      expect(enhanced.workflowTypeRecommendations.length).toBeGreaterThan(0);
      expect(enhanced.toolSpecificOptimizations.length).toBeGreaterThan(0);
    });
  });
});
