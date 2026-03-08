import { describe, it, expect } from 'vitest';
import { GenomicsKnowledgeBase } from '../../src/knowledge/GenomicsKnowledgeBase';

describe('GenomicsKnowledgeBase', () => {
  describe('getWorkflowTypeInfo', () => {
    it('should return WGS workflow info', () => {
      const info = GenomicsKnowledgeBase.getWorkflowTypeInfo('WGS');

      expect(info).toBeDefined();
      expect(info?.name).toBe('Whole Genome Sequencing (WGS)');
      expect(info?.typicalTools).toContain('GATK HaplotypeCaller');
      expect(info?.typicalTools).toContain('BWA-MEM2');
    });

    it('should return undefined for unknown workflow type', () => {
      const info = GenomicsKnowledgeBase.getWorkflowTypeInfo('Unknown');

      expect(info).toBeUndefined();
    });
  });

  describe('getToolInfo', () => {
    it('should return GATK tool info', () => {
      const info = GenomicsKnowledgeBase.getToolInfo('GATK');

      expect(info).toBeDefined();
      expect(info?.name).toBe('Genome Analysis Toolkit (GATK)');
      expect(info?.commonErrorPatterns.length).toBeGreaterThan(0);
    });

    it('should return BWA-MEM2 tool info', () => {
      const info = GenomicsKnowledgeBase.getToolInfo('BWA-MEM2');

      expect(info).toBeDefined();
      expect(info?.name).toBe('Burrows-Wheeler Aligner MEM2');
    });
  });

  describe('identifyToolFromError', () => {
    it('should identify GATK from error message', () => {
      const error = 'java.lang.OutOfMemoryError: Java heap space at org.broadinstitute.gatk';
      const tool = GenomicsKnowledgeBase.identifyToolFromError(error);

      expect(tool).toBe('GATK');
    });

    it('should identify BWA-MEM2 from error message', () => {
      const error = 'bwa-mem2: Segmentation fault during alignment';
      const tool = GenomicsKnowledgeBase.identifyToolFromError(error);

      expect(tool).toBe('BWA-MEM2');
    });

    it('should identify Samtools from error message', () => {
      const error = 'samtools: truncated file error';
      const tool = GenomicsKnowledgeBase.identifyToolFromError(error);

      expect(tool).toBe('Samtools');
    });

    it('should return undefined for unknown tool', () => {
      const error = 'Generic error message';
      const tool = GenomicsKnowledgeBase.identifyToolFromError(error);

      expect(tool).toBeUndefined();
    });
  });

  describe('matchErrorPattern', () => {
    it('should match GATK OOM error pattern', () => {
      const error = 'java.lang.OutOfMemoryError: Java heap space';
      const pattern = GenomicsKnowledgeBase.matchErrorPattern(error, 'GATK');

      expect(pattern).toBeDefined();
      expect(pattern?.cause).toBe('Java heap memory exhaustion');
      expect(pattern?.confidence).toBeGreaterThan(0.9);
    });

    it('should match BWA-MEM2 segfault pattern', () => {
      const error = 'Segmentation fault (core dumped)';
      const pattern = GenomicsKnowledgeBase.matchErrorPattern(error, 'BWA-MEM2');

      expect(pattern).toBeDefined();
      expect(pattern?.cause).toContain('Memory access violation');
    });

    it('should return undefined for non-matching pattern', () => {
      const error = 'Some other error';
      const pattern = GenomicsKnowledgeBase.matchErrorPattern(error, 'GATK');

      expect(pattern).toBeUndefined();
    });
  });

  describe('identifyWorkflowType', () => {
    it('should identify WGS from workflow name', () => {
      const type = GenomicsKnowledgeBase.identifyWorkflowType('my-wgs-pipeline');

      expect(type).toBe('WGS');
    });

    it('should identify WES from workflow name', () => {
      const type = GenomicsKnowledgeBase.identifyWorkflowType('exome-sequencing-workflow');

      expect(type).toBe('WES');
    });

    it('should identify RNA-Seq from workflow name', () => {
      const type = GenomicsKnowledgeBase.identifyWorkflowType('rna-seq-analysis');

      expect(type).toBe('RNA-Seq');
    });

    it('should return undefined for unknown workflow', () => {
      const type = GenomicsKnowledgeBase.identifyWorkflowType('generic-pipeline');

      expect(type).toBeUndefined();
    });
  });

  describe('getResourceRecommendations', () => {
    it('should return WGS resource recommendations', () => {
      const resources = GenomicsKnowledgeBase.getResourceRecommendations('WGS');

      expect(resources).toBeDefined();
      expect(resources?.memory).toBe('32-128 GB');
      expect(resources?.cpu).toBe('8-32 vCPUs');
    });
  });
});
