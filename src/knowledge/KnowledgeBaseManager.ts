/**
 * Knowledge Base Manager
 *
 * Manages custom knowledge sources and integrates with AgentCore Memory
 * for semantic storage and retrieval of organization-specific documentation.
 */

import {
  KnowledgeSource,
  KnowledgeSourceType,
  KnowledgeSourceConfig,
  KnowledgeSourceResult,
  Document,
  HistoricalTroubleshootingData,
  IngestionResult,
  KnowledgeSearchResult,
  ValidationResult,
  KnowledgeBaseMetrics,
  MemoryStrategy,
  SemanticExtractionConfig,
  SharePointConfig,
  ConfluenceConfig,
} from "../types";
import { SharePointConnector } from "./connectors/SharePointConnector";
import { ConfluenceConnector } from "./connectors/ConfluenceConnector";
import { FileSystemConnector } from "./connectors/FileSystemConnector";
import { S3Connector } from "./connectors/S3Connector";
import { HistoricalDataProcessor } from "./HistoricalDataProcessor";
import { AgentCoreMemoryClient } from "./AgentCoreMemoryClient";
import { KnowledgePrioritizer } from "./KnowledgePrioritizer";
import {
  KnowledgeBaseVersioning,
  Snapshot,
  RollbackResult,
} from "./KnowledgeBaseVersioning";

/**
 * Interface for managing custom knowledge bases
 */
export interface IKnowledgeBaseManager {
  // Knowledge source management
  addKnowledgeSource(source: KnowledgeSource): Promise<KnowledgeSourceResult>;
  updateKnowledgeSource(
    sourceId: string,
    source: Partial<KnowledgeSource>
  ): Promise<void>;
  removeKnowledgeSource(sourceId: string): Promise<void>;
  listKnowledgeSources(): Promise<KnowledgeSource[]>;

  // Data ingestion
  ingestDocuments(
    sourceId: string,
    documents: Document[]
  ): Promise<IngestionResult>;
  ingestFromSharePoint(config: SharePointConfig): Promise<IngestionResult>;
  ingestFromConfluence(config: ConfluenceConfig): Promise<IngestionResult>;
  ingestHistoricalData(
    data: HistoricalTroubleshootingData[]
  ): Promise<IngestionResult>;

  // Knowledge base operations
  searchKnowledgeBase(
    query: string,
    namespace?: string
  ): Promise<KnowledgeSearchResult[]>;
  validateKnowledgeBase(): Promise<ValidationResult>;
  getKnowledgeBaseMetrics(): Promise<KnowledgeBaseMetrics>;

  // Memory integration
  createMemoryNamespace(
    namespace: string,
    strategy: MemoryStrategy
  ): Promise<string>;
  configureSemanticExtraction(
    config: SemanticExtractionConfig
  ): Promise<void>;

  // Versioning
  createSnapshot(name: string, description?: string): Promise<Snapshot>;
  listSnapshots(): Promise<Snapshot[]>;
  rollbackToSnapshot(snapshotId: string): Promise<RollbackResult>;
}

/**
 * Implementation of Knowledge Base Manager
 */
export class KnowledgeBaseManager implements IKnowledgeBaseManager {
  private knowledgeSources: Map<string, KnowledgeSource> = new Map();
  private memoryNamespaces: Map<string, string> = new Map();
  private semanticConfig?: SemanticExtractionConfig;
  private sharePointConnector: SharePointConnector;
  private confluenceConnector: ConfluenceConnector;
  private fileSystemConnector: FileSystemConnector;
  private s3Connector: S3Connector;
  private historicalDataProcessor: HistoricalDataProcessor;
  private memoryClient: AgentCoreMemoryClient;
  private prioritizer: KnowledgePrioritizer;
  private versioning: KnowledgeBaseVersioning;

  constructor() {
    // Initialize with default configuration
    this.semanticConfig = {
      enabled: true,
      extractionModel: "anthropic.claude-3-5-sonnet-20241022-v2:0",
      chunkSize: 1000,
      chunkOverlap: 200,
      embeddingModel: "amazon.titan-embed-text-v2:0",
    };
    this.sharePointConnector = new SharePointConnector();
    this.confluenceConnector = new ConfluenceConnector();
    this.fileSystemConnector = new FileSystemConnector();
    this.s3Connector = new S3Connector();
    this.historicalDataProcessor = new HistoricalDataProcessor();
    this.memoryClient = new AgentCoreMemoryClient();
    this.prioritizer = new KnowledgePrioritizer();
    this.versioning = new KnowledgeBaseVersioning(this.knowledgeSources);
  }

