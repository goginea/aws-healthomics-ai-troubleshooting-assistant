// Infrastructure and deployment type definitions

export interface SystemConfiguration {
  region: string;
  s3BucketName: string;
  agentName: string;
  notificationPreferences: NotificationPreferences;
  environment: 'dev' | 'staging' | 'production';
  awsAccountId?: string;
  awsProfile?: string;
}

export interface NotificationPreferences {
  enableProactiveAlerts: boolean;
  criticalityThreshold: 'HIGH' | 'MEDIUM' | 'LOW';
  workflowNameFilters?: string[];
}

export interface DeploymentResult {
  success: boolean;
  stackId?: string;
  agentId?: string;
  resources: DeployedResource[];
  errors?: string[];
}

export interface DeployedResource {
  type: string;
  id: string;
  arn: string;
  status: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  remediation: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface ConnectivityTest {
  healthOmicsAccess: boolean;
  cloudWatchAccess: boolean;
  cloudTrailAccess: boolean;
  s3Access: boolean;
  agentAccess: boolean;
  bedrockAccess: boolean;
  errors: string[];
}

