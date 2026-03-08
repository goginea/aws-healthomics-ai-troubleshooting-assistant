import { describe, it, expect, beforeEach } from 'vitest';
import { CDKDeploymentManager } from '../../src/infrastructure/CDKDeploymentManager';

describe('CDKDeploymentManager', () => {
  let manager: CDKDeploymentManager;

  beforeEach(() => {
    manager = new CDKDeploymentManager();
  });

  describe('deploy', () => {
    it('should deploy stack successfully', async () => {
      const result = await manager.deploy('TestStack');

      expect(result.success).toBe(true);
      expect(result.stackId).toBeDefined();
      expect(result.resources).toBeDefined();
      expect(result.resources.length).toBeGreaterThan(0);
    });
  });

  describe('rollback', () => {
    it('should rollback failed deployment', async () => {
      const result = await manager.rollback('FailedStack');

      expect(result).toBeDefined();
      expect(result.stackId).toBe('FailedStack');
    });
  });

  describe('getDeploymentStatus', () => {
    it('should get deployment status', async () => {
      const status = await manager.getDeploymentStatus('TestStack');

      expect(status.stackName).toBe('TestStack');
      expect(status.status).toBeDefined();
      expect(status.lastUpdated).toBeInstanceOf(Date);
    });
  });
});
