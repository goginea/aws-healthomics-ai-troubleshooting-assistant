import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BioinformaticsAgent } from '../../src/agent/BioinformaticsAgent';
import type { PowerClient } from '../../src/orchestration/PowerClient';
import type { HealthOmicsPowerClient } from '../../src/powers/HealthOmicsPowerClient';
import type { ObservabilityPowerClient } from '../../src/powers/ObservabilityPowerClient';
import type { IAMPolicyAutopilotClient } from '../../src/powers/IAMPolicyAutopilotClient';

describe('BioinformaticsAgent', () => {
  let agent: BioinformaticsAgent;
  let mockPowerClient: PowerClient;
  let mockHealthOmicsClient: HealthOmicsPowerClient;
  let mockObservabilityClient: ObservabilityPowerClient;
  let mockIAMClient: IAMPolicyAutopilotClient;

  beforeEach(() => {
    // Create mock clients
    mockPowerClient = {} as PowerClient;
    mockHealthOmicsClient = {
      diagnoseRunFailure: vi.fn(),
      analyzeRunPerformance: vi.fn(),
      getRun: vi.fn(),
    } as any;
    mockObservabilityClient = {
      auditServices: vi.fn(),
    } as any;
    mockIAMClient = {
      fixAccessDenied: vi.fn(),
    } as any;

    agent = new BioinformaticsAgent(
      mockPowerClient,
      mockHealthOmicsClient,
      mockObservabilityClient,
      mockIAMClient,
    );
  });

  describe('constructor', () => {
    it('should initialize with agent configuration', () => {
      const config = agent.getDeploymentConfiguration();
      expect(config.agentName).toBe('HealthOmicsWorkflowTroubleshooter');
      expect(config.modelId).toBe('anthropic.claude-3-5-sonnet-20241022-v2:0');
      expect(config.instruction).toContain('bioinformatics troubleshooting assistant');
    });

    it('should create 5 agent tools', () => {
      const config = agent.getDeploymentConfiguration();
      expect(config.tools).toHaveLength(5);
      expect(config.tools.map((t) => t.name)).toEqual([
        'diagnose_workflow_failure',
        'analyze_workflow_performance',
        'get_workflow_run_status',
        'audit_service_health',
        'fix_iam_permission_error',
      ]);
    });

    it('should configure memory with semantic strategies', () => {
      const config = agent.getDeploymentConfiguration();
      expect(config.memory).toBeDefined();
      expect(config.memory?.strategies).toHaveLength(2);
      expect(config.memory?.strategies[0].type).toBe('SEMANTIC');
      expect(config.memory?.enableSemanticExtraction).toBe(true);
    });

    it('should configure knowledge base with genomics namespaces', () => {
      const config = agent.getDeploymentConfiguration();
      expect(config.knowledgeBase).toBeDefined();
      expect(config.knowledgeBase?.knowledgeBaseNamespaces).toContain('/genomics/');
      expect(config.knowledgeBase?.prioritizeCustomKnowledge).toBe(true);
    });
  });

  describe('tool handlers', () => {
    it('should bind diagnose_workflow_failure to HealthOmics client', async () => {
      const mockResult = { runId: 'test-run', status: 'FAILED' };
      mockHealthOmicsClient.diagnoseRunFailure = vi.fn().mockResolvedValue(mockResult);

      const config = agent.getDeploymentConfiguration();
      const tool = config.tools.find((t) => t.name === 'diagnose_workflow_failure');
      expect(tool).toBeDefined();

      const result = await tool!.handler({ run_id: 'test-run', detailed: false });
      expect(result).toEqual(mockResult);
      expect(mockHealthOmicsClient.diagnoseRunFailure).toHaveBeenCalledWith('test-run', false);
    });

    it('should bind analyze_workflow_performance to HealthOmics client', async () => {
      const mockResult = { recommendations: [] };
      mockHealthOmicsClient.analyzeRunPerformance = vi.fn().mockResolvedValue(mockResult);

      const config = agent.getDeploymentConfiguration();
      const tool = config.tools.find((t) => t.name === 'analyze_workflow_performance');
      expect(tool).toBeDefined();

      const result = await tool!.handler({ run_ids: ['run1', 'run2'], headroom: 0.2 });
      expect(result).toEqual(mockResult);
      expect(mockHealthOmicsClient.analyzeRunPerformance).toHaveBeenCalledWith(['run1', 'run2'], 0.2);
    });

    it('should bind get_workflow_run_status to HealthOmics client', async () => {
      const mockResult = { id: 'test-run', status: 'RUNNING' };
      mockHealthOmicsClient.getRun = vi.fn().mockResolvedValue(mockResult);

      const config = agent.getDeploymentConfiguration();
      const tool = config.tools.find((t) => t.name === 'get_workflow_run_status');
      expect(tool).toBeDefined();

      const result = await tool!.handler({ run_id: 'test-run' });
      expect(result).toEqual(mockResult);
      expect(mockHealthOmicsClient.getRun).toHaveBeenCalledWith('test-run');
    });

    it('should bind audit_service_health to Observability client', async () => {
      const mockResult = { services: [] };
      mockObservabilityClient.auditServices = vi.fn().mockResolvedValue(mockResult);

      const config = agent.getDeploymentConfiguration();
      const tool = config.tools.find((t) => t.name === 'audit_service_health');
      expect(tool).toBeDefined();

      const result = await tool!.handler({ service_name: '*healthomics*', use_comprehensive_audit: true });
      expect(result).toEqual(mockResult);
      expect(mockObservabilityClient.auditServices).toHaveBeenCalledWith('*healthomics*', true);
    });

    it('should bind fix_iam_permission_error to IAM client', async () => {
      const mockResult = { policy: {} };
      mockIAMClient.generateAndFixAccessDenied = vi.fn().mockResolvedValue(mockResult);

      const config = agent.getDeploymentConfiguration();
      const tool = config.tools.find((t) => t.name === 'fix_iam_permission_error');
      expect(tool).toBeDefined();

      const result = await tool!.handler({ error_message: 'AccessDenied: omics:GetRun' });
      expect(result).toEqual(mockResult);
      expect(mockIAMClient.generateAndFixAccessDenied).toHaveBeenCalledWith('AccessDenied: omics:GetRun');
    });
  });

  describe('deploy', () => {
    it('should create deployment with correct configuration', async () => {
      const deploymentConfig = {
        region: 'us-east-1',
        agentName: 'TestAgent',
        memoryId: 'mem-123',
        knowledgeBaseId: 'kb-456',
      };

      const deployment = await agent.deploy(deploymentConfig);

      expect(deployment.agentId).toContain('TestAgent');
      expect(deployment.agentArn).toContain('us-east-1');
      expect(deployment.agentArn).toContain('TestAgent');
      expect(deployment.status).toBe('CREATING');
      expect(deployment.agentVersion).toBe('1.0.0');
    });

    it('should update memory configuration during deployment', async () => {
      const deploymentConfig = {
        region: 'us-east-1',
        agentName: 'TestAgent',
        memoryId: 'mem-123',
      };

      await agent.deploy(deploymentConfig);

      const config = agent.getDeploymentConfiguration();
      expect(config.memory?.memoryId).toBe('mem-123');
    });

    it('should update knowledge base configuration during deployment', async () => {
      const deploymentConfig = {
        region: 'us-east-1',
        agentName: 'TestAgent',
        knowledgeBaseId: 'kb-456',
      };

      await agent.deploy(deploymentConfig);

      const config = agent.getDeploymentConfiguration();
      expect(config.knowledgeBase?.baseKnowledgeBaseId).toBe('kb-456');
    });

    it('should store deployment result', async () => {
      const deploymentConfig = {
        region: 'us-east-1',
        agentName: 'TestAgent',
      };

      await agent.deploy(deploymentConfig);

      const deployment = agent.getDeployment();
      expect(deployment).toBeDefined();
      expect(deployment?.agentId).toContain('TestAgent');
    });
  });

  describe('processQuery', () => {
    it('should throw error indicating Task 4.4 not implemented', async () => {
      await expect(agent.processQuery('test query', 'user1')).rejects.toThrow(
        'processQuery not yet implemented - Task 4.4',
      );
    });
  });

  describe('maintainContext', () => {
    it('should throw error indicating Task 4.3 not implemented', () => {
      const context = {
        conversationId: 'conv1',
        userId: 'user1',
        previousQueries: [],
        timestamp: new Date(),
      };

      expect(() => agent.maintainContext('user1', context)).toThrow(
        'maintainContext not yet implemented - Task 4.3',
      );
    });
  });
});