  /**
   * Add a new knowledge source
   */
  async addKnowledgeSource(
    source: KnowledgeSource
  ): Promise<KnowledgeSourceResult> {
    // Validate source
    if (!source.id || !source.name || !source.type) {
      throw new Error("Invalid knowledge source: missing required fields");
    }

    // Check for duplicate ID
    if (this.knowledgeSources.has(source.id)) {
      throw new Error(`Knowledge source with ID ${source.id} already exists`);
    }

    // Store source with all provided fields
    this.knowledgeSources.set(source.id, {
      ...source,
      status: source.status || "ACTIVE",
      lastUpdated: new Date(),
    });

    return {
      sourceId: source.id,
      status: "SUCCESS",
      message: `Knowledge source '${source.name}' added successfully`,
    };
  }

  /**
   * Update an existing knowledge source
   */
  async updateKnowledgeSource(
    sourceId: string,
    source: Partial<KnowledgeSource>
  ): Promise<void> {
    const existingSource = this.knowledgeSources.get(sourceId);
    if (!existingSource) {
      throw new Error(`Knowledge source with ID ${sourceId} not found`);
    }

    // Update fields
    const updatedSource = {
      ...existingSource,
      ...source,
      lastUpdated: new Date(),
    };

    this.knowledgeSources.set(sourceId, updatedSource);
  }

  /**
   * Remove a knowledge source
   */
  async removeKnowledgeSource(sourceId: string): Promise<void> {
    if (!this.knowledgeSources.has(sourceId)) {
      throw new Error(`Knowledge source with ID ${sourceId} not found`);
    }

    this.knowledgeSources.delete(sourceId);
  }

  /**
   * List all knowledge sources
   */
  async listKnowledgeSources(): Promise<KnowledgeSource[]> {
    return Array.from(this.knowledgeSources.values());
  }

