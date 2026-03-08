/**
 * Knowledge Base type definitions
 */

export interface KnowledgeSource {
  id: string;
  name: string;
  type: KnowledgeSourceType;
  namespace: string;
  configuration: KnowledgeSourceConfig;
  status: 'ACTIVE' | 'INDEXING' | 'FAILED' | 'DISABLED';
  lastUpdated: Date;
  documentCount: number;
}

export enum KnowledgeSourceType {
  SHAREPOINT = 'SHAREPOINT',
  CONFLUENCE = 'CONFLUENCE',
  FILE_SYSTEM = 'FILE_SYSTEM',
  S3_BUCKET = 'S3_BUCKET',
  WIKI = 'WIKI',
  HISTORICAL_LOGS = 'HISTORICAL_LOGS',
  CUSTOM_API = 'CUSTOM_API',
}

export interface KnowledgeSourceConfig {
  refreshInterval?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
  sharePoint?: SharePointConfig;
  confluence?: ConfluenceConfig;
  fileSystem?: FileSystemConfig;
  s3?: S3Config;
}

export interface SharePointConfig {
  siteUrl: string;
  libraryName: string;
  folderPath?: string;
  authentication: {
    type: 'OAUTH' | 'SERVICE_PRINCIPAL';
    credentials: Record<string, string>;
  };
}

export interface ConfluenceConfig {
  baseUrl: string;
  spaceKey: string;
  authentication: {
    type: 'BASIC' | 'OAUTH' | 'PAT';
    credentials: Record<string, string>;
  };
}

export interface FileSystemConfig {
  basePath: string;
  fileExtensions: string[];
  recursive: boolean;
}

export interface S3Config {
  bucket: string;
  prefix: string;
  region: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  source: string;
}

export interface DocumentMetadata {
  author?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  tags?: string[];
  category?: string;
  customFields?: Record<string, any>;
}

export interface HistoricalTroubleshootingData {
  workflowRunId: string;
  failureType: string;
  rootCause: string;
  resolution: string;
  resolutionTime: number;
  timestamp: Date;
  workflowType: string;
  taskName?: string;
}

export interface IngestionResult {
  success: boolean;
  documentsProcessed: number;
  documentsFailed: number;
  indexingJobId?: string;
  errors?: string[];
}

export interface KnowledgeSearchResult {
  documentId: string;
  title: string;
  snippet: string;
  relevanceScore: number;
  namespace: string;
  source: string;
}

export interface KnowledgeBaseMetrics {
  totalDocuments: number;
  documentsBySource: Record<string, number>;
  documentsByNamespace: Record<string, number>;
  lastIndexingTime: Date;
  queriesUsingCustomKnowledge: number;
  averageRelevanceScore: number;
}

export interface SemanticExtractionConfig {
  enabled: boolean;
  extractionModel: string;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
}

export interface KnowledgeSourceResult {
  sourceId: string;
  status: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
