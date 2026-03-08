/**
 * Setup Wizard
 *
 * Guides users through system configuration and deployment
 */

import { SystemConfiguration, ValidationResult, DeploymentResult, ConnectivityTest } from '../types';

export interface ISetupWizard {
  // Wizard flow
  start(): Promise<SetupSession>;
  nextStep(session: SetupSession): Promise<SetupSession>;
  previousStep(session: SetupSession): Promise<SetupSession>;
  complete(session: SetupSession): Promise<void>;

  // Configuration
  collectConfiguration(session: SetupSession): Promise<SystemConfiguration>;
  validateConfiguration(config: SystemConfiguration): Promise<ValidationResult>;

  // Deployment
  deployInfrastructure(config: SystemConfiguration): Promise<DeploymentResult>;
  testConnectivity(config: SystemConfiguration): Promise<ConnectivityTest>;
}

export interface SetupSession {
  sessionId: string;
  currentStep: SetupStep;
  configuration: Partial<SystemConfiguration>;
  validationErrors: string[];
  progress: number; // 0-100
}

export enum SetupStep {
  WELCOME = 'WELCOME',
  AWS_CREDENTIALS = 'AWS_CREDENTIALS',
  REGION_SELECTION = 'REGION_SELECTION',
  S3_CONFIGURATION = 'S3_CONFIGURATION',
  NOTIFICATION_PREFERENCES = 'NOTIFICATION_PREFERENCES',
  IAM_POLICY_GENERATION = 'IAM_POLICY_GENERATION',
  CDK_DEPLOYMENT = 'CDK_DEPLOYMENT',
  CONNECTIVITY_TEST = 'CONNECTIVITY_TEST',
  COMPLETE = 'COMPLETE',
}

/**
 * Setup wizard implementation
 */
export class SetupWizard implements ISetupWizard {
  private sessions: Map<string, SetupSession> = new Map();

  /**
   * Start a new setup session
   */
  async start(): Promise<SetupSession> {
    const session: SetupSession = {
      sessionId: `setup-${Date.now()}`,
      currentStep: SetupStep.WELCOME,
      configuration: {},
      validationErrors: [],
      progress: 0,
    };

    this.sessions.set(session.sessionId, session);
    return session;
  }

  /**
   * Move to next step
   */
  async nextStep(session: SetupSession): Promise<SetupSession> {
    const steps = Object.values(SetupStep);
    const currentIndex = steps.indexOf(session.currentStep);

    if (currentIndex < steps.length - 1) {
      session.currentStep = steps[currentIndex + 1];
      session.progress = ((currentIndex + 1) / (steps.length - 1)) * 100;
    }

    this.sessions.set(session.sessionId, session);
    return session;
  }

  /**
   * Move to previous step
   */
  async previousStep(session: SetupSession): Promise<SetupSession> {
    const steps = Object.values(SetupStep);
    const currentIndex = steps.indexOf(session.currentStep);

    if (currentIndex > 0) {
      session.currentStep = steps[currentIndex - 1];
      session.progress = ((currentIndex - 1) / (steps.length - 1)) * 100;
    }

    this.sessions.set(session.sessionId, session);
    return session;
  }

  /**
   * Complete setup
   */
  async complete(session: SetupSession): Promise<void> {
    session.currentStep = SetupStep.COMPLETE;
    session.progress = 100;
    this.sessions.set(session.sessionId, session);
  }

  /**
   * Collect configuration from session
   */
  async collectConfiguration(
    session: SetupSession
  ): Promise<SystemConfiguration> {
    const config = session.configuration as SystemConfiguration;

    // Validate required fields
    if (!config.awsRegion) {
      throw new Error('AWS region is required');
    }

    return config;
  }

  /**
   * Validate configuration
   */
  async validateConfiguration(
    config: SystemConfiguration
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate AWS region
    if (!config.awsRegion) {
      errors.push('AWS region is required');
    }

    // Validate S3 bucket name format
    if (config.manifestLogsBucketName) {
      if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(config.manifestLogsBucketName)) {
        errors.push('Invalid S3 bucket name format');
      }
    }

    // Validate email format
    if (config.notificationEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.notificationEmail)) {
        errors.push('Invalid email format');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Deploy infrastructure (placeholder)
   */
  async deployInfrastructure(
    config: SystemConfiguration
  ): Promise<DeploymentResult> {
    // Placeholder - will integrate with CDKDeploymentManager
    return {
      success: true,
      stackId: 'stack-id',
      resources: [],
    };
  }

  /**
   * Test connectivity (placeholder)
   */
  async testConnectivity(
    config: SystemConfiguration
  ): Promise<ConnectivityTest> {
    // Placeholder - will implement actual connectivity tests
    return {
      healthOmicsAccess: true,
      cloudWatchAccess: true,
      cloudTrailAccess: true,
      s3Access: true,
      agentAccess: true,
      errors: [],
    };
  }
}
