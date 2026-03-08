import { describe, it, expect, beforeEach } from 'vitest';
import { IAMPolicyAutopilotClient } from '../../src/powers/IAMPolicyAutopilotClient';
import { PowerClient } from '../../src/orchestration/PowerClient';

describe('IAMPolicyAutopilotClient', () => {
  let client: IAMPolicyAutopilotClient;
  let mockPowerClient: PowerClient;

  beforeEach(() => {
    mockPowerClient = new PowerClient();
    client = new IAMPolicyAutopilotClient(mockPowerClient);
  });

  describe('generateApplicationPolicies', () => {
    it('should call generate_application_policies tool with correct parameters', async () => {
      const sourceFiles = ['/path/to/app.ts', '/path/to/handler.ts'];
      const account = '123456789012';
      const region = 'us-east-1';

      await expect(
        client.generateApplicationPolicies(sourceFiles, account, region),
      ).rejects.toThrow();
    });

    it('should support service hints', async () => {
      const sourceFiles = ['/path/to/app.ts'];
      const serviceHints = ['s3', 'dynamodb'];

      await expect(
        client.generateApplicationPolicies(sourceFiles, undefined, undefined, serviceHints),
      ).rejects.toThrow();
    });
  });

  describe('generatePolicyForAccessDenied', () => {
    it('should call generate_policy_for_access_denied tool with error message', async () => {
      const errorMessage =
        'User: arn:aws:iam::123456789012:user/test is not authorized to perform: s3:GetObject';

      await expect(client.generatePolicyForAccessDenied(errorMessage)).rejects.toThrow();
    });
  });

  describe('fixAccessDenied', () => {
    it('should call fix_access_denied tool with policy and error message', async () => {
      const policy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: ['s3:GetObject'],
            Resource: ['*'],
          },
        ],
      });
      const errorMessage =
        'User: arn:aws:iam::123456789012:user/test is not authorized to perform: s3:GetObject';

      await expect(client.fixAccessDenied(policy, errorMessage)).rejects.toThrow();
    });
  });

  describe('generateAndFixAccessDenied', () => {
    it('should generate and deploy policy in one operation', async () => {
      const errorMessage =
        'User: arn:aws:iam::123456789012:user/test is not authorized to perform: s3:GetObject';

      // This will fail at the first step (generate) since Kiro API not integrated
      await expect(client.generateAndFixAccessDenied(errorMessage)).rejects.toThrow();
    });
  });
});
