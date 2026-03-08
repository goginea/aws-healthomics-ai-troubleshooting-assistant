import { describe, it, expect } from 'vitest';
import { PowerClient } from '../../src/orchestration/PowerClient';
import type { PowerToolCall } from '../../src/orchestration/PowerClient';

describe('PowerClient', () => {
  const client = new PowerClient();

  describe('isPowerAvailable', () => {
    it('should check if a Power is available', async () => {
      const available = await client.isPowerAvailable('aws-healthomics');
      expect(typeof available).toBe('boolean');
    });
  });

  describe('callTool', () => {
    it('should handle Power tool calls', async () => {
      const call: PowerToolCall = {
        powerName: 'aws-healthomics',
        serverName: 'aws-healthomics',
        toolName: 'GetAHORun',
        arguments: { run_id: 'test-run-123' },
      };

      const response = await client.callTool(call);
      
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('metadata');
      expect(response.metadata).toHaveProperty('powerName', 'aws-healthomics');
      expect(response.metadata).toHaveProperty('toolName', 'GetAHORun');
    });

    it('should include metadata in responses', async () => {
      const call: PowerToolCall = {
        powerName: 'test-power',
        serverName: 'test-server',
        toolName: 'test-tool',
        arguments: {},
      };

      const response = await client.callTool(call);
      
      expect(response.metadata).toBeDefined();
      expect(response.metadata?.duration).toBeGreaterThanOrEqual(0);
      expect(response.metadata?.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('callToolsParallel', () => {
    it('should call multiple tools in parallel', async () => {
      const calls: PowerToolCall[] = [
        {
          powerName: 'aws-healthomics',
          serverName: 'aws-healthomics',
          toolName: 'GetAHORun',
          arguments: { run_id: 'run-1' },
        },
        {
          powerName: 'aws-healthomics',
          serverName: 'aws-healthomics',
          toolName: 'GetAHORun',
          arguments: { run_id: 'run-2' },
        },
      ];

      const responses = await client.callToolsParallel(calls);
      
      expect(responses).toHaveLength(2);
      expect(responses[0]).toHaveProperty('success');
      expect(responses[1]).toHaveProperty('success');
    });
  });

  describe('callToolsSequential', () => {
    it('should call multiple tools sequentially', async () => {
      const calls: PowerToolCall[] = [
        {
          powerName: 'aws-healthomics',
          serverName: 'aws-healthomics',
          toolName: 'GetAHORun',
          arguments: { run_id: 'run-1' },
        },
        {
          powerName: 'aws-observability',
          serverName: 'awslabs.cloudwatch-applicationsignals-mcp-server',
          toolName: 'audit_services',
          arguments: { service_targets: '[]' },
        },
      ];

      const responses = await client.callToolsSequential(calls);
      
      expect(responses).toHaveLength(2);
      expect(responses[0].metadata?.powerName).toBe('aws-healthomics');
      expect(responses[1].metadata?.powerName).toBe('aws-observability');
    });
  });
});
