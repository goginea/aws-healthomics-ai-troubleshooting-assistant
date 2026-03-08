// Infrastructure and deployment type definitions
// To be implemented in Task 1

export interface SystemConfiguration {
  region: string;
  s3BucketName: string;
  agentName: string;
  notificationPreferences: NotificationPreferences;
  environment: 'dev' | 'staging' | 'production';
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

// Additional types to be added in Task 1
