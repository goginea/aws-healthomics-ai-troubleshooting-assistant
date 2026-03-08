import { describe, it, expect } from 'vitest';
import {
  RunStatus,
  WorkflowType,
  TaskStatus,
  RootCauseType,
  RecommendationType,
} from '../../src/types';

describe('Type Definitions', () => {
  describe('Workflow Types', () => {
    it('should have correct RunStatus values', () => {
      expect(RunStatus.PENDING).toBe('PENDING');
      expect(RunStatus.RUNNING).toBe('RUNNING');
      expect(RunStatus.COMPLETED).toBe('COMPLETED');
      expect(RunStatus.FAILED).toBe('FAILED');
    });

    it('should have correct WorkflowType values', () => {
      expect(WorkflowType.NEXTFLOW).toBe('NEXTFLOW');
      expect(WorkflowType.WDL).toBe('WDL');
      expect(WorkflowType.CWL).toBe('CWL');
    });

    it('should have correct TaskStatus values', () => {
      expect(TaskStatus.PENDING).toBe('PENDING');
      expect(TaskStatus.RUNNING).toBe('RUNNING');
      expect(TaskStatus.COMPLETED).toBe('COMPLETED');
      expect(TaskStatus.FAILED).toBe('FAILED');
    });
  });

  describe('Analysis Types', () => {
    it('should have correct RootCauseType values', () => {
      expect(RootCauseType.RESOURCE_EXHAUSTION).toBe('RESOURCE_EXHAUSTION');
      expect(RootCauseType.IAM_PERMISSION_DENIED).toBe('IAM_PERMISSION_DENIED');
      expect(RootCauseType.BIOINFORMATICS_TOOL_ERROR).toBe('BIOINFORMATICS_TOOL_ERROR');
    });

    it('should have correct RecommendationType values', () => {
      expect(RecommendationType.INCREASE_MEMORY).toBe('INCREASE_MEMORY');
      expect(RecommendationType.ADD_IAM_PERMISSION).toBe('ADD_IAM_PERMISSION');
      expect(RecommendationType.FIX_REFERENCE_GENOME_PATH).toBe('FIX_REFERENCE_GENOME_PATH');
    });
  });
});