  /**
   * Ingest documents from a knowledge source
   */
  async ingestDocuments(
    sourceId: string,
    documents: Document[]
  ): Promise<IngestionResult> {
    const source = this.knowledgeSources.get(sourceId);
    if (!source) {
      throw new Error(`Knowledge source with ID ${sourceId} not found`);
    }

    // Update source status
    source.status = "INDEXING";
    this.knowledgeSources.set(sourceId, source);

    try {
      let result: IngestionResult;

      // If documents are provided directly, process them
      if (documents && documents.length > 0) {
        result = {
          success: true,
          documentsProcessed: documents.length,
          documentsFailed: 0,
        };
      } else {
        // Otherwise, route to appropriate connector based on source type
        switch (source.type) {
          case KnowledgeSourceType.FILE_SYSTEM:
            if (source.configuration.fileSystem) {
              result = await this.fileSystemConnector.syncDocuments(
                source.configuration.fileSystem
              );
            } else {
              throw new Error("File system configuration missing");
            }
            break;

          case KnowledgeSourceType.S3_BUCKET:
            if (source.configuration.s3) {
              result = await this.s3Connector.syncObjects(
                source.configuration.s3
              );
            } else {
              throw new Error("S3 configuration missing");
            }
            break;

          default:
            result = {
              success: true,
              documentsProcessed: 0,
              documentsFailed: 0,
            };
        }
      }

      // Update source
      source.status = "ACTIVE";
      source.documentCount += result.documentsProcessed;
      source.lastUpdated = new Date();
      this.knowledgeSources.set(sourceId, source);

      return result;
    } catch (error) {
      source.status = "FAILED";
      this.knowledgeSources.set(sourceId, source);

      return {
        success: false,
        documentsProcessed: 0,
        documentsFailed: documents.length,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Ingest documents from SharePoint
   */
  async ingestFromSharePoint(
    config: SharePointConfig
  ): Promise<IngestionResult> {
    return await this.sharePointConnector.syncDocuments(config);
  }

  /**
   * Ingest documents from Confluence
   */
  async ingestFromConfluence(
    config: ConfluenceConfig
  ): Promise<IngestionResult> {
    return await this.confluenceConnector.syncPages(config);
  }

  /**
   * Ingest historical troubleshooting data
   */
  async ingestHistoricalData(
    data: HistoricalTroubleshootingData[]
  ): Promise<IngestionResult> {
    try {
      // Validate data
      const validation = this.historicalDataProcessor.validateData(data);
      if (!validation.valid) {
        return {
          success: false,
          documentsProcessed: 0,
          documentsFailed: data.length,
          errors: validation.errors,
        };
      }

      // Transform to documents
      const documents = await this.historicalDataProcessor.transformToDocuments(
        data
      );

      // Extract patterns for future use
      const patterns = this.historicalDataProcessor.extractPatterns(data);

      return {
        success: true,
        documentsProcessed: documents.length,
        documentsFailed: 0,
      };
    } catch (error) {
      return {
        success: false,
        documentsProcessed: 0,
        documentsFailed: data.length,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Search the knowledge base
   */
  async searchKnowledgeBase(
    query: string,
    namespace?: string
  ): Promise<KnowledgeSearchResult[]> {
    const namespaces = namespace ? [namespace] : undefined;
    const results = await this.memoryClient.searchMemory(query, namespaces);

    // Get custom namespaces from knowledge sources
    const customNamespaces = Array.from(this.knowledgeSources.values())
      .map((source) => source.namespace)
      .filter((ns) => ns.startsWith('/org/'));

    // Prioritize custom knowledge
    return this.prioritizer.prioritizeResults(results, customNamespaces);
  }

  /**
   * Validate knowledge base integrity
   */
  async validateKnowledgeBase(): Promise<ValidationResult> {
    const sources = Array.from(this.knowledgeSources.values());
    const failedSources = sources.filter((s) => s.status === "FAILED");

    return {
      valid: failedSources.length === 0,
      errors: failedSources.map((s) => `Source ${s.name} is in FAILED state`),
      warnings: [],
    };
  }

  /**
   * Get knowledge base metrics
   */
  async getKnowledgeBaseMetrics(): Promise<KnowledgeBaseMetrics> {
    const sources = Array.from(this.knowledgeSources.values());

    const documentsBySource: Record<string, number> = {};
    const documentsByNamespace: Record<string, number> = {};
    let totalDocuments = 0;

    sources.forEach((source) => {
      documentsBySource[source.name] = source.documentCount;
      documentsByNamespace[source.namespace] =
        (documentsByNamespace[source.namespace] || 0) + source.documentCount;
      totalDocuments += source.documentCount;
    });

    return {
      totalDocuments,
      documentsBySource,
      documentsByNamespace,
      lastIndexingTime: new Date(),
      queriesUsingCustomKnowledge: 0, // Will be tracked in Task 6.12
      averageRelevanceScore: 0, // Will be tracked in Task 6.12
    };
  }

  /**
   * Create a memory namespace for knowledge storage
   */
  async createMemoryNamespace(
    namespace: string,
    strategy: MemoryStrategy
  ): Promise<string> {
    const namespaceId = await this.memoryClient.createNamespace(
      namespace,
      strategy
    );
    this.memoryNamespaces.set(namespace, namespaceId);
    return namespaceId;
  }

  /**
   * Configure semantic extraction for documents
   */
  async configureSemanticExtraction(
    config: SemanticExtractionConfig
  ): Promise<void> {
    this.semanticConfig = config;
  }

  /**
   * Get current semantic extraction configuration
   */
  getSemanticConfig(): SemanticExtractionConfig | undefined {
    return this.semanticConfig;
  }

  /**
   * Create a snapshot of current knowledge base state
   */
  async createSnapshot(name: string, description?: string): Promise<Snapshot> {
    return await this.versioning.createSnapshot(name, description);
  }

  /**
   * List all snapshots
   */
  async listSnapshots(): Promise<Snapshot[]> {
    return await this.versioning.listSnapshots();
  }

  /**
   * Rollback to a previous snapshot
   */
  async rollbackToSnapshot(snapshotId: string): Promise<RollbackResult> {
    return await this.versioning.rollbackToSnapshot(snapshotId);
  }
}
