/**
 * AgentCore Memory Client
 *
 * Integrates with AgentCore Power's Memory management capabilities
 * for semantic storage and retrieval of custom knowledge
 */

import {
  Document,
  MemoryStrategy,
  SemanticExtractionConfig,
  KnowledgeSearchResult,
} from '../types';

export interface IAgentCoreMemoryClient {
  // Memory namespace management
  createNamespace(
    namespace: string,
    strategy: MemoryStrategy
  ): Promise<string>;
  deleteNamespace(namespace: string): Promise<void>;
  listNamespaces(): Promise<string[]>;

  // Document storage
  storeDocuments(
    namespace: string,
    documents: Document[]
  ): Promise<StorageResult>;
  updateDocument(
    namespace: string,
    documentId: string,
    document: Partial<Document>
  ): Promise<void>;
  deleteDocument(namespace: string, documentId: string): Promise<void>;

  // Semantic search
  searchMemory(
    query: string,
    namespaces?: string[],
    maxResults?: number
  ): Promise<KnowledgeSearchResult[]>;

  // Configuration
  configureSemanticExtraction(
    namespace: string,
    config: SemanticExtractionConfig
  ): Promise<void>;
  getMemoryStats(namespace: string): Promise<MemoryStats>;
}

export interface StorageResult {
  success: boolean;
  documentsStored: number;
  documentsFailed: number;
  errors?: string[];
}

export interface MemoryStats {
  namespace: string;
  documentCount: number;
  totalSize: number;
  lastUpdated: Date;
  semanticExtractionEnabled: boolean;
}

/**
 * AgentCore Memory client implementation
 */
export class AgentCoreMemoryClient implements IAgentCoreMemoryClient {
  private namespaces: Map<string, MemoryNamespace> = new Map();

