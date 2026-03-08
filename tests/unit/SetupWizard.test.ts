import { describe, it, expect, beforeEach } from 'vitest';
import { SetupWizard, SetupStep } from '../../src/setup/SetupWizard';
import { SystemConfiguration } from '../../src/types';

describe('SetupWizard', () => {
  let wizard: SetupWizard;

  beforeEach(() => {
    wizard = new SetupWizard();
  });

  describe('start', () => {
    it('should start a new setup session', async () => {
      const session = await wizard.start();

      expect(session.sessionId).toContain('setup-');
      expect(session.currentStep).toBe(SetupStep.WELCOME);
      expect(session.progress).toBe(0);
    });
  });

  describe('nextStep', () => {
    it('should move to next step', async () => {
      let session = await wizard.start();
      session = await wizard.nextStep(session);

      expect(session.currentStep).toBe(SetupStep.AWS_CREDENTIALS);
      expect(session.progress).toBeGreaterThan(0);
    });

    it('should not go beyond COMPLETE step', async () => {
      let session = await wizard.start();
      
      // Move to last step
      while (session.currentStep !== SetupStep.COMPLETE) {
        session = await wizard.nextStep(session);
      }

      const finalStep = session.currentStep;
      session = await wizard.nextStep(session);

      expect(session.currentStep).toBe(finalStep);
    });
  });

  describe('previousStep', () => {
    it('should move to previous step', async () => {
      let session = await wizard.start();
      session = await wizard.nextStep(session);
      session = await wizard.previousStep(session);

      expect(session.currentStep).toBe(SetupStep.WELCOME);
    });

    it('should not go before WELCOME step', async () => {
      let session = await wizard.start();
      session = await wizard.previousStep(session);

      expect(session.currentStep).toBe(SetupStep.WELCOME);
    });
  });

  describe('validateConfiguration', () => {
    it('should validate complete configuration', async () => {
      const config: SystemConfiguration = {
        awsRegion: 'us-east-1',
        awsProfile: 'default',
        manifestLogsBucketName: 'my-manifest-logs',
        notificationEmail: 'user@example.com',
        environment: 'dev',
      };

      const result = await wizard.validateConfiguration(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', async () => {
      const config: SystemConfiguration = {
        awsProfile: 'default',
        environment: 'dev',
      } as SystemConfiguration;

      const result = await wizard.validateConfiguration(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate bucket name format', async () => {
      const config: SystemConfiguration = {
        awsRegion: 'us-east-1',
        awsProfile: 'default',
        manifestLogsBucketName: 'Invalid_Bucket_Name!',
        environment: 'dev',
      };

      const result = await wizard.validateConfiguration(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('bucket name'))).toBe(true);
    });

    it('should validate email format', async () => {
      const config: SystemConfiguration = {
        awsRegion: 'us-east-1',
        awsProfile: 'default',
        notificationEmail: 'invalid-email',
        environment: 'dev',
      };

      const result = await wizard.validateConfiguration(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('email'))).toBe(true);
    });
  });

  describe('deployInfrastructure', () => {
    it('should deploy infrastructure', async () => {
      const config: SystemConfiguration = {
        awsRegion: 'us-east-1',
        awsProfile: 'default',
        environment: 'dev',
      };

      const result = await wizard.deployInfrastructure(config);

      expect(result.success).toBe(true);
      expect(result.stackId).toBeDefined();
    });
  });

  describe('testConnectivity', () => {
    it('should test connectivity to AWS services', async () => {
      const config: SystemConfiguration = {
        awsRegion: 'us-east-1',
        awsProfile: 'default',
        environment: 'dev',
      };

      const result = await wizard.testConnectivity(config);

      expect(result.healthOmicsAccess).toBe(true);
      expect(result.cloudWatchAccess).toBe(true);
      expect(result.cloudTrailAccess).toBe(true);
      expect(result.s3Access).toBe(true);
      expect(result.agentAccess).toBe(true);
    });
  });
});
