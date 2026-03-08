import { describe, it, expect, beforeEach } from 'vitest';
import { ResourceExhaustionAnalyzer } from '../../src/analysis/ResourceExhaustionAnalyzer';

describe('ResourceExhaustionAnalyzer', () => {
  let analyzer: ResourceExhaustionAnalyzer;

  beforeEach(() => {
    analyzer = new ResourceExhaustionAnalyzer();
  });

  describe('analyzeResourceUsage', () => {
    it('should detect memory exhaustion', () => {
      const performanceData = {
        tasks: [
          {
            name: 'bwa-mem-alignment',
            memory: { allocated: 16, peak: 15.5 },
            cpu: { allocated: 4, peak: 3.2 },
          },
        ],
      };

      const result = analyzer.analyzeResourceUsage(performanceData, 'WGS');

      expect(result.exhaustedResources).toHaveLength(1);
      expect(result.exhaustedResources[0].resourceType).toBe('MEMORY');
      expect(result.exhaustedResources[0].genomicsReason).toContain('BWA');
    });

    it('should detect underutilized resources', () => {
      const performanceData = {
        tasks: [
          {
            name: 'gatk-variant-calling',
            memory: { allocated: 32, peak: 8 },
            cpu: { allocated: 8, peak: 2 },
          },
        ],
      };

      const result = analyzer.analyzeResourceUsage(performanceData, 'WGS');

      expect(result.underutilizedResources.length).toBeGreaterThan(0);
      expect(result.underutilizedResources[0].potentialSavings).toContain('%');
    });

    it('should provide genomics context', () => {
      const performanceData = { tasks: [] };
      const result = analyzer.analyzeResourceUsage(performanceData, 'WGS');

      expect(result.genomicsContext).toContain('WGS');
      expect(result.genomicsContext).toContain('32-64 GB');
    });
  });

  describe('getWorkflowTypeRecommendations', () => {
    it('should return WGS profile', () => {
      const profile = analyzer.getWorkflowTypeRecommendations('WGS');

      expect(profile.workflowType).toBe('WGS');
      expect(profile.typicalMemoryRange).toBe('32-64 GB');
      expect(profile.commonBottlenecks).toContain('BWA-MEM2 alignment (memory-intensive)');
    });

    it('should return WES profile', () => {
      const profile = analyzer.getWorkflowTypeRecommendations('WES');

      expect(profile.workflowType).toBe('WES');
      expect(profile.typicalMemoryRange).toBe('16-32 GB');
    });

    it('should return RNA-Seq profile', () => {
      const profile = analyzer.getWorkflowTypeRecommendations('RNA-Seq');

      expect(profile.workflowType).toBe('RNA-Seq');
      expect(profile.commonBottlenecks).toContain('STAR alignment (memory-intensive)');
    });

    it('should return default profile for unknown type', () => {
      const profile = analyzer.getWorkflowTypeRecommendations('UNKNOWN');

      expect(profile.workflowType).toBe('UNKNOWN');
      expect(profile.typicalMemoryRange).toBe('16-32 GB');
    });
  });
});
