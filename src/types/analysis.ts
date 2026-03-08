// Analysis and recommendation type definitions
// To be implemented in Task 1

export interface RootCauseAnalysis {
  runId: string;
  rootCauses: RootCause[];
  evidence: Evidence[];
  timestamp: Date;
}

export interface RootCause {
  type: RootCauseType;
  description: string;
  confidence: number;
  affectedTasks: string[];
  evidence: Evidence[];
}

export enum RootCauseType {
  RESOURCE_EXHAUSTION = 'RESOURCE_EXHAUSTION',
  IAM_PERMISSION_DENIED = 'IAM_PERMISSION_DENIED',
  ECR_IMAGE_PULL_FAILURE = 'ECR_IMAGE_PULL_FAILURE',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  TIMEOUT = 'TIMEOUT',
  S3_ACCESS_ERROR = 'S3_ACCESS_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface Evidence {
  source: EvidenceSource;
  data: any;
  timestamp: Date;
  relevance: number;
}

export enum EvidenceSource {
  HEALTHOMICS_API = 'HEALTHOMICS_API',
  CLOUDWATCH_LOGS = 'CLOUDWATCH_LOGS',
  CLOUDWATCH_METRICS = 'CLOUDWATCH_METRICS',
  CLOUDTRAIL = 'CLOUDTRAIL',
  XRAY = 'XRAY',
  RUN_ANALYZER = 'RUN_ANALYZER',
}

export interface Recommendation {
  type: RecommendationType;
  description: string;
  actions: Action[];
  confidence: number;
  priority: number;
}

export enum RecommendationType {
  INCREASE_MEMORY = 'INCREASE_MEMORY',
  ADD_IAM_PERMISSION = 'ADD_IAM_PERMISSION',
  FIX_ECR_URI = 'FIX_ECR_URI',
  UPDATE_CONFIGURATION = 'UPDATE_CONFIGURATION',
  CHANGE_INSTANCE_TYPE = 'CHANGE_INSTANCE_TYPE',
}

export interface Action {
  description: string;
  command?: string;
  parameters?: Record<string, any>;
}

// Additional types to be added in Task 1
