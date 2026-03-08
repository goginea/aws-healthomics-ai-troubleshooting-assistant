// Analysis and recommendation type definitions

export interface RootCauseAnalysis {
  runId: string;
  rootCauses: RootCause[];
  evidence: Evidence[];
  timestamp: Date;
  confidence: number;
}

export interface RootCause {
  type: RootCauseType;
  description: string;
  confidence: number;
  affectedTasks: string[];
  evidence: Evidence[];
  genomicsContext?: GenomicsContext;
}

export enum RootCauseType {
  RESOURCE_EXHAUSTION = 'RESOURCE_EXHAUSTION',
  IAM_PERMISSION_DENIED = 'IAM_PERMISSION_DENIED',
  ECR_IMAGE_PULL_FAILURE = 'ECR_IMAGE_PULL_FAILURE',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  TIMEOUT = 'TIMEOUT',
  S3_ACCESS_ERROR = 'S3_ACCESS_ERROR',
  BIOINFORMATICS_TOOL_ERROR = 'BIOINFORMATICS_TOOL_ERROR',
  REFERENCE_GENOME_ERROR = 'REFERENCE_GENOME_ERROR',
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
  HEALTHOMICS_DIAGNOSE_TOOL = 'HEALTHOMICS_DIAGNOSE_TOOL',
  HEALTHOMICS_PERFORMANCE_TOOL = 'HEALTHOMICS_PERFORMANCE_TOOL',
  OBSERVABILITY_AUDIT = 'OBSERVABILITY_AUDIT',
  CLOUDWATCH_LOGS = 'CLOUDWATCH_LOGS',
  CLOUDWATCH_METRICS = 'CLOUDWATCH_METRICS',
  CLOUDTRAIL = 'CLOUDTRAIL',
  XRAY = 'XRAY',
  TRANSACTION_SPANS = 'TRANSACTION_SPANS',
  RUN_ANALYZER = 'RUN_ANALYZER',
  CUSTOM_KNOWLEDGE_BASE = 'CUSTOM_KNOWLEDGE_BASE',
}

export interface GenomicsContext {
  workflowType?: 'WGS' | 'WES' | 'RNA-Seq' | 'Variant Calling' | 'Other';
  bioinformaticsTool?: string; // e.g., "GATK", "BWA-MEM2", "Samtools"
  referenceGenome?: string; // e.g., "hg38", "GRCh38"
  commonPattern?: string; // Known pattern from genomics knowledge base
  organizationPattern?: string; // Pattern from custom knowledge base
}

export interface Recommendation {
  type: RecommendationType;
  description: string;
  actions: Action[];
  confidence: number;
  priority: number;
  genomicsRationale?: string;
}

export enum RecommendationType {
  INCREASE_MEMORY = 'INCREASE_MEMORY',
  INCREASE_CPU = 'INCREASE_CPU',
  ADD_IAM_PERMISSION = 'ADD_IAM_PERMISSION',
  FIX_ECR_URI = 'FIX_ECR_URI',
  UPDATE_CONFIGURATION = 'UPDATE_CONFIGURATION',
  CHANGE_INSTANCE_TYPE = 'CHANGE_INSTANCE_TYPE',
  FIX_REFERENCE_GENOME_PATH = 'FIX_REFERENCE_GENOME_PATH',
  ADJUST_TOOL_PARAMETERS = 'ADJUST_TOOL_PARAMETERS',
}

export interface Action {
  description: string;
  command?: string;
  parameters?: Record<string, any>;
  workflowDefinitionChange?: WorkflowDefinitionChange;
}

export interface WorkflowDefinitionChange {
  filePath: string;
  lineNumber?: number;
  currentValue: string;
  recommendedValue: string;
  diff?: string;
}

