import { describe, it, expect } from 'vitest';
import { GenomicsRecommendationEngine } from '../../src/knowledge/GenomicsRecommendationEngine';
import type { EnhancedDiagnosis } from '../../src/knowledge/GenomicsContextInterpreter';

describe('GenomicsRecommendationEngine', () => {
  describe('generateRecommendationsFromDiagnosis', () => {
    it('should generate recommendations from GATK OOM error', () => {
      const enhancedDiagnosis: EnhancedDiagnosis = {
        original: {
          runId: 'omics-test-123',
          status: 'FAILED',
          failureReason: 'Task failed',
          engineLogs: 'java.lang.OutOfMemoryError',
        },
        genomicsContext: {
          workflowType: 'WGS',
          bioinformaticsTool: 'GATK',
          commonPattern: 'Java heap memory exhaustion',
        },
        enhancedRootCauses: [
          {
            type: 'RESOURCE_EXHAUSTION',
            description: 'GATK: Java heap memory exhaustion',
            confidence: 0.95,
            affectedTasks: ['task-1'],
            evidence: [],
            genomicsContext: {
              workflowType: 'WGS',
              bioinformaticsTool: 'GATK',
              commonPattern: 'Java heap memory exhaustion',
            },
          },
        ],
        bioinformaticsInsights: [],
      };

      const recommendations =
        GenomicsRecommendationEngine.generateRecommendationsFromDiagnosis(enhancedDiagnosis);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].type).toBe('INCREASE_MEMORY');
      expect(recommendations[0].genomicsRationale).toContain('GATK');
      expect(recommendations[0].confidence).toBeGreaterThan(0.9);
    });

    it('should include workflow-type-specific recommendations', () => {
      const enhancedDiagnosis: EnhancedDiagnosis = {
        original: {
          runId: 'omics-test-123',
          status: 'FAILED',
        },
        genomicsContext: {
          workflowType: 'WGS',
        },
        enhancedRootCauses: [],
        bioinformaticsInsights: [],
      };

      const recommendations =
        GenomicsRecommendationEngine.generateRecommendationsFromDiagnosis(enhancedDiagnosis);

      expect(recommendations.length).toBeGreaterThan(0);
      const workflowRec = recommendations.find((r) => r.type === 'UPDATE_CONFIGURATION');
      expect(workflowRec).toBeDefined();
      expect(workflowRec?.genomicsRationale).toContain('WGS');
    });
  });

  describe('generateRecommendationsFromPerformance', () => {
    it('should generate recommendations with genomics rationale', () => {
      const enhancedAnalysis = {
        original: {
          runId: 'omics-test-123',
          tasks: [],
          recommendations: [
            {
              taskName: 'gatk-haplotype-caller',
              resourceType: 'MEMORY' as const,
              currentValue: 8,
              recommendedValue: 16,
              reason: 'Peak usage exceeded allocation',
            },
          ],
        },
        genomicsContext: {
          workflowType: 'WGS' as const,
        },
        workflowTypeRecommendations: [
          'WGS typical resources: 8-32 vCPUs, 32-128 GB memory',
        ],
        toolSpecificOptimizations: [],
      };

      const recommendations =
        GenomicsRecommendationEngine.generateRecommendationsFromPerformance(enhancedAnalysis);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].type).toBe('INCREASE_MEMORY');
      expect(recommendations[0].genomicsRationale).toContain('GATK');
    });

    it('should include workflow-type optimizations', () => {
      const enhancedAnalysis = {
        original: {
          runId: 'omics-test-123',
          tasks: [],
          recommendations: [],
        },
        genomicsContext: {
          workflowType: 'WGS' as const,
        },
        workflowTypeRecommendations: [
          'WGS typical resources: 8-32 vCPUs, 32-128 GB memory',
        ],
        toolSpecificOptimizations: [],
      };

      const recommendations =
        GenomicsRecommendationEngine.generateRecommendationsFromPerformance(enhancedAnalysis);

      expect(recommendations.length).toBeGreaterThan(0);
      const workflowRec = recommendations.find((r) => r.type === 'UPDATE_CONFIGURATION');
      expect(workflowRec).toBeDefined();
    });
  });
});
