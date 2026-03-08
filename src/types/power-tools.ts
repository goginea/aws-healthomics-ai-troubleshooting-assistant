/**
 * Type definitions for existing Power tool responses
 * 
 * These types represent the responses from tools in installed Powers:
 * - aws-healthomics
 * - aws-observability
 * - aws-agentcore
 * - iam-policy-autopilot-power
 * - aws-infrastructure-as-code
 */

// ============================================================================
// HealthOmics Power Tool Responses
// ============================================================================

export interface DiagnoseRunFailureResponse {
  runId: string;
  status: string;
  failureReason?: string;
  runUuid?: string;
  engineLogs?: string;
  manifestLogs?: string;
  failedTasks?: FailedTaskInfo[];
  recommendations?: string[];
}

export interface FailedTaskInfo {
  taskId: string;
  taskName: string;
  exitCode?: number;
  logs?: string;
}

export interface AnalyzeRunPerformanceResponse {
  runId: string;
  tasks: TaskPerformanceMetrics[];
  recommendations: PerformanceRecommendation[];
  summary?: {
    totalCost?: number;
    totalDuration?: number;
    optimizationOpportunities?: number;
  };
}

export interface TaskPerformanceMetrics {
  taskId: string;
  taskName: string;
  cpuUtilization: ResourceMetric;
  memoryUtilization: ResourceMetric;
  diskUtilization?: ResourceMetric;
  duration: number;
  cost?: number;
}

export interface ResourceMetric {
  allocated: number;
  peak: number;
  average: number;
  unit: string;
  utilizationPercentage?: number;
}

export interface PerformanceRecommendation {
  taskName: string;
  resourceType: 'CPU' | 'MEMORY' | 'DISK';
  currentValue: number;
  recommendedValue: number;
  reason: string;
  estimatedSavings?: number;
}

export interface GetRunResponse {
  id: string;
  arn: string;
  name?: string;
  status: 'PENDING' | 'STARTING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  workflowId: string;
  workflowType: 'NEXTFLOW' | 'WDL' | 'CWL';
  roleArn: string;
  creationTime: string;
  startTime?: string;
  stopTime?: string;
  outputUri: string;
  parameters?: Record<string, any>;
  failureReason?: string;
}

export interface ListRunTasksResponse {
  items: RunTaskSummary[];
  nextToken?: string;
}

export interface RunTaskSummary {
  taskId: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  cpus?: number;
  memory?: number;
  gpus?: number;
  startTime?: string;
  stopTime?: string;
}

// ============================================================================
// Observability Power Tool Responses
// ============================================================================

export interface AuditServicesResponse {
  findings: AuditFinding[];
  services: ServiceAuditResult[];
  summary: {
    totalServices: number;
    criticalFindings: number;
    warningFindings: number;
    infoFindings: number;
  };
  nextToken?: string;
}

export interface AuditFinding {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  affectedServices: string[];
  recommendations: string[];
  evidence?: any;
}

export interface ServiceAuditResult {
  serviceName: string;
  environment: string;
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  metrics?: {
    latency?: number;
    errorRate?: number;
    faultRate?: number;
    availability?: number;
  };
  findings: AuditFinding[];
}

export interface SearchTransactionSpansResponse {
  results: TransactionSpan[];
  statistics?: {
    totalSpans: number;
    errorSpans: number;
    faultSpans: number;
  };
}

export interface TransactionSpan {
  traceId: string;
  spanId: string;
  timestamp: string;
  duration: number;
  serviceName: string;
  operation: string;
  statusCode?: number;
  error?: boolean;
  fault?: boolean;
  attributes?: Record<string, any>;
}

export interface LookupEventsResponse {
  events: CloudTrailEvent[];
  nextToken?: string;
}

export interface CloudTrailEvent {
  eventId: string;
  eventName: string;
  eventTime: string;
  eventSource: string;
  username?: string;
  resources?: CloudTrailResource[];
  errorCode?: string;
  errorMessage?: string;
  requestParameters?: any;
  responseElements?: any;
}

export interface CloudTrailResource {
  resourceType: string;
  resourceName: string;
  arn?: string;
}

// ============================================================================
// AgentCore Power Tool Responses
// ============================================================================

export interface SearchAgentCoreDocsResponse {
  results: DocSearchResult[];
}

export interface DocSearchResult {
  url: string;
  title: string;
  score: number;
  snippet: string;
}

export interface FetchAgentCoreDocResponse {
  url: string;
  title: string;
  content: string;
}

// ============================================================================
// IAM Policy Autopilot Power Tool Responses
// ============================================================================

export interface GenerateApplicationPoliciesResponse {
  policies: GeneratedPolicy[];
  summary: {
    totalPermissions: number;
    services: string[];
  };
}

export interface GeneratedPolicy {
  policyName: string;
  policyDocument: IAMPolicyDocument;
  description: string;
  services: string[];
}

export interface IAMPolicyDocument {
  Version: string;
  Statement: IAMPolicyStatement[];
}

export interface IAMPolicyStatement {
  Effect: 'Allow' | 'Deny';
  Action: string[];
  Resource: string[];
  Condition?: Record<string, any>;
}

export interface GeneratePolicyForAccessDeniedResponse {
  policy: IAMPolicyDocument;
  missingPermissions: string[];
  recommendation: string;
}

export interface FixAccessDeniedResponse {
  success: boolean;
  policyName: string;
  roleArn: string;
  message: string;
}

// ============================================================================
// AWS CDK Power Tool Responses
// ============================================================================

export interface ValidateCloudFormationTemplateResponse {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  rule: string;
  message: string;
  location?: {
    path: string;
    line?: number;
  };
  remediation?: string;
}

export interface ValidationWarning {
  rule: string;
  message: string;
  location?: {
    path: string;
    line?: number;
  };
}

export interface CheckTemplateComplianceResponse {
  compliant: boolean;
  violations: ComplianceViolation[];
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
  };
}

export interface ComplianceViolation {
  rule: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  resource: string;
  message: string;
  remediation: string;
}
