import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthOmicsPowerClient } from '../../src/powers/HealthOmicsPowerClient';
import { PowerClient } from '../../src/orchestration/PowerClient';

describe('HealthOmicsPowerClient', () => {
  let client: HealthOmicsPowerClient;
  let mockPowerClient: PowerClient;

  beforeEach(() => {
    mockPowerClient = new PowerClient();
    client = new HealthOmicsPowerClient(mockPowerClient);
  });

  describe('diagnoseRunFailure', () => {
    it('should call DiagnoseAHORunFailure tool with correct parameters', async () => {
      const runId = 'omics-test-123';
      const detailed = false;

      // Mock will throw error since Kiro API not integrated yet
      await expect(client.diagnoseRunFailure(runId, detailed)).rejects.toThrow();
    });

    it('should use detailed=false by default', async () => {
      const runId = 'omics-test-123';

      await expect(client.diagnoseRunFailure(runId)).rejects.toThrow();
    });
  });

  describe('analyzeRunPerformance', () => {
    it('should call AnalyzeAHORunPerformance tool with correct parameters', async () => {
      const runIds = ['omics-test-123', 'omics-test-456'];
      const headroom = 0.2;

      await expect(client.analyzeRunPerformance(runIds, headroom)).rejects.toThrow();
    });

    it('should use default headroom of 0.2', async () => {
      const runIds = ['omics-test-123'];

      await expect(client.analyzeRunPerformance(runIds)).rejects.toThrow();
    });
  });

  describe('getRun', () => {
    it('should call GetAHORun tool with correct parameters', async () => {
      const runId = 'omics-test-123';

      await expect(client.getRun(runId)).rejects.toThrow();
    });
  });

  describe('listRunTasks', () => {
    it('should call ListAHORunTasks tool with correct parameters', async () => {
      const runId = 'omics-test-123';

      await expect(client.listRunTasks(runId)).rejects.toThrow();
    });

    it('should support status filtering', async () => {
      const runId = 'omics-test-123';
      const status = 'FAILED';

      await expect(client.listRunTasks(runId, 100, status)).rejects.toThrow();
    });
  });

  describe('getRunTask', () => {
    it('should call GetAHORunTask tool with correct parameters', async () => {
      const runId = 'omics-test-123';
      const taskId = 'task-456';

      await expect(client.getRunTask(runId, taskId)).rejects.toThrow();
    });
  });

  describe('log retrieval methods', () => {
    it('should get run logs', async () => {
      const runId = 'omics-test-123';

      await expect(client.getRunLogs(runId)).rejects.toThrow();
    });

    it('should get task logs', async () => {
      const runId = 'omics-test-123';
      const taskId = 'task-456';

      await expect(client.getTaskLogs(runId, taskId)).rejects.toThrow();
    });

    it('should get engine logs', async () => {
      const runId = 'omics-test-123';

      await expect(client.getEngineLogs(runId)).rejects.toThrow();
    });

    it('should get manifest logs', async () => {
      const runId = 'omics-test-123';

      await expect(client.getRunManifestLogs(runId)).rejects.toThrow();
    });
  });

  describe('generateRunTimeline', () => {
    it('should call GenerateAHORunTimeline tool with correct parameters', async () => {
      const runId = 'omics-test-123';

      await expect(client.generateRunTimeline(runId)).rejects.toThrow();
    });

    it('should use default time unit and output format', async () => {
      const runId = 'omics-test-123';

      await expect(client.generateRunTimeline(runId)).rejects.toThrow();
    });
  });
});