  /**
   * Create a memory namespace
   */
  async createNamespace(
    namespace: string,
    strategy: MemoryStrategy
  ): Promise<string> {
    if (this.namespaces.has(namespace)) {
      throw new Error(`Namespace ${namespace} already exists`);
    }

    const memoryNamespace: MemoryNamespace = {
      name: namespace,
      strategy,
      documents: new Map(),
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    this.namespaces.set(namespace, memoryNamespace);

    // In real implementation, would call AgentCore Power's Memory API
    return `memory-namespace-${namespace}`;
  }

  /**
   * Delete a memory namespace
   */
  async deleteNamespace(namespace: string): Promise<void> {
    if (!this.namespaces.has(namespace)) {
      throw new Error(`Namespace ${namespace} not found`);
    }

    this.namespaces.delete(namespace);
  }

  /**
   * List all memory namespaces
   */
  async listNamespaces(): Promise<string[]> {
    return Array.from(this.namespaces.keys());
  }

  /**
   * Store documents in memory namespace
   */
  async storeDocuments(
    namespace: string,
    documents: Document[]
  ): Promise<StorageResult> {
    const memoryNamespace = this.namespaces.get(namespace);
    if (!memoryNamespace) {
      throw new Error(`Namespace ${namespace} not found`);
    }

    try {
      const errors: string[] = [];

      for (const doc of documents) {
        try {
          // Store document with semantic extraction
          memoryNamespace.documents.set(doc.id, doc);
        } catch (error) {
          errors.push(
            `Failed to store ${doc.id}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      memoryNamespace.lastUpdated = new Date();

      return {
        success: errors.length === 0,
        documentsStored: documents.length - errors.length,
        documentsFailed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        documentsStored: 0,
        documentsFailed: documents.length,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Update a document in memory
   */
  async updateDocument(
    namespace: string,
    documentId: string,
    document: Partial<Document>
  ): Promise<void> {
    const memoryNamespace = this.namespaces.get(namespace);
    if (!memoryNamespace) {
      throw new Error(`Namespace ${namespace} not found`);
    }

    const existingDoc = memoryNamespace.documents.get(documentId);
    if (!existingDoc) {
      throw new Error(`Document ${documentId} not found in namespace ${namespace}`);
    }

    const updatedDoc = { ...existingDoc, ...document };
    memoryNamespace.documents.set(documentId, updatedDoc);
    memoryNamespace.lastUpdated = new Date();
  }

  /**
   * Delete a document from memory
   */
  async deleteDocument(namespace: string, documentId: string): Promise<void> {
    const memoryNamespace = this.namespaces.get(namespace);
    if (!memoryNamespace) {
      throw new Error(`Namespace ${namespace} not found`);
    }

    if (!memoryNamespace.documents.has(documentId)) {
      throw new Error(`Document ${documentId} not found in namespace ${namespace}`);
    }

    memoryNamespace.documents.delete(documentId);
    memoryNamespace.lastUpdated = new Date();
  }

  /**
   * Search memory using semantic search
   */
  async searchMemory(
    query: string,
    namespaces?: string[],
    maxResults: number = 10
  ): Promise<KnowledgeSearchResult[]> {
    const results: KnowledgeSearchResult[] = [];
    const namespacesToSearch = namespaces || Array.from(this.namespaces.keys());

    for (const namespace of namespacesToSearch) {
      const memoryNamespace = this.namespaces.get(namespace);
      if (!memoryNamespace) continue;

      // Simple text search (in real implementation, would use semantic embeddings)
      for (const [docId, doc] of memoryNamespace.documents) {
        const relevanceScore = this.calculateRelevance(query, doc);
        if (relevanceScore > 0) {
          results.push({
            documentId: docId,
            title: doc.title,
            snippet: this.extractSnippet(doc.content, query),
            relevanceScore,
            namespace,
            source: doc.source,
          });
        }
      }
    }

    // Sort by relevance and limit results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  /**
   * Configure semantic extraction for namespace
   */
  async configureSemanticExtraction(
    namespace: string,
    config: SemanticExtractionConfig
  ): Promise<void> {
    const memoryNamespace = this.namespaces.get(namespace);
    if (!memoryNamespace) {
      throw new Error(`Namespace ${namespace} not found`);
    }

    // Store configuration (in real implementation, would configure AgentCore Memory)
    memoryNamespace.semanticConfig = config;
  }

  /**
   * Get memory statistics for namespace
   */
  async getMemoryStats(namespace: string): Promise<MemoryStats> {
    const memoryNamespace = this.namespaces.get(namespace);
    if (!memoryNamespace) {
      throw new Error(`Namespace ${namespace} not found`);
    }

    const documents = Array.from(memoryNamespace.documents.values());
    const totalSize = documents.reduce(
      (sum, doc) => sum + doc.content.length,
      0
    );

    return {
      namespace,
      documentCount: documents.length,
      totalSize,
      lastUpdated: memoryNamespace.lastUpdated,
      semanticExtractionEnabled: memoryNamespace.semanticConfig?.enabled || false,
    };
  }

  /**
   * Calculate relevance score (simple text matching)
   */
  private calculateRelevance(query: string, document: Document): number {
    const queryLower = query.toLowerCase();
    const contentLower = document.content.toLowerCase();
    const titleLower = document.title.toLowerCase();

    let score = 0;

    // Title match is worth more
    if (titleLower.includes(queryLower)) {
      score += 0.5;
    }

    // Content match
    const matches = (contentLower.match(new RegExp(queryLower, 'g')) || []).length;
    score += Math.min(matches * 0.1, 0.5);

    return Math.min(score, 1.0);
  }

  /**
   * Extract snippet around query match
   */
  private extractSnippet(content: string, query: string, contextLength: number = 100): string {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const index = contentLower.indexOf(queryLower);

    if (index === -1) {
      return content.substring(0, contextLength) + '...';
    }

    const start = Math.max(0, index - contextLength / 2);
    const end = Math.min(content.length, index + query.length + contextLength / 2);

    let snippet = content.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }
}

interface MemoryNamespace {
  name: string;
  strategy: MemoryStrategy;
  documents: Map<string, Document>;
  createdAt: Date;
  lastUpdated: Date;
  semanticConfig?: SemanticExtractionConfig;
}
