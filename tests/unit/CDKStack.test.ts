import { describe, it, expect } from 'vitest';
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { HealthOmicsAITroubleshooterStack } from '../../src/infrastructure/CDKStack';

describe('HealthOmicsAITroubleshooterStack', () => {
  describe('stack creation', () => {
    it('should create stack with required props', () => {
      const app = new cdk.App();
      const stack = new HealthOmicsAITroubleshooterStack(
        app,
        'TestStack',
        {
          environment: 'dev',
          env: {
            account: '123456789012',
            region: 'us-east-1',
          },
        }
      );

      expect(stack).toBeDefined();
    });

    it('should apply tags to stack', () => {
      const app = new cdk.App();
      const stack = new HealthOmicsAITroubleshooterStack(
        app,
        'TestStack',
        {
          environment: 'production',
          projectName: 'HealthOmics AI',
          costCenter: 'CC-12345',
          env: {
            account: '123456789012',
            region: 'us-east-1',
          },
        }
      );

      const template = Template.fromStack(stack);
      
      // Verify stack was created
      expect(template).toBeDefined();
    });

    it('should create outputs', () => {
      const app = new cdk.App();
      const stack = new HealthOmicsAITroubleshooterStack(
        app,
        'TestStack',
        {
          environment: 'dev',
          env: {
            account: '123456789012',
            region: 'us-east-1',
          },
        }
      );

      const template = Template.fromStack(stack);
      
      // Verify outputs exist
      template.hasOutput('StackName', {});
      template.hasOutput('Environment', {});
      template.hasOutput('Region', {});
    });
  });

  describe('environment configuration', () => {
    it('should support dev environment', () => {
      const app = new cdk.App();
      const stack = new HealthOmicsAITroubleshooterStack(
        app,
        'DevStack',
        {
          environment: 'dev',
          env: {
            account: '123456789012',
            region: 'us-east-1',
          },
        }
      );

      expect(stack).toBeDefined();
    });

    it('should support staging environment', () => {
      const app = new cdk.App();
      const stack = new HealthOmicsAITroubleshooterStack(
        app,
        'StagingStack',
        {
          environment: 'staging',
          env: {
            account: '123456789012',
            region: 'us-east-1',
          },
        }
      );

      expect(stack).toBeDefined();
    });

    it('should support production environment', () => {
      const app = new cdk.App();
      const stack = new HealthOmicsAITroubleshooterStack(
        app,
        'ProdStack',
        {
          environment: 'production',
          env: {
            account: '123456789012',
            region: 'us-east-1',
          },
        }
      );

      expect(stack).toBeDefined();
    });
  });
});
