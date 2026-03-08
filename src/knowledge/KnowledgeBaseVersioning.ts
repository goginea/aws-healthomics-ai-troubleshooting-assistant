/**
 * Knowledge Base Versioning
 *
 * Supports snapshots and rollback for knowledge base state
 */

import { KnowledgeSource } from '../types';

export interface IKnowledgeBaseVersioning {
  createSnapshot(name: string, description?: string): Promise<Snapshot>;
  listSnapshots(): Promise<Snapshot[]>;
  getSnapshot(snapshotId: string): Promise<Snapshot>;
  rollbackToSnapshot(snapshotId: string): Promise<RollbackResult>;
  deleteSnapshot(snapshotId: string): Promise<void>;
}

export interface Snapshot {
  id: string;
  name: string;
  description?: string;
  timestamp: Date;
  knowledgeSources: KnowledgeSource[];
  documentCount: number;
}

export interface RollbackResult {
  success: boolean;
  snapshotId: string;
  sourcesRestored: number;
  errors?: string[];
}

/**
 * Knowledge base versioning implementation
 */
export class KnowledgeBaseVersioning implements IKnowledgeBaseVersioning {
  private snapshots: Map<string, Snapshot> = new Map();
  private currentSources: Map<string, KnowledgeSource>;

  constructor(currentSources: Map<string, KnowledgeSource>) {
    this.currentSources = currentSources;
  }

  /**
   * Create a snapshot of current knowledge base state
   */
  async createSnapshot(
    name: string,
    description?: string
  ): Promise<Snapshot> {
    const snapshotId = `snapshot-${Date.now()}`;
    const sources = Array.from(this.currentSources.values());

    const snapshot: Snapshot = {
      id: snapshotId,
      name,
      description,
      timestamp: new Date(),
      knowledgeSources: JSON.parse(JSON.stringify(sources)), // Deep copy
      documentCount: sources.reduce((sum, s) => sum + s.documentCount, 0),
    };

    this.snapshots.set(snapshotId, snapshot);
    return snapshot;
  }

  /**
   * List all snapshots
   */
  async listSnapshots(): Promise<Snapshot[]> {
    return Array.from(this.snapshots.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get a specific snapshot
   */
  async getSnapshot(snapshotId: string): Promise<Snapshot> {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }
    return snapshot;
  }

  /**
   * Rollback to a previous snapshot
   */
  async rollbackToSnapshot(snapshotId: string): Promise<RollbackResult> {
    const snapshot = await this.getSnapshot(snapshotId);

    try {
      // Clear current sources
      this.currentSources.clear();

      // Restore sources from snapshot
      for (const source of snapshot.knowledgeSources) {
        this.currentSources.set(source.id, JSON.parse(JSON.stringify(source)));
      }

      return {
        success: true,
        snapshotId,
        sourcesRestored: snapshot.knowledgeSources.length,
      };
    } catch (error) {
      return {
        success: false,
        snapshotId,
        sourcesRestored: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Delete a snapshot
   */
  async deleteSnapshot(snapshotId: string): Promise<void> {
    if (!this.snapshots.has(snapshotId)) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }
    this.snapshots.delete(snapshotId);
  }
}
